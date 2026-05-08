---
name: push
description: 현재 변경사항을 커밋한 뒤 beta 브랜치로 흘려 beta.dstcraft.com에 배포. feat 워크트리면 feat 커밋 + main 워크트리에서 beta 머지/푸시까지 자동. 오답노트 반영. Production(main) 배포는 /release 사용.
---

# /push — 커밋 + beta 배포 워크플로우

현재 변경사항을 커밋하고, 그 결과를 `beta` 브랜치에 반영해서 `beta.dstcraft.com`에 자동 배포한다. CLAUDE.md의 Branch & Deploy Strategy / Release Notes Rules / Mistakes Rules를 준수.

## 시나리오 분기

현재 워크트리의 브랜치(`git rev-parse --abbrev-ref HEAD`)에 따라 동작이 다르다:

### A. 현재 브랜치 = `beta`
직접 beta 작업 케이스. 변경사항을 그대로 beta에 commit + push.

### B. 현재 브랜치 = `feat/X` (정상 워크플로우)
feat 워크트리에서 작업한 케이스. 다음을 수행:
1. feat 워크트리에서 commit + `git push origin feat/X` (백업)
2. **메인 워크트리**(`/Users/jihwan-kim3/private-works/dst-craft`)가 `beta`에 있는지 확인 — 아니면 사용자에게 보고 후 중단
3. 메인 워크트리에서 `git merge feat/X` + `git push origin beta` ← `git -C` 사용해서 현재 디렉터리를 떠나지 않고 처리

### C. 현재 브랜치 = `main` 또는 기타
사용자에게 명확히 묻고 중단 — main에서는 작업 금지. 보통은 잘못 들어온 상태.

## 실행 절차

### 1. 상태 점검 (병렬)
- `git status`
- `git diff` (스테이지 + 언스테이지)
- `git log -5 --oneline` (최근 커밋 스타일 참고)
- `git rev-parse --abbrev-ref HEAD` — 시나리오 분기용

변경이 없고 머지할 것도 없으면 즉시 중단.

### 2. 변경 분류
- **user-facing 여부**: 사용자가 화면에서 인지할 변화가 있는가? (UI/UX/기능/버그픽스 등)
- **버전 bump 단계**:
  - `patch` (0.0.x): 버그픽스, 소규모 수정, UX 미세 조정
  - `minor` (0.x.0): 새 기능 / 새 페이지 / 의미 있는 기능 추가
  - `major` (x.0.0): 대규모 구조 변경
- **오답노트 필요 여부**: 작업 중 실수/오해/교훈이 있었는가? 있으면 `docs/mistakes.md` 먼저 작성

판단 애매하면 사용자에게 한 줄로 묻고 진행 (예: "patch로 갈게요").

### 3. 릴리즈노트 / 버전 (beta 단계에서는 건너뜀)

`/push`(beta 배포) 단계에서는 릴리즈노트/버전 갱신을 **하지 않는다** — feat 분량만 따져서 한 번에 작성하기 위해 `/release` 시점까지 보류한다.

### 4. 오답노트 작성 (해당 시)
실수/교훈이 있으면 `docs/mistakes.md`에 새 섹션 추가 후 같은 커밋에 포함.

### 5. 빌드 검증 (선택, 큰 변경일 때)
- 의존성 변경 / 라우트 추가 / 빌드 영향 큰 변경 → `npm run build` 한 번 돌려보기
- 단순 fix는 `npx tsc --noEmit` 정도로 OK

### 6. 시나리오별 푸시

**시나리오 A (beta 직접)**:
```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <한 줄 요약>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin beta
```

**시나리오 B (feat 워크트리)**:
```bash
# 1. feat에 commit + 백업 push
git add <files>
git commit -m "..."
git push origin <feat-branch>

# 2. 메인 워크트리에서 beta 머지 + push (디렉터리 이동 없이 -C로)
MAIN_WT=$(git worktree list --porcelain | awk '/^worktree/{path=$2} /^branch refs\/heads\/beta$/{print path}')
git -C "$MAIN_WT" fetch origin
git -C "$MAIN_WT" pull --ff-only origin beta
git -C "$MAIN_WT" merge <feat-branch> -m "merge <feat-branch> into beta for staging"
git -C "$MAIN_WT" push origin beta
```

> 메인 워크트리가 beta가 아니면 (위 awk가 빈 결과) — 사용자에게 보고하고 중단. 임의로 메인 워크트리 브랜치 바꾸지 말 것.

마지막에 `git status` (clean 확인) + `git log -1 --oneline` 결과 확인.

## 규칙
- **항상 `beta`로 흘림** — `feat/X` 워크트리에서도 결국 beta에 머지되어야 배포됨
- **메인 워크트리는 beta 유지** — 다른 브랜치로 가있으면 /push가 동작 안 함. 작업 전 확인.
- **`main`에 직접 푸시 금지** — 사용자가 명시적으로 main 푸시를 요청해도 `/release` 권장
- **`git add -A` / `git add .` 금지** — 변경된 파일을 명시적으로 add (CLAUDE.md 안전 규칙)
- 사용자에게 묻지 않고 위 절차를 끝까지 진행 (이미 push 권한을 위임받은 상태). 단, 분류가 모호하면 한 줄로만 확인.
- 푸시 후 배포는 자동이므로 배포 상태 확인은 별도로 하지 않음 (사용자가 라이브에서 확인).
- `--no-verify`, `--force` 등 위험 옵션 사용 금지.
- feat 머지 시 fast-forward 가능하면 그대로(`--ff-only`), 안 되면 `--no-ff` 머지 커밋 명시.
