#!/usr/bin/env bash
# Mac mini 자동 macOS 업데이트/재부팅 방지
# 유지: ConfigDataInstall / CriticalUpdateInstall (XProtect 등 무재부팅 보안 패치)
# 차단: 스케줄 검사, 자동 다운로드, macOS 본체 자동 설치(=재부팅 원인)

set -euo pipefail

echo "=== before ==="
for k in AutomaticCheckEnabled AutomaticDownload AutomaticallyInstallMacOSUpdates ConfigDataInstall CriticalUpdateInstall; do
  v=$(defaults read /Library/Preferences/com.apple.SoftwareUpdate "$k" 2>/dev/null || echo "(not set)")
  printf "  %-40s = %s\n" "$k" "$v"
done

echo ""
echo "=== applying changes (sudo) ==="
sudo softwareupdate --schedule off
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticDownload -bool false

echo ""
echo "=== after ==="
sudo softwareupdate --schedule
for k in AutomaticCheckEnabled AutomaticDownload AutomaticallyInstallMacOSUpdates ConfigDataInstall CriticalUpdateInstall; do
  v=$(defaults read /Library/Preferences/com.apple.SoftwareUpdate "$k" 2>/dev/null || echo "(not set)")
  printf "  %-40s = %s\n" "$k" "$v"
done
