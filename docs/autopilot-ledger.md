# 자동 운영 장부

자동 운영(`docs/autopilot.md`)이 **프로덕션에 내보낸 것**을 건별로 적는다. 되돌리기(같은 문서 4장)의 근거다.

- 기준점: 태그 `pre-autopilot-2026-11-07` (v0.42.1) · DB 스냅샷 `~/Backups/dstcraft/pinned/pre-autopilot-2026-11-07.db.gz`
- 항목은 **릴리즈 전에, 그 feat 브랜치에서** 추가한다. 머지 커밋은 적지 않는다 — `git log origin/main --merges --grep 'feat/<num>-'`로 찾는다
- 릴리즈와 무관한 피드백 답변(질문 답·거절·"검토 목록")은 여기 적지 않는다. DB의 `reply_author='claude'`가 기록이다
- 최신이 위

## 종류와 롤백 기본값

| 종류 | 뜻 | "자동 운영 전으로" 요청 시 기본 |
|---|---|---|
| `feature` | 새 기능·새 화면·화면 변경 | 되돌림 |
| `bugfix` | 틀린 걸 바로잡음 | 유지 |
| `data-sync` | 게임 업데이트 반영 | 유지 |
| `infra` | 배포·서버·스크립트 | 유지 |
| `meta` | 문서·규칙 | 유지 (위임 종료 시 규칙만 고침) |

## 항목 형식

```markdown
### <날짜> · #<이슈> · v<버전 또는 —> · <종류>
<한 줄 요약>
- 피드백: `<id>` — 이전(status=…, 답변 "…" 또는 없음) → 등록(status=…) "<등록할 문구>"
- git 밖 변경: 없음 | <한 일> — 되돌리기: `<명령>`
- DB 변경: 없음 | <추가한 컬럼·테이블>
- 되돌림: (되돌렸을 때만) <날짜> v<버전>
```

---

## 기록

### 2026-11-08 · #142 · v0.43.0 · feature
게팍한 은둔자(진주) 거래 목록·찻집 메뉴·집 꾸미기 점수표 — 퀘스트 탭 은둔자 카드 아래 접이식 카드 + `/quest/hermit`(ko/en) SEO 섹션 3개 + FAQ 2개.
- 피드백: `1779535886458-v1mko8` — 이전(status=new, 답변 "제안 감사합니다, 그리고 답변이 많이 늦어 죄송합니다! 게팍한 은둔자 거래 목록을 검토 목록에 넣었습니다.") → 등록(status=done) "v0.43.0에 반영했어요! 퀘스트 탭의 은둔자 카드 아래에 '은둔자 거래 · 집 꾸미기' 카드가 생겼어요. 병 교환 탭에서 친구 레벨별로 열리는 품목과 빈 병 가격을, 찻집 탭에서 차 8종의 재료 수와 효과를 볼 수 있습니다. 오래 기다리게 해서 죄송하고, 제안 감사합니다."
- 피드백: `1779971540965-gv1yyh` — 이전(status=new, 답변 "제안 감사합니다, 그리고 답변이 많이 늦어 죄송합니다! 게팍한 은둔자 집 꾸미기 호감도 정보를 검토 목록에 넣었습니다. 거래 목록과 함께 살펴보겠습니다.") → 등록(status=done) "v0.43.0에 반영했어요! 퀘스트 탭의 은둔자 카드 아래 '은둔자 거래 · 집 꾸미기' 카드의 '집 꾸미기' 탭에 꾸미기 점수표를 넣었어요. 항목별 점수와 상한, 감점 항목, 그리고 점수에 따라 열리는 가로등·찻집·온천·대형 건조대 조건까지 게임 코드 기준으로 정리했습니다. 오래 기다리게 해서 죄송하고, 제안 감사합니다."
- git 밖 변경: 없음
- DB 변경: 없음

### 2026-11-07 · #141 · v0.42.2 · bugfix
요리솥 트레이너 제보 4건 — 우유 짜는 모자 착용 효과 채점, 먹기·굽기 버튼 겹침, 재료 칸 순서 고정, 구운 토마토란 이미지. 메타: `docs/autopilot.md` 3장 "검토 목록" status `hold`→`new` 정정.
- 피드백: `1793294780693-wxp1kf` — 이전(status=new, 답변 "Thanks for the detailed report — very helpful! All four points are noted (Milkmade Hat, the overlapping Eat/Roast buttons, the ingredient order jumping around, and the missing Roasted Toma Root sprite) and they're on the trainer fix list. I'll update this reply once the fixes are live.") → 등록(status=done) "All four are live in v0.42.2 — thanks again for the detailed report! The Milkmade Hat now counts its worn effect (+187.5 hunger, −5.3 sanity over its lifetime) instead of showing as inedible, and the optimal plan uses it too. Eat and Roast are icon-only until the first tap, which expands to \"Eat?\" / \"Roast?\" so they no longer overlap. Ingredient slots keep their order for the whole round, with roasted items right next to the raw ones. And Roasted Toma Root has its own sprite now."
- git 밖 변경: 없음
- DB 변경: 없음

### 2026-11-07 · #140 · v— · meta
자동 운영 기반 — 운영 규칙(`docs/autopilot.md`)·이 장부·CLAUDE.md 위임 규칙, 맥미니 러너 경유 피드백 답변(`feedback-reply.yml`, `scripts/feedback-reply.sh`), `reply-as-claude.ts`에 번역 동시 저장.
- 피드백: 없음
- git 밖 변경: 예약 작업 `dstcraft-autopilot-daily` 등록(맥북 Claude 앱) — 되돌리기: 예약 작업 끄기
- DB 변경: 없음
