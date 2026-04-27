# Git 히스토리 이메일 재작성 계획

> **이 문서는 다른 머신(macOS 권장)의 Claude 세션에서 그대로 실행하기 위한 단독 작업 계획서다.**
> 한 번에 다 진행하지 말고, "결정 필요" 섹션부터 유저에게 확인받은 뒤 진행할 것.
> force-push는 명시 승인 후에만 실행.

작성일: 2026-04-27 (Windows 머신)
작업 권장 머신: **macOS 노트북** — 이미 클론이 있고 push 권한이 살아있음. Windows 머신에서는 git identity 미설정 상태라 macOS가 깔끔.

---

## 배경

`github.com/fankimm/dst-craft` 저장소의 commit author email에 회사 계정(`jihwan_kim3@kolon.com`)이 노출되어 있는 것을 발견. 첫 커밋(2026-02-25 `1a13a66 Initial commit`)부터 회사 메일로 push되어 옴. 정리 필요.

### 히스토리 실태 (2026-04-27 기준)

```
459 커밋 총합
├─ jihwan_kim3@kolon.com (이름: jihwan-kim3)  : 314 커밋  ← 회사 계정, 정리 대상
└─ crakim7@naver.com     (이름: fankimm)      : 145 커밋  ← 다른 개인 계정
```

- 첫 회사 메일 커밋: `1a13a66 2026-02-25 Initial commit from Create Next App`
- 마지막 회사 메일 커밋: 2026-04-27의 `9492526 fix: 와그펑크 작업장 레시피 station 정정 (8종)`
- 시기 상관없이 두 identity가 혼재 (머신/세션 따라 갈렸음)
- Tag: 없음
- 다른 브랜치: `origin/staging` (main보다 300커밋 뒤처짐, 모두 naver 메일)
- Vercel만 외부 연결 — main HEAD 자동 추적이라 force-push 후 자동 재배포

### 외부 미러 영향 (사용자 인지 후 진행 결정함)

- GHArchive 등에 push 이벤트가 이미 들어갔을 가능성 — 회수 불가
- 알림 이메일은 이미 발송됨 — 회수 불가
- 사용자 판단: 외부 영향 미미 → 진행하기로 결정

---

## 결정 필요 (3가지) — 작업 시작 전 유저에게 확인

### 1. 새 identity (kolon.com 314커밋의 대체)

옵션 A (권장): GitHub noreply 형식
- 형식: `<숫자ID>+fankimm@users.noreply.github.com`
- 확인 방법: GitHub.com → Settings → Emails 페이지 상단의 "Keep my email addresses private" 영역에 본인 noreply 주소 표시됨
- 장점: 잔디 정상 카운트 + 메일 노출 0
- 표시 이름은 `fankimm` 권장

옵션 B: 평문 메일 — 예) `balocoding@gmail.com` (CLAUDE.md 컨텍스트에서 발견된 메일)
- 단순하나 메일 그대로 노출

### 2. `crakim7@naver.com` (145커밋) 처리

- (a) 그대로 두기 — kolon만 치환
- (b) 새 identity로 합치기 — 모든 커밋이 단일 identity로 통일

### 3. `origin/staging` 브랜치 (300커밋 뒤처짐)

- (a) 삭제 — `git push origin --delete staging` 가장 간단
- (b) 같이 재작성 — main과 동일하게 force-push
- (c) 그대로 — staging만 옛 메일 잔존

---

## 사전 점검

**작업 머신에서 다음 명령으로 상태 확인:**

```bash
cd <project_root>
git status                              # working tree 깨끗한지
git stash list                          # 스태시 있는지 (있으면 push 또는 별도 백업)
git branch -a                           # 로컬 브랜치 목록
git log --format="%ae" | sort | uniq -c # 메일 분포 (위 표와 일치하는지)
git rev-list --count HEAD               # 459 나오는지
git remote -v                           # origin이 fankimm/dst-craft.git 인지
```

**원본과 일치하지 않으면 멈추고 사용자에게 확인.**

---

## 실행 단계

### 0. 백업 (필수)

```bash
cd ~/Desktop  # 또는 적당한 위치
git clone --mirror https://github.com/fankimm/dst-craft.git dst-craft-backup.git
# 또는 작업 디렉토리에서:
git bundle create ../dst-craft-backup-$(date +%Y%m%d).bundle --all
```

원격이 망가져도 `git clone <backup>`로 복원 가능.

### 1. `git filter-repo` 설치

```bash
# macOS (homebrew)
brew install git-filter-repo
# 확인
git filter-repo --version
```

### 2. mailmap 작성 (결정 1, 2 결과 반영)

`mailmap.txt` 파일을 프로젝트 루트에 임시로 생성. 형식: `새이름 <새메일> <기존메일>`

**예시 (옵션 1A + 2b: 단일 identity로 통합):**
```
fankimm <12345678+fankimm@users.noreply.github.com> <jihwan_kim3@kolon.com>
fankimm <12345678+fankimm@users.noreply.github.com> <crakim7@naver.com>
```

