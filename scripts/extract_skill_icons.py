#!/usr/bin/env python3
"""Extract individual skill icons from DST's skilltree_icons.tex atlas.

Reads the TEX (Klei DXT5 texture) and XML atlas definition, then extracts
each named icon as a 64x64 PNG into public/images/skill-icons/.

Dependencies: pip install Pillow

TEX format reference (Klei Entertainment):
  - Header: KTEX magic (4 bytes), then platform/flags, then specs
  - Image data: DXT5 compressed (BC3)
"""
import struct, sys, os, xml.etree.ElementTree as ET
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    print("Pillow is required. Install with: pip3 install Pillow")
    sys.exit(1)

TEX_FILE = "/tmp/dst-icons/images/skilltree_icons.tex"
XML_FILE = "/tmp/dst-icons/images/skilltree_icons.xml"
OUT_DIR = "public/images/skill-icons"

def decode_dxt5_block(data, offset):
    """Decode a single 4x4 DXT5 block into 16 RGBA pixels."""
    # Alpha
    alpha0 = data[offset]
    alpha1 = data[offset + 1]
    alpha_bits = int.from_bytes(data[offset+2:offset+8], 'little')

    alphas = [alpha0, alpha1]
    if alpha0 > alpha1:
        for i in range(1, 7):
            alphas.append(((7 - i) * alpha0 + i * alpha1) // 7)
    else:
        for i in range(1, 5):
            alphas.append(((5 - i) * alpha0 + i * alpha1) // 5)
        alphas.append(0)
        alphas.append(255)

    alpha_values = []
    for i in range(16):
        idx = (alpha_bits >> (i * 3)) & 0x7
        alpha_values.append(alphas[idx])

    # Color (same as DXT1)
    c0 = struct.unpack_from('<H', data, offset + 8)[0]
    c1 = struct.unpack_from('<H', data, offset + 10)[0]
    color_bits = struct.unpack_from('<I', data, offset + 12)[0]

    r0 = ((c0 >> 11) & 0x1f) * 255 // 31
    g0 = ((c0 >> 5) & 0x3f) * 255 // 63
    b0 = (c0 & 0x1f) * 255 // 31
    r1 = ((c1 >> 11) & 0x1f) * 255 // 31
    g1 = ((c1 >> 5) & 0x3f) * 255 // 63
    b1 = (c1 & 0x1f) * 255 // 31

    colors = [
        (r0, g0, b0),
        (r1, g1, b1),
        ((2*r0 + r1)//3, (2*g0 + g1)//3, (2*b0 + b1)//3),
        ((r0 + 2*r1)//3, (g0 + 2*g1)//3, (b0 + 2*b1)//3),
    ]

    pixels = []
    for i in range(16):
        ci = (color_bits >> (i * 2)) & 0x3
        r, g, b = colors[ci]
        a = alpha_values[i]
        pixels.append((r, g, b, a))

    return pixels

def decode_dxt5(data, width, height):
    """Decode DXT5 compressed data to RGBA image."""
    img = Image.new('RGBA', (width, height))
    pixels = img.load()

    block_w = (width + 3) // 4
    block_h = (height + 3) // 4
    offset = 0

    for by in range(block_h):
        for bx in range(block_w):
            block_pixels = decode_dxt5_block(data, offset)
            offset += 16

            for i in range(16):
                px = bx * 4 + (i % 4)
                py = by * 4 + (i // 4)
                if px < width and py < height:
                    pixels[px, py] = block_pixels[i]

    return img

def read_ktex(filepath):
    """Read a Klei TEX file and return the decoded RGBA image."""
    with open(filepath, 'rb') as f:
        data = f.read()

    # KTEX header parsing
    # First 4 bytes: "KTEX" magic
    magic = data[:4]
    if magic != b'KTEX':
        raise ValueError(f"Not a KTEX file: {magic}")

    # Header fields (packed in a uint32 after magic)
    header = struct.unpack_from('<I', data, 4)[0]
    platform = header & 0xF
    pixel_format = (header >> 4) & 0x1F
    texture_type = (header >> 9) & 0xF
    num_mips = (header >> 13) & 0x1F
    flags = (header >> 18) & 0x3

    # Mipmap info starts at offset 8
    # Each mip has: width (u16), height (u16), pitch (u16), data_size (u32)
    mip_offset = 8
    mip_width = struct.unpack_from('<H', data, mip_offset)[0]
    mip_height = struct.unpack_from('<H', data, mip_offset + 2)[0]
    mip_pitch = struct.unpack_from('<H', data, mip_offset + 4)[0]
    mip_data_size = struct.unpack_from('<I', data, mip_offset + 6)[0]

    # Image data starts after all mip headers
    data_offset = 8 + num_mips * 10
    img_data = data[data_offset:data_offset + mip_data_size]

    # pixel_format: 0=DXT1, 1=DXT3, 2=DXT5, 4=ARGB, 5=RGB, 7=A8
    if pixel_format == 2:  # DXT5
        return decode_dxt5(img_data, mip_width, mip_height)
    elif pixel_format == 0:  # DXT1
        # For DXT1, use similar approach but 8 bytes per block
        raise ValueError("DXT1 format not implemented yet")
    else:
        raise ValueError(f"Unsupported pixel format: {pixel_format}")

def extract_icons():
    """Parse the XML atlas and extract individual icons from the TEX."""
    os.makedirs(OUT_DIR, exist_ok=True)

    # Parse atlas XML
    tree_et = ET.parse(XML_FILE)
    root = tree_et.getroot()
    elements = root.findall('.//Element')

    print(f"Found {len(elements)} icons in atlas")

    # Decode the full texture
    print("Decoding TEX file...")
    try:
        full_img = read_ktex(TEX_FILE)
    except Exception as e:
        print(f"Error decoding TEX: {e}")
        print("Trying alternative header format...")
        # Some TEX files have slightly different headers
        with open(TEX_FILE, 'rb') as f:
            data = f.read()

        # Try reading raw DXT5 after finding dimensions
        # Scan for reasonable dimensions
        for offset in range(4, 20):
            w = struct.unpack_from('<H', data, offset)[0]
            h = struct.unpack_from('<H', data, offset + 2)[0]
            if 256 <= w <= 4096 and 256 <= h <= 4096 and w == h:
                print(f"  Trying dimensions {w}x{h} at offset {offset}")
                expected_size = (w // 4) * (h // 4) * 16  # DXT5: 16 bytes per 4x4 block
                # Try different data offsets
                for doff in range(offset + 10, offset + 30):
                    if doff + expected_size <= len(data):
                        try:
                            full_img = decode_dxt5(data[doff:doff + expected_size], w, h)
                            print(f"  Success! Decoded {w}x{h} from offset {doff}")
                            break
                        except:
                            continue
                else:
                    continue
                break
        else:
            print("Failed to decode TEX file")
            return

    tex_w, tex_h = full_img.size
    print(f"Texture size: {tex_w}x{tex_h}")

    # Extract each icon
    success = 0
    skip = 0
    for elem in elements:
        name = elem.get('name', '').replace('.tex', '')
        u1 = float(elem.get('u1', 0))
        u2 = float(elem.get('u2', 0))
        v1 = float(elem.get('v1', 0))
        v2 = float(elem.get('v2', 0))

        # Convert UV to pixel coordinates (Klei TEX: top-left origin, no V flip)
        x1 = int(u1 * tex_w)
        x2 = int(u2 * tex_w)
        y1 = int(v1 * tex_h)
        y2 = int(v2 * tex_h)

        out_path = os.path.join(OUT_DIR, f"{name}.png")

        # Always overwrite — re-extract all icons from atlas

        # Crop the icon
        icon = full_img.crop((x1, y1, x2, y2))

        # Flip vertically (Klei TEX stores images upside down)
        icon = icon.transpose(Image.FLIP_TOP_BOTTOM)

        # Resize to 64x64 if needed
        if icon.size != (64, 64):
            icon = icon.resize((64, 64), Image.LANCZOS)

        icon.save(out_path, 'PNG')
        success += 1

    print(f"\nExtracted: {success}, Skipped (existing): {skip}")

if __name__ == "__main__":
    extract_icons()
