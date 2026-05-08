---
name: release
description: beta 브랜치를 main으로 머지 + main 푸시 (Production 배포). 릴리즈노트/버전 자동 갱신, beta 누적 변경을 한 번에 사용자에게 노출.
---

# /release — beta → main 릴리즈 워크플로우

`beta` 브랜치에서 검증된 변경사항을 `main`에 머지하고 푸시하여 Production(`www.dstcraft.com`)에 배포한다. main에 직접 푸시하는 **유일한 허용 경로**. CLAUDE.md의 Branch & Deploy Strategy / Release Notes Rules / Mistakes Rules를 준수.

## 사전 점검

다음을 병렬로 실행하여 상태 확인:
- `git fetch --all --prune` — 원격 최신화
- `git status` — 워킹트리 clean 확인 (dirty면 중단하고 사용자에게 알림)
- `git rev-parse --abbrev-ref HEAD` — 현재 브랜치
- `git log --oneline main..origin/beta` — beta가 main 대비 가진 커밋들
- `git log --oneline main..main@{u}` — main이 원격 대비 뒤처져 있는지

**중단 조건**:
- 워킹트리 dirty → 사용자에게 알리고 중단 (먼저 /push로 정리)
- `main..origin/beta`가 비어있음 (beta에 새 커밋 없음) → 릴리즈할 게 없음, 중단
- `origin/main`이 로컬 `main`보다 앞서감 → 사용자에게 보고 후 결정

## 1. 릴리즈 범위 분석

`git log --oneline main..origin/beta`와 `git diff main...origin/beta`를 보고:

- **버전 bump 단계 결정**:
  - `patch` (0.0.x): 버그픽스, 소규모 수정
  - `minor` (0.x.0): 새 기능 / 새 페이지 / 의미 있는 추가
  - `major` (x.0.0): 대규모 구조 변경
- **user-facing 변경 추출**: 커밋 메시지에서 `feat`/`fix`/UI 관련 항목만 골라내서 사용자 노출 가능한 표현으로 재작성
- **dev 항목**: 모든 기술 변경 (refactor/chore 포함)

판단 애매하면 한 줄로 확인 (예: "patch 0.20.1 → 0.20.2로 갈게요").

## 2. 릴리즈노트 + 버전 갱신 (beta 브랜치에서)

먼저 `git checkout beta` (이미 beta가 아니면).

- `src/lib/version.ts`의 `APP_VERSION` 갱신
- `src/app/releases/page.tsx`의 `releases` 배열 맨 앞에 새 항목 추가:
  - `version`: 새 버전
  - `date`: 오늘 (YYYY-MM-DD)
  - `dev`: beta에서 누적된 모든 기술 변경 (한국어, 파일/함수 수준)
  - `changes.ko` / `changes.en`: 사용자가 이해 가능한 표현. 두 언어 모두 채울 것

beta에서 이미 부분적으로 갱신된 릴리즈노트가 있다면 통합/정리.

## 3. 빌드 검증 (필수)

Production 릴리즈이므로 반드시:
- `npm run build` — 빌드 성공 확인
- `npx tsc --noEmit` — 타입 에러 없음 확인

빌드 실패 시 중단하고 수정 후 재시도.

## 4. 릴리즈노트 커밋 + beta 푸시

```bash
git add src/lib/version.ts src/app/releases/page.tsx
git commit -m "$(cat <<'EOF'
chore(release): v<버전> 릴리즈노트 정리

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin beta
```

## 5. main 머지 + 푸시 (Production 배포)

```bash
git checkout main
git pull --ff-only origin main
git merge --no-ff origin/beta -m "Release v<버전>: beta → main"
git push origin main
```

머지 충돌 시 중단하고 사용자에게 보고. 임의 해결 금지.

## 6. 마무리

- `git checkout beta` — 작업 브랜치로 복귀 (다음 작업은 다시 beta에서)
- `git log -1 --oneline` (main, beta 각각) — 푸시 결과 확인
- 사용자에게 결과 보고: 새 버전, 머지된 커밋 수, www.dstcraft.com 배포 트리거 여부

## 규칙
- **main 푸시는 /release를 통해서만** — 다른 경로로 main에 직접 푸시 금지
- 머지 전략은 `--no-ff` (머지 커밋 명시적으로 남김 — 릴리즈 경계 추적용)
- 머지 후 main에서 작업하지 말 것 — 즉시 `git checkout beta`로 복귀
- `--no-verify`, `--force` 사용 금지
- 사용자가 명시적으로 "특정 커밋만 cherry-pick" 같은 변형을 요청하면 그에 따름. 기본은 `--no-ff` merge.
