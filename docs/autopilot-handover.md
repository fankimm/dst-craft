# 자동 운영 인계 문서

자동 운영(`docs/autopilot.md`)을 **다른 기기로 옮기거나, 멈추거나, 다시 켤 때** 보는 문서.

작성 배경(2026-11-11): 자동 운영은 맥북 한 대의 Claude 앱 예약 작업으로만 돌고 있는데, 그 맥북에 보안 프로그램을 설치해야 해서 더는 못 돌릴 수 있다. 이 문서만 있으면 다른 기기에서 그대로 이어 갈 수 있게 정리한다.

- 규칙(무엇을 해도 되는가): [`autopilot.md`](autopilot.md)
- 한 일의 기록: [`autopilot-ledger.md`](autopilot-ledger.md)
- 매일 실행 프롬프트: [`autopilot-daily-prompt.md`](autopilot-daily-prompt.md)

---

## 1. 2026-11-11 기준 상태

> **2026-11-16 갱신 — 기기 이전 완료.** 옛 운영 맥북은 포맷됐다. 새 맥에서 레포를 최신으로 당기고 예약 작업 `dstcraft-autopilot-daily`를 다시 등록했다(매일 08:37, Bypass permissions 모드). 11/12~11/16은 회차가 돌지 않았다. 같은 날 운영 목표가 **수익 증대**로 정해졌다(`autopilot.md` 0장, #151).
> 새 맥의 상태: `gh` 로그인·`node`·`jq`·`python3` 있음, Steam `steamapps` 폴더 있음(DST 설치 여부는 미확인), 게임 스냅샷 `~/dst-game-snapshot` **없음** — 첫 회차에서 `scripts/sync-game-data.sh`로 새로 만들 수 있는지 확인할 것. 되면 3장의 공백이 풀린다. Claude 메모리는 옛 기기와 함께 사라졌다.
> 같은 날 추가(#152): 예약 작업을 하루 3회(`30 8,14,20 * * *`)로 늘렸고, 수익 수치를 Claude in Chrome으로 읽기 시작했다. **기기를 옮길 때 챙길 것이 하나 늘었다** — 크롬 + Claude 확장 연결, 그리고 그 크롬에서 Ezoic/AdSense/Ko-fi 로그인(사용자 몫). 없으면 수익 조회만 건너뛴다.
> 같은 날 추가(#153): 수익 기록은 비공개 레포 `fankimm/dst-craft-ops`에 있다. 새 기기에서는 `gh repo clone fankimm/dst-craft-ops ../dst-craft-ops` (없으면 첫 회차가 알아서 받는다).
> 같은 날 추가(#154): **#134 AdSense 전환 릴리즈도 자동 운영이 한다** — 아래 표의 "사용자는 11/19 전환 때만 개입", "손대지 않는 것: #134"는 더는 맞지 않는다. 날짜 조건(11/20 17:00 KST 이후)과 절차는 `autopilot.md` 1.1절. MCM 위임 해제도 위임됐다(#156, 크롬으로) — 그 밖의 콘솔 설정 변경만 사용자 몫. ~~새 맥에서 맥미니 ssh는 안 된다~~ → 같은 날 복구(#157): 새 맥의 공개키를 맥미니 `~/.ssh/authorized_keys`에 등록했고 `ssh mac-mini`가 된다. 옛 맥북의 키 한 줄이 아직 남아 있다(지울지는 사용자 결정).
> 아래 표는 11/11 시점의 기록이다.

| 항목 | 상태 |
|---|---|
| 위임 | 유효 (2026-11-07~). 사용자는 11/19 AdSense 전환 때만 개입 예정 |
| 프로덕션 | v0.45.0 |
| 실행 이력 | 11/07~11/11 5회차, 전부 성공. 릴리즈 5건(#141 #142 #143 #148 #149) — 장부 참조 |
| 미답변 피드백 | 0건 (11/11 회차 기준) |
| 백로그 | `gh issue list --label autopilot --state open` — #144 아이템 도감 2단계(앱 안 화면), #145 생물 도감 2단계(전리품·앱 안 화면), #146 스킬 수치, #147 스킬트리 화면 |
| 손대지 않는 것 | #134 AdSense 전환(11/19 이후, 사용자와 같이) · #1 데미지 계산기 · #103 iOS 27 PWA — 위임 전부터 있던 사용자 작업 |
| 게임 데이터 | 스냅샷 buildid 26306684 (2026-10-30). **그 뒤로 동기화 못 하고 있다** (3장) |

---

## 2. 어디에 무엇이 있나

### 레포에 있는 것 — 어느 기기에서든 clone 하면 따라온다
- 운영 규칙·장부·이 문서·매일 프롬프트 (`docs/autopilot*.md`), 프로젝트 규칙(`CLAUDE.md`), 실수 기록(`docs/mistakes.md`)
- 작업 절차 스킬 `/task` `/beta` `/release` (`.claude/skills/`)
- 피드백 답변 경로: `scripts/feedback-reply.sh` → `.github/workflows/feedback-reply.yml` → 맥미니 러너
- 복귀 기준점 태그 `pre-autopilot-2026-11-07`
- 백로그 (GitHub 이슈)

### 맥미니(서버)에 있는 것 — 운영 기기와 무관하게 그대로다
- 사이트·API·DB, 배포 러너, 매일 DB 백업, 기준점 DB 스냅샷(`~/Backups/dstcraft/pinned/`)
- 워치독(Cloudflare Worker)도 별개로 계속 돈다
- **운영 기기가 사라져도 사이트는 멈추지 않는다.** 멈추는 건 "새 피드백 답변·개선·게임 업데이트 반영"뿐이다

### 운영 기기에만 있는 것 — 옮길 때 챙겨야 한다

| 무엇 | 위치 | 없으면 | 옮기는 법 |
|---|---|---|---|
| 예약 작업 `dstcraft-autopilot-daily` | Claude 앱 (`~/.claude/scheduled-tasks/`) | 매일 실행이 안 됨 | 새 기기에서 `autopilot-daily-prompt.md`로 다시 등록 (4장) |
| GitHub 로그인 (`gh auth`) | 기기 키체인 | 푸시·이슈·답변 등록 전부 불가 | 새 기기에서 `gh auth login` — 사용자 몫 |
| 게임 스냅샷 `~/dst-game-snapshot` | 로컬 전용 git 레포 (342MB, 원격 없음 — Klei 자산이라 푸시 금지) | 게임 소스를 읽는 추출 스크립트·사실 확인 불가 | 폴더째 복사하거나, DST가 설치된 기기에서 `bash scripts/sync-game-data.sh`로 새로 생성 |
| DST 게임 설치 (Steam) | `~/Library/Application Support/Steam/steamapps/` | 게임 업데이트 감지·동기화 불가 | Steam에서 DST 설치 — 사용자 몫 (3장) |
| 맥미니 ssh 키 | `~/.ssh` | ssh 불가. **답변 등록·배포는 러너 경유라 영향 없음** | 필요할 때만. 새 공개키를 맥미니 `authorized_keys`에 추가 — 사용자 몫 |
| Claude 메모리 | `~/.claude/projects/…/memory/` | 과거 맥락 일부 유실 | 운영에 필요한 사실은 전부 레포 문서에 있다. 복사는 선택 |
| 헤드리스 검증 도구 | 임시 폴더의 `playwright-core`, Pillow가 든 Python venv | — | 회차가 필요할 때 다시 만든다 (`npm i playwright-core`, `python3 -m venv` + `pip install Pillow`) |
| 진행 중 워크트리 | 레포 옆 `dst-craft-<num>` | — | 브랜치는 전부 origin에 푸시돼 있다. 새 기기에서 `git worktree add ../dst-craft-<num> feat/<num>-…` |

2026-11-11 확인: 로컬에만 있는 미푸시 작업은 없다 (feat/1·103·134 전부 origin과 일치).

---

## 3. 알려진 공백 — 게임 데이터 동기화

🟢 **2026-11-23 해소 (#168)** — 운영 기기 Steam이 11/22에 DST(buildid 26474873)와 한글모드를 업데이트했고, Pillow venv `~/.venvs/dstcraft`를 만들어 sync를 끝냈다. 스냅샷 `~/dst-game-snapshot`도 이때 새로 생겼다. **이 기기에서 sync는 `PATH=$HOME/.venvs/dstcraft/bin:$PATH bash scripts/sync-game-data.sh`로 돌린다** (시스템 python에는 Pillow가 없다). 아래는 해소 전 기록.

~~10/30 이후의 게임 패치는 사이트에 반영되지 않고 있다.~~

- 2026-11-07~: 옛 운영 맥북에 Steam `steamapps` 폴더가 없어 `scripts/sync-game-data.sh`가 manifest를 못 찾고 끝났다
- 2026-11-16~ (새 맥, #158): Steam과 DST는 깔려 있지만 **옛 빌드**(buildid 23690848, 6월)다 — 사이트 데이터 기준(26306684)보다 낮다. 게임 스냅샷 `~/dst-game-snapshot`도 Pillow도 없다. sync는 "installed game is OLDER than the site data"로 멈춘다(#158에서 넣은 안전장치). **이 안전장치를 `ALLOW_DOWNGRADE=1`로 넘기지 말 것** — 데이터가 6월로 돌아간다
- 해결(사용자 몫): 이 맥의 Steam에서 DST와 한글모드를 최신으로 업데이트. 그다음 회차가 할 일: Pillow가 든 venv를 PATH 앞에 두고 `bash scripts/sync-game-data.sh` — 스냅샷은 첫 실행 때 새로 만들어진다. 스냅샷이 없는 동안은 게임 소스를 읽는 추출 스크립트(`extract-*.py`, `convert-scrapbook.py`)를 이 기기에서 돌릴 수 없다
- 매 회차에서 이 실패를 다시 조사하지 말 것. Steam에서 게임을 업데이트하는 것은 사용자 몫이다


## 3.1 알려진 공백 — 크롬 확장이 페이지를 읽지 못함

- 2026-11-20 저녁·11-21 아침 회차: Claude in Chrome이 탭을 열고 이동은 하지만 `get_page_text`·스크린샷이 전부 시간 초과(`document_idle` 45초, 스크립트 주입 5초)로 실패한다. AdSense·Ad Manager뿐 아니라 example.com도 같다 — 사이트 문제가 아니라 브라우저 쪽 상태다(화면 잠금·창 최소화로 탭이 멈췄을 가능성, 추측)
- 영향: 수익 조회(0.1절)와 MCM 위임 해제(1.1절)를 못 한다. `revenue-log.md`는 아직 한 줄도 없다
- 해결(사용자 몫): 운영 기기의 크롬 창을 열어 둔 채(최소화하지 않고) 화면 잠금 없이 두거나, 크롬·확장을 다시 연결. 회차마다 한 번 시도하고 같은 증상이면 재조사하지 말고 넘어간다

---

## 4. 다른 기기에서 다시 켜기

필요한 것: macOS, Claude 데스크톱 앱(Code 탭), `git`, `gh`, `node`(24+)·`npm`, `python3`, `jq`.

1. **레포** — `git clone https://github.com/fankimm/dst-craft.git` 후 그 폴더(메인 워크트리)는 항상 `main`으로 둔다. `gh auth login`
2. **beta 워크트리** — 없으면 `/beta`가 알아서 만든다 (`../dst-craft-beta`)
3. **게임 스냅샷** — 위 표대로 복사하거나 새로 생성. 없어도 점검·답변·게임 소스를 안 읽는 작업은 된다
4. **예약 작업 등록** — Claude 앱에서 이 레포 폴더로 세션을 열고 이렇게 말한다:
   > `docs/autopilot-daily-prompt.md`의 내용으로 매일 아침 8시 30분 예약 작업 `dstcraft-autopilot-daily`를 만들어 줘.
   - 무인으로 돌려면 도구 사용을 묻지 않는 권한 모드로 저장돼야 한다. 등록 결과에 어떤 모드로 저장됐는지 나온다
   - 예약 작업은 **앱이 켜져 있을 때만** 돈다
5. **옛 기기의 예약 작업을 끈다** — 두 기기가 같이 돌면 같은 피드백에 답변을 두 번 달고 같은 이슈를 두 번 작업한다. 반드시 한 곳만
6. **첫 회차 확인** — 앱의 Scheduled에서 "지금 실행"으로 한 번 돌려 보고 형식(`[autopilot MM/DD] …`)의 보고가 나오는지 본다
7. 이 문서 1장의 날짜·상태를 갱신한다

### 앱 예약 작업을 못 쓰는 환경이라면
- **수동 운영**: 아무 기기에서나 Claude Code로 이 레포를 열고 "autopilot 한 회차 돌려 줘"라고 하면 된다. 규칙이 전부 레포에 있어서 같은 결과가 나온다. 매일이 아니라 생각날 때만 해도 된다
- **클라우드 예약 실행**은 게임 스냅샷과 맥미니 ssh에 닿지 못한다. 헬스 점검·피드백 답변(`gh` 인증이 있다면)·게임 소스를 안 읽는 작업까지만 가능하다. 헤드리스 검증 환경도 직접 갖춰야 한다 — 시도해 본 적 없음

---

## 5. 멈추기

| 하고 싶은 것 | 방법 |
|---|---|
| 잠깐 멈춤 | Claude 앱 → Scheduled → `dstcraft-autopilot-daily` 끄기. 다시 켜면 그날 상태부터 이어 간다. 놓친 날을 따라잡을 필요 없음 |
| 이 기기에서만 그만 | 위와 같이 끄고, 4장대로 다른 기기에서 켠다 |
| 위임 자체를 거둠 (코드는 유지) | 예약 작업을 지우고, `CLAUDE.md` Autopilot 절과 `autopilot.md` 첫머리를 "종료"로, 피드백 답변 규칙을 "문구 확인 필수"로 되돌린다 |
| 위임 전 상태로 되돌림 | `autopilot.md` 4.3절 — 장부를 보고 골라서 revert |

멈춘 동안 생기는 일: 새 피드백이 답변 없이 쌓인다(사이트의 "확인 중" 표시), 게임 패치가 반영되지 않는다. 장애 감지·자동 failover는 워치독이 계속 한다.

**멈추기 전에 확인할 것** — 중간에 끊긴 작업이 없는지:
```bash
git worktree list                      # 낯선 dst-craft-<num> 워크트리가 있나
git status --short                     # 각 워크트리에 미커밋 변경이 있나
git log origin/main..HEAD --oneline    # 미푸시 커밋이 있나
```
있으면 커밋·푸시까지만 해 두면 다른 기기에서 이어 갈 수 있다.
