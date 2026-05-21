#!/usr/bin/env python3
"""IndexNow ping — sitemap.xml의 모든 URL을 IndexNow API에 제출해
검색엔진(Bing, Yandex, Naver, Seznam 등)의 즉시 색인을 유도한다.

prod 배포(scripts/deploy-frontend.sh main)에서만 호출한다. best-effort —
실패해도 배포 자체는 성공 처리(호출측에서 `|| ...`로 흡수).

사용:
  indexnow-ping.py <sitemap.xml 경로 또는 URL>

키 파일: public/<KEY>.txt (정적 export에 포함되어 https://www.dstcraft.com/<KEY>.txt 로 노출).
KEY를 바꾸면 그 .txt 파일명/내용도 함께 바꿔야 한다.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

HOST = "www.dstcraft.com"
KEY = "1ae3d63981116809943041e7a8847ad6"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
# IndexNow 요청당 최대 10,000 URL
BATCH_SIZE = 10000


def read_sitemap(src: str) -> str:
    if src.startswith(("http://", "https://")):
        # Cloudflare가 기본 User-Agent를 403으로 막으므로 명시
        req = urllib.request.Request(src, headers={"User-Agent": "dstcraft-indexnow/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    with open(src, encoding="utf-8") as fh:
        return fh.read()


def extract_urls(xml: str) -> list[str]:
    root = ET.fromstring(xml)
    if root.tag == f"{SITEMAP_NS}sitemapindex":
        print("[indexnow] sitemap index detected — child sitemaps not followed", file=sys.stderr)
    # ElementTree가 XML 엔티티(&amp; 등)를 자동 디코딩하므로 실제 URL이 그대로 나온다
    return [el.text.strip() for el in root.iter(f"{SITEMAP_NS}loc") if el.text and el.text.strip()]


def submit(urls: list[str]) -> bool:
    payload = json.dumps(
        {"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION, "urlList": urls}
    ).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=payload,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"[indexnow] OK (HTTP {resp.status}) — {len(urls)} URLs submitted")
            return True
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")[:300]
        print(f"[indexnow] ping failed (HTTP {exc.code}): {body}", file=sys.stderr)
    except Exception as exc:  # noqa: BLE001 — best-effort, 모든 오류 흡수
        print(f"[indexnow] ping error: {exc}", file=sys.stderr)
    return False


def main() -> int:
    if len(sys.argv) != 2:
        print("[indexnow] usage: indexnow-ping.py <sitemap path|url>", file=sys.stderr)
        return 2
    try:
        xml = read_sitemap(sys.argv[1])
    except Exception as exc:  # noqa: BLE001
        print(f"[indexnow] cannot read sitemap '{sys.argv[1]}': {exc}", file=sys.stderr)
        return 1

    urls = extract_urls(xml)
    if not urls:
        print("[indexnow] no <loc> URLs found in sitemap", file=sys.stderr)
        return 1
    print(f"[indexnow] {len(urls)} URLs from sitemap")

    ok = True
    for i in range(0, len(urls), BATCH_SIZE):
        if not submit(urls[i : i + BATCH_SIZE]):
            ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
