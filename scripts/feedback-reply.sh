#!/usr/bin/env bash
# 피드백에 Claude 명의 답변 + 번역을 등록한다 (#140).
#
# 맥미니 러너의 feedback-reply 워크플로우를 호출하고 끝날 때까지 기다린 뒤 결과 로그를 보여 준다.
# ssh가 필요 없어서 맥북이 어디에 있든 된다 (gh 로그인만 있으면 됨).
#
# 사용법:
#   scripts/feedback-reply.sh <id> <status> <reply-lang> <reply> <reply-translated> [message-lang message-translated]
#
#   status            done / hold / rejected / new
#   reply-lang        답변(=피드백 원문) 언어: ko / en / pt …
#   reply             답변 본문 — 피드백 원문 언어로만, 500자 이내
#   reply-translated  반대 언어 번역. 원문이 ko/en이 아니면 '{"ko":"…","en":"…"}'
#   message-*         피드백 자체가 아직 미번역(messageLang: null)일 때만 준다
#
# 예:
#   scripts/feedback-reply.sh 1786395320853-r2i66t done ko \
#     "정리했어요. 제보 고마워요!" "Cleaned up. Thanks for the report!"
#
# 등록 뒤 공개 목록 캐시가 60초라 사이트 반영에는 최대 1분 걸린다.
set -euo pipefail

if [ "$#" -ne 5 ] && [ "$#" -ne 7 ]; then
  sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

ID=$1 STATUS=$2 REPLY_LANG=$3 REPLY=$4 REPLY_TRANSLATED=$5
MESSAGE_LANG=${6:-} MESSAGE_TRANSLATED=${7:-}
WORKFLOW=feedback-reply.yml
REPO=fankimm/dst-craft

if [ "${#REPLY}" -gt 500 ]; then
  echo "답변이 500자를 넘는다 (${#REPLY}자) — API가 잘라 버리니 줄일 것" >&2
  exit 1
fi

# 방금 띄운 실행을 찾기 위해 직전 최신 실행 id를 기억해 둔다.
before=$(gh run list -R "$REPO" --workflow "$WORKFLOW" --limit 1 --json databaseId --jq '.[0].databaseId // 0')

gh workflow run "$WORKFLOW" -R "$REPO" --ref main \
  -f id="$ID" -f reply="$REPLY" -f status="$STATUS" \
  -f reply_lang="$REPLY_LANG" -f reply_translated="$REPLY_TRANSLATED" \
  -f message_lang="$MESSAGE_LANG" -f message_translated="$MESSAGE_TRANSLATED"

run=""
for _ in $(seq 1 20); do
  sleep 3
  run=$(gh run list -R "$REPO" --workflow "$WORKFLOW" --limit 1 --json databaseId --jq '.[0].databaseId // 0')
  [ "$run" != "$before" ] && [ "$run" != "0" ] && break
  run=""
done
if [ -z "$run" ]; then
  echo "워크플로우 실행이 안 잡힌다 — gh run list -R $REPO --workflow $WORKFLOW 로 직접 확인할 것" >&2
  exit 1
fi

if gh run watch "$run" -R "$REPO" --exit-status >/dev/null; then
  gh run view "$run" -R "$REPO" --log | grep -E '이전 상태|저장 완료|답변|번역' | sed 's/^.*Z //' || true
else
  echo "등록 실패 — 로그:" >&2
  gh run view "$run" -R "$REPO" --log-failed | tail -20 >&2
  exit 1
fi
