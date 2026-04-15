#!/usr/bin/env python3
"""Download missing skill tree icons from the DST Wiki.

Usage: python3 scripts/download_skill_icons.py

The script reads skill icon names from the data files, checks which PNGs
are missing from public/images/skill-icons/, and downloads them from
dontstarve.wiki.gg using the English skill title as the wiki filename.
"""
import json, os, re, sys, time, urllib.request, urllib.parse

UA = "DST-Craft-Wiki-Bot/1.0 (personal project)"
API = "https://dontstarve.wiki.gg/api.php"
HEADERS = {"User-Agent": UA}
OUT_DIR = "public/images/skill-icons"

def api_query(titles):
    """Query wiki API for image info of up to 50 files."""
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": "|".join(titles),
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json",
    })
    req = urllib.request.Request(f"{API}?{params}", headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)

def download(url, path):
    """Download a file from URL."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            if data[:4] == b'\x89PNG':
                with open(path, 'wb') as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"    Download error: {e}")
    return False

def extract_icon_to_title_map():
    """Extract icon name → English title mapping from translations.ts."""
    trans_file = "src/data/skill-trees/translations.ts"
    with open(trans_file) as f:
        content = f.read()

    # Parse: skill_id: { title: { en: "English Title", ...
    pattern = r'(\w+):\s*\{\s*title:\s*\{\s*en:\s*"([^"]+)"'
    matches = re.findall(pattern, content)
    return {skill_id: en_title for skill_id, en_title in matches}

def extract_needed_icons():
    """Extract all icon names referenced in skill tree data files."""
    icons = set()
    data_dir = "src/data/skill-trees"
    for fname in os.listdir(data_dir):
        if not fname.endswith(".ts") or fname in ("types.ts", "index.ts", "registry.ts", "translations.ts", "skill-items.ts"):
            continue
        with open(os.path.join(data_dir, fname)) as f:
            content = f.read()
        for m in re.finditer(r'icon:\s*"([^"]+)"', content):
            icons.add(m.group(1))
    return icons

def get_wiki_names(en_title):
    """Generate possible wiki file names for a skill title."""
    # Replace spaces with underscores
    base = en_title.replace(" ", "_")

    variations = [
        f"File:{base}.png",
        f"File:{base}_Build.png",
    ]

    # Try with "Skill" prefix
    variations.append(f"File:Skill_{base}.png")

    return variations

def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # Get existing icons
    existing = {f.replace('.png', '') for f in os.listdir(OUT_DIR) if f.endswith('.png')}

    # Get needed icons
    needed = extract_needed_icons()
    missing = sorted(needed - existing)

    if not missing:
        print("All skill icons are present!")
        return

    print(f"Missing skill icons: {len(missing)}")

    # Get icon → title mapping
    id_to_title = extract_icon_to_title_map()

    success = 0
    fail = 0
    failed_list = []

    # Process in batches
    for i in range(0, len(missing), 5):
        batch = missing[i:i+5]
        all_titles = []
        title_map = {}  # wiki_title -> (icon_name, en_title)

        for icon_name in batch:
            # Try to find the English title for this icon
            # Icon name may differ from skill ID (e.g., wilson_torch_time_1 vs wilson_torch_1)
            en_title = id_to_title.get(icon_name)

            if not en_title:
                # Try matching by looking at the original skill ID (icon might be different)
                # Look through all translations for a match
                for sid, title in id_to_title.items():
                    if sid == icon_name or icon_name.startswith(sid):
                        en_title = title
                        break

            if not en_title:
                # Fallback: convert icon name to title case
                en_title = icon_name.replace("_", " ").title()

            wiki_names = get_wiki_names(en_title)
            for wn in wiki_names:
                all_titles.append(wn)
                title_map[wn] = icon_name

        # Query API (max 50 titles per query)
        try:
            result = api_query(all_titles[:50])
            pages = result.get("query", {}).get("pages", {})

            downloaded = set()
            for pid, page in pages.items():
                if int(pid) < 0:
                    continue
                title = page.get("title", "")
                info = page.get("imageinfo", [])
                if not info:
                    continue
                url = info[0]["url"]
                icon_name = title_map.get(title)
                if icon_name and icon_name not in downloaded:
                    path = os.path.join(OUT_DIR, f"{icon_name}.png")
                    if download(url, path):
                        downloaded.add(icon_name)
                        success += 1
                        print(f"  OK: {icon_name}")
                    time.sleep(0.3)

            for icon_name in batch:
                if icon_name not in downloaded:
                    fail += 1
                    en_title = id_to_title.get(icon_name, "?")
                    failed_list.append(f"{icon_name} ({en_title})")
                    print(f"  MISS: {icon_name} (tried: {en_title})")

        except Exception as e:
            print(f"  API Error: {e}")
            for icon_name in batch:
                fail += 1
                failed_list.append(icon_name)

        time.sleep(1)

    print(f"\nResult: success {success} / fail {fail}")
    if failed_list:
        print("\nFailed list:")
        for f in failed_list:
            print(f"  - {f}")

if __name__ == "__main__":
    main()
