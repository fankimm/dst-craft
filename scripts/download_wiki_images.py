#!/usr/bin/env python3
"""Download missing DST item/material images from the wiki."""
import json, os, sys, time, urllib.request, urllib.parse, subprocess

UA = "DST-Craft-Wiki-Bot/1.0 (personal project)"
API = "https://dontstarve.wiki.gg/api.php"
HEADERS = {"User-Agent": UA}

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
    except Exception:
        pass
    return False

def get_missing(needed_file, existing_dir):
    """Get list of missing image filenames."""
    needed = set()
    with open(needed_file) as f:
        for line in f:
            line = line.strip()
            if line:
                needed.add(line)
    existing = set(os.listdir(existing_dir))
    return sorted(needed - existing)

# Wiki name variations to try for each file
def get_wiki_names(filename):
    """Generate possible wiki file names for a given filename."""
    base = filename.replace('.png', '')
    decoded = base.replace('%27', "'")

    variations = [
        decoded,  # Original
        decoded.replace("_Build", ""),  # Without _Build suffix
        decoded + "_Build",  # With _Build suffix
    ]

    # Common renames in DST wiki
    renames = {
        "Battle_Rond": "Battle_Rönd",
        "Commanders_Helm": "Commander's_Helm",
        "Clockmakers_Tools": "Clockmaker's_Tools",
        "Pick_Axe": "Opulent_Pickaxe",
        "Regal_Shovel": "Regal_Shovel",
        "Construction_Amulet": "Construction_Amulet",
        "Deconstruction_Staff": "Deconstruction_Staff",
        "Dapper_Vest": "Dapper_Vest",
        "Desert_Goggles": "Desert_Goggles",
        "Fashion_Goggles": "Fashion_Goggles",
        "Flower_Hat": "Flower_Hat",
        "Cookie_Cutter_Cap": "Cookie_Cutter_Cap",
        "Hibearnation_Vest": "Hibearnation_Vest",
        "Snurtle_Shell_Armor": "Snurtle_Shell_Armour",
        "Heat_Stone": "Thermal_Stone",
        "Summer_Frest": "Summer_Frest",
        "Gunpowder": "Gunpowder",
        "Moon_Glass": "Moon_Glass",
        "Moon_Glass_Axe": "Moon_Glass_Axe",
        "Thulecite_Club": "Thulecite_Club",
        "Thulecite_Fragments": "Thulecite_Fragments",
        "Shadow_Thurible": "Shadow_Thurible",
        "Electric_Dart": "Electric_Dart",
        "Elding_Spear": "Elding_Spear",
        "Dark_Lament": "Dark_Lament",
        "Enlightened_Lullaby": "Enlightened_Lullaby",
        "Lazy_Forager": "The_Lazy_Forager",
        "Improved_Farm": "Improved_Farm",
        "Garden_Rigamajig": "Garden_Rigamajig",
        "Heavy_Weighted_Lure": "Heavy_Weighted_Lure",
        "Wobbler": "Wobbler",
        "Rain_Fisher": "Rain_Fisher",
        "Pylon": "Pylon",
        "Fire_Pump": "Fire_Pump",
        "Deck_Illuminator": "Deck_Illuminator",
        "Lightning_Conductor": "Lightning_Conductor",
        "Steering_Wheel_Stand": "Steering_Wheel_Stand",
        "Log_Raft_Kit": "Log_Raft",
        "Grass_Raft_Kit": "Grass_Raft",
        "Kelp_Bumper": "Kelp_Bumper",
        "Shell_Bumper": "Shell_Bumper",
        "Scaled_Furnace": "Scaled_Furnace",
        "Salt_Lick": "Salt_Lick",
        "Tree_Planter": "Tree_Planter",
        "Wall_Lantern": "Wall_Lantern",
        "Scarecrow": "Friendly_Scarecrow",
        "Potter_Sculpture": "Potter_Sculpture",
        "Potted_Tree": "Potted_Tree",
        "Mini_Sign": "Mini_Sign",
        "Directional_Sign": "Directional_Sign",
        "Reviver": "Reviver",
        "Marble_Rounds": "Marble_Rounds",
        "Poop_Pellets": "Poop_Pellets",
        "Portable_Seasoning_Station": "Portable_Seasoning_Station",
        "Wooden_Walking_Stick": "Wooden_Walking_Stick",
        # Wigfrid songs
        "Weaponized_Warble": "Weaponized_Warble",
        "Startling_Soliloquy": "Startling_Soliloquy",
        "Fireproof_Falsetto": "Fireproof_Falsetto",
        # Wendy elixirs
        "Vigor_Mortis": "Vigor_Mortis",
        "Nightshade_Nostrum": "Nightshade_Nostrum",
        "Spectral_Cure-All": "Spectral_Cure-All",
        "Distilled_Vengeance": "Distilled_Vengeance",
        "Revenant_Restorative": "Revenant_Restorative",
        "Ghastly_Experience": "Ghastly_Experience",
        "Cursed_Vexation": "Cursed_Vexation",
        # Wickerbottom books
        "Lux_Aeterna": "Lux_Aeterna",
        "Lunar_Grimoire": "Lunar_Grimoire",
        "Overcoming_Arachnophobia": "Overcoming_Arachnophobia",
        "Practical_Rain_Rituals": "Practical_Rain_Rituals",
        # Woodie
        "Kitschy_Beaver_Idol": "Kitschy_Beaver_Idol",
        "Kitschy_Moose_Idol": "Kitschy_Moose_Idol",
        "Kitschy_Goose_Idol": "Kitschy_Goose_Idol",
        # Other
        "Den_Decorating_Set": "Den_Decorating_Set",
        "Shoo_Box": "Shoo_Box",
        "Healing_Glop": "Healing_Glop",
        "DIY_Royalty_Kit": "DIY_Royalty_Kit",
        "Craftsmerm_House": "Craftsmerm_House",
        "Second_Chance_Watch": "Second_Chance_Watch",
    }

    if decoded in renames:
        variations.insert(0, renames[decoded])

    return [f"File:{v}.png" for v in variations]

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "items"

    if mode == "items":
        needed_file = "/tmp/items_needed.txt"
        out_dir = "public/images/items"
    else:
        needed_file = "/tmp/materials_needed.txt"
        out_dir = "public/images/materials"

    missing = get_missing(needed_file, out_dir)
    print(f"Missing {mode}: {len(missing)}")

    success = 0
    fail = 0
    failed_list = []

    # Process in batches of 50 for API queries
    for i in range(0, len(missing), 10):
        batch = missing[i:i+10]
        all_titles = []
        title_map = {}  # wiki_title -> local_filename

        for filename in batch:
            wiki_names = get_wiki_names(filename)
            for wn in wiki_names:
                all_titles.append(wn)
                title_map[wn] = filename

        # Query API
        try:
            result = api_query(all_titles[:50])
            pages = result.get("query", {}).get("pages", {})

            downloaded = set()
            for pid, page in pages.items():
                if int(pid) < 0:
                    continue  # Missing page
                title = page.get("title", "")
                info = page.get("imageinfo", [])
                if not info:
                    continue
                url = info[0]["url"]
                local = title_map.get(title)
                if local and local not in downloaded:
                    path = os.path.join(out_dir, local)
                    if download(url, path):
                        downloaded.add(local)
                        success += 1
                        print(f"  OK: {local}")
                    time.sleep(0.3)

            for filename in batch:
                if filename not in downloaded:
                    fail += 1
                    failed_list.append(filename)
                    print(f"  MISS: {filename}")

        except Exception as e:
            print(f"  API Error: {e}")
            for filename in batch:
                fail += 1
                failed_list.append(filename)

        time.sleep(1)

    print(f"\n결과: 성공 {success} / 실패 {fail}")
    if failed_list:
        print("실패 목록:")
        for f in failed_list:
            print(f"  - {f}")

if __name__ == "__main__":
    main()
