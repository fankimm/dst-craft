---
name: push
description: 현재 변경사항을 커밋 + main 푸시 (Vercel 배포). 릴리즈노트/버전/오답노트 자동 갱신.
---

# /push — 커밋 + 배포 워크플로우

현재 작업 디렉토리의 변경사항을 정리해서 `main` 브랜치에 푸시한다 (Vercel auto-deploy). CLAUDE.md의 Release Notes Rules / Mistakes Rules / Branch & Deploy Strategy를 준수.

## 실행 절차

### 1. 상태 점검 (병렬)
- `git status`
- `git diff` (스테이지 + 언스테이지)
- `git log -5 --oneline` (최근 커밋 스타일 참고)

변경이 없으면 즉시 중단하고 사용자에게 알린다.

### 2. 변경 분류
변경사항을 보고 다음을 판단:
- **user-facing 여부**: 사용자가 화면에서 인지할 변화가 있는가? (UI/UX/기능/버그픽스 등)
- **버전 bump 단계**:
  - `patch` (0.0.x): 버그픽스, 소규모 수정, UX 미세 조정
  - `minor` (0.x.0): 새 기능 / 새 페이지 / 의미 있는 기능 추가
  - `major` (x.0.0): 대규모 구조 변경
- **오답노트 필요 여부**: 작업 중 실수/오해/교훈이 있었는가? 있으면 `docs/mistakes.md` 먼저 작성

판단 애매하면 사용자에게 한 줄로 묻고 진행 (예: "patch로 갈게요. 0.18.2 → 0.18.3.").

### 3. 릴리즈노트 + 버전 갱신

**user-facing 변화가 있는 경우 (필수)**:
- `src/lib/version.ts`의 `APP_VERSION` 갱신
- `src/app/releases/page.tsx`의 `releases` 배열 맨 앞에 새 항목 추가
  - `version`: 새 버전
  - `date`: 오늘 (YYYY-MM-DD)
  - `dev`: 기술적 변경사항 (한국어, 파일/함수 수준 디테일 포함). 근거가 있으면 마지막 항목으로 "근거: ..." 추가
  - `changes.ko` / `changes.en`: 사용자가 이해 가능한 표현. dev에서 의미 있는 항목만 재작성. 두 언어 모두 채울 것

**내부 정리만 (release notes 자체 수정, 주석/타입/린트, 문서만 수정 등)**:
- 버전/릴리즈노트 갱신 생략 가능. 단 dev-only 항목이라도 사용자에게 공유할 가치가 있으면 `changes`는 비워두고 `dev`만 추가하는 절충안 사용 (참고: 0.18.1 항목)

### 4. 오답노트 작성 (해당 시)
실수/교훈이 있으면 `docs/mistakes.md`에 새 섹션 추가 후 같은 커밋에 포함. CLAUDE.md의 "Mistakes & Lessons" 규칙 준수.

### 5. 빌드 검증 (선택, 큰 변경일 때)
- 의존성 변경 / 라우트 추가 / 빌드 영향 큰 변경 → `npm run build` 한 번 돌려보기
- 단순 fix는 `npx tsc --noEmit` 정도로 OK

### 6. 커밋 + 푸시
변경 분류에 맞는 prefix 선택:
- `fix(<scope>):` 버그픽스
- `feat(<scope>):` 새 기능
- `refactor(<scope>):` 리팩터
- `docs(<scope>):` 문서
- `chore:` 잡일

커밋 메시지 양식 (HEREDOC):
```
git add <변경 파일들 명시>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <한 줄 요약 — v버전>

<선택: 상세 본문>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

마지막에 `git status` 한 번 더 (clean 확인) + `git log -1 --oneline` 으로 푸시된 커밋 확인.

## 규칙
- **항상 `main` 브랜치로 push** (Vercel Production 자동 배포)
- **`git add -A` / `git add .` 금지** — 변경된 파일을 명시적으로 add (CLAUDE.md 안전 규칙)
- 사용자에게 묻지 않고 위 절차를 끝까지 진행 (이미 push 권한을 위임받은 상태). 단, 버전 bump 단계 / user-facing 분류가 모호하면 한 줄로만 확인.
- 푸시 후 Vercel 배포는 자동이므로 배포 상태 확인은 별도로 하지 않음 (사용자가 라이브에서 확인).
- `--no-verify`, `--force` 등 위험 옵션 사용 금지.
