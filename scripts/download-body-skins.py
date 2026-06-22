#!/usr/bin/env python3
"""
Download character full-body skin images from dontstarve.wiki.gg.

For each of the 18 DST characters, fetches /wiki/<Char>/Gallery, extracts
in_game.png references, and downloads the 250px thumbnail to
public/images/skins-body/<filename>.

Why thumbs (not originals): wiki ships 250px webp/png thumbs that are
sufficient for our skin card grid and are ~10× smaller than originals.

License: wiki.gg content is CC BY-SA 3.0/4.0. Source attribution is rendered
in the Skins tab footer (see SkinsApp.tsx).

Idempotent — re-runs only fetch missing files. Rate-limited (0.5s between
requests) so we're a courteous client.
"""
from __future__ import annotations

import re
import subprocess
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = REPO_ROOT / "public" / "images" / "skins-body"
WIKI_BASE = "https://dontstarve.wiki.gg"

# Display name → wiki page slug. Wiki URLs use the canonical character name.
CHARACTERS: dict[str, str] = {
    "wilson": "Wilson",
    "willow": "Willow",
    "wolfgang": "Wolfgang",
    "wendy": "Wendy",
    "wickerbottom": "Wickerbottom",
    "wx78": "WX-78",
    "wes": "Wes",
    "maxwell": "Maxwell",
    "woodie": "Woodie",
    "wigfrid": "Wigfrid",
    "webber": "Webber",
    "winona": "Winona",
    "warly": "Warly",
    "wortox": "Wortox",
    "wormwood": "Wormwood",
    "wurt": "Wurt",
    "walter": "Walter",
    "wanda": "Wanda",
}

USER_AGENT = "DST-Craft-Skin-Sync/0.27 (+https://www.dstcraft.com; contact balocoding@gmail.com)"
DELAY_SEC = 0.5  # between requests — courteous to wiki.gg


class HttpError(Exception):
    def __init__(self, status: int, url: str):
        super().__init__(f"HTTP {status} for {url}")
        self.status = status


def fetch(url: str) -> bytes:
    """Curl-backed GET (avoids Python's stale CA bundle on this machine)."""
    # -fS makes curl exit non-zero on HTTP error and print error to stderr but
    # not the progress bar. -L follows redirects, -A sets User-Agent.
    proc = subprocess.run(
        [
            "curl", "-fsSL", "--max-time", "20",
            "-A", USER_AGENT,
            "-w", "\n%{http_code}",
            url,
        ],
        capture_output=True,
    )
    if proc.returncode != 0:
        # parse status from trailing line if possible; otherwise generic error.
        tail = proc.stdout.rsplit(b"\n", 1)
        status = 0
        if len(tail) == 2 and tail[1].isdigit():
            status = int(tail[1])
        raise HttpError(status or proc.returncode, url)
    body, _, _status = proc.stdout.rpartition(b"\n")
    return body


def gallery_url(char_slug: str) -> str:
    return f"{WIKI_BASE}/wiki/{char_slug}/Gallery"


def extract_in_game_filenames(html: str, char_slug: str) -> list[str]:
    """Pull every '<Char>_<...>_in_game.png' filename out of the gallery HTML."""
    # Char slug may contain a hyphen (WX-78) — wiki replaces it with underscore inside filenames.
    file_slug = char_slug.replace("-", "_")
    pattern = re.compile(
        rf'\b{re.escape(file_slug)}_[A-Za-z0-9_]+_in_game\.png\b'
    )
    return sorted(set(pattern.findall(html)))


def thumb_url(filename: str) -> str:
    """wiki.gg thumbnail URL — 250px PNG version of an in_game image."""
    return f"{WIKI_BASE}/images/thumb/{filename}/250px-{filename}"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    summary: dict[str, int] = {}
    total_downloaded = 0
    total_skipped = 0
    total_failed = 0

    for char_key, slug in CHARACTERS.items():
        print(f"\n=== {char_key} ({slug}) ===")
        try:
            html = fetch(gallery_url(slug)).decode("utf-8", errors="replace")
        except HttpError as e:
            print(f"  gallery fetch failed: {e}")
            continue
        time.sleep(DELAY_SEC)

        filenames = extract_in_game_filenames(html, slug)
        if not filenames:
            print("  no in_game.png matches — wiki page format may have changed")
            continue
        print(f"  {len(filenames)} images discovered")

        downloaded = skipped = failed = 0
        for fn in filenames:
            local_path = OUTPUT_DIR / fn
            if local_path.exists():
                skipped += 1
                continue
            try:
                blob = fetch(thumb_url(fn))
                local_path.write_bytes(blob)
                downloaded += 1
                time.sleep(DELAY_SEC)
            except HttpError as e:
                # Some entries listed in gallery may not have a thumb yet (404).
                print(f"    skip {fn}: {e}")
                failed += 1
                time.sleep(DELAY_SEC)
            except Exception as e:
                print(f"    error {fn}: {e}")
                failed += 1

        print(f"  downloaded={downloaded} skipped(existing)={skipped} failed={failed}")
        summary[char_key] = downloaded + skipped
        total_downloaded += downloaded
        total_skipped += skipped
        total_failed += failed

    print(f"\nTotal: {total_downloaded} new, {total_skipped} cached, {total_failed} failed")
    print(f"Per character (downloaded + cached):")
    for c, n in sorted(summary.items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