**예시 (옵션 1A + 2a: kolon만 치환):**
```
fankimm <12345678+fankimm@users.noreply.github.com> <jihwan_kim3@kolon.com>
```

`12345678` 자리는 실제 noreply 숫자 ID로 교체.

### 3. 작업 브랜치에서 실행 (안전망)

```bash
git checkout -b rewrite-emails-backup main   # 현재 main 보존용
git checkout main
git filter-repo --mailmap mailmap.txt --force
```

`--force`는 working dir이 클린해도 git filter-repo가 안전 검사로 막는 걸 우회 (clone이 아닌 기존 repo에서 실행 시 필요).

`filter-repo`는 **origin remote를 자동 제거**한다. 다음 단계에서 다시 추가.

### 4. 검증

```bash
git log --format="%ae" | sort | uniq -c
# 회사 메일이 0이어야 하고, 합쳤다면 단일 메일만 나와야 함
git log --format="%h %an <%ae> %s" | head -5
git rev-list --count HEAD              # 459 동일해야 함
```

**검증 통과 못 하면 멈추고 백업으로 복원.**

### 5. 원격 재설정 + force-push (⚠️ 명시 승인 필요)

```bash
git remote add origin https://github.com/fankimm/dst-craft.git
git push --force origin main
```

**`main` force-push는 destructive. 이 단계 직전에 유저에게 한 번 더 확인받을 것.**

### 6. staging 처리 (결정 3 결과)

**(a) 삭제:**
```bash
git push origin --delete staging
```

**(b) 같이 재작성:** main 결과를 가져와 staging에도 적용 (필요 시 별도 절차).

### 7. 사후 정리

- GitHub Settings → Emails → "Block command line pushes that expose my email" 체크 (재발 방지)
- 작업 머신에서 git config 확인:
  ```bash
  git config user.email   # 새 메일이어야 함
  git config user.name    # 새 이름
  # 안 되어 있으면:
  git config user.email "12345678+fankimm@users.noreply.github.com"
  git config user.name "fankimm"
  ```
- mailmap.txt 삭제 (커밋하지 말 것)
- (선택) GitHub Support에 force-push 후 GC 요청: https://support.github.com/contact

### 8. 다른 머신 동기화 (Windows / macOS 양쪽 확인)

- 진행 안 한 머신에서 `git pull`은 거부됨
- 정상화: `git fetch origin && git reset --hard origin/main` (working tree에 작업 중이면 먼저 stash/branch)
- 또는 그냥 디렉토리 지우고 재클론
- 두 머신 모두에서 `git config user.email`도 새 값으로 설정

### 9. 검증 — GitHub 웹

- repo 메인 페이지 → 최근 커밋 author 표시 확인
- 임의 커밋 클릭 → author 메일이 새 값인지
- Insights → Contributors 그래프에서 회사 identity가 사라졌는지
- `https://github.com/fankimm/dst-craft/commits/main.atom` 같은 피드도 새 값으로 갱신됐는지

---

## 롤백 (실패 시)

force-push 직후 ~5분 이내라면 GitHub reflog에서 옛 ref 복구 가능 (Support 요청). 이후라면:

```bash
# 백업 bundle에서 복원
mkdir restore && cd restore
git clone <backup>.bundle dst-craft
cd dst-craft
git remote set-url origin https://github.com/fankimm/dst-craft.git
git push --force origin main
```

mirror clone 백업이라면:
```bash
cd dst-craft-backup.git
git push --mirror https://github.com/fankimm/dst-craft.git
```

---

## 체크리스트

- [ ] 사전 점검 — 459커밋, 원격 URL 일치 확인
- [ ] 결정 1 — 새 identity 확정
- [ ] 결정 2 — naver 메일 처리 확정
- [ ] 결정 3 — staging 처리 확정
- [ ] 백업 생성 (mirror clone 또는 bundle)
- [ ] git-filter-repo 설치
- [ ] mailmap.txt 작성
- [ ] filter-repo 실행
- [ ] 로컬 검증 (메일 분포 + 커밋 수)
- [ ] **유저 최종 확인** ← force-push 직전
- [ ] origin 재추가 + main force-push
- [ ] staging 처리
- [ ] git config 새 identity로 갱신
- [ ] GitHub Settings: email push block 활성화
- [ ] mailmap.txt 삭제
- [ ] 다른 머신 동기화 안내 (Windows 머신 등)
- [ ] GitHub 웹에서 author 값 검증
- [ ] 이 TODO 파일 완료 표시 + `todo.md`에서 제거

---

## 참고

- 이 작업의 발단: 2026-04-27 와그펑크 station 수정 커밋(`9492526`)을 회사 메일로 푸시한 것을 발견 → 알고보니 첫 커밋부터 그랬음
- 관련 오답노트: `docs/mistakes.md` — git identity는 이번 작업으로 별도 항목 추가 예정
- `git filter-repo` 공식 문서: https://github.com/newren/git-filter-repo/blob/main/Documentation/git-filter-repo.txt
