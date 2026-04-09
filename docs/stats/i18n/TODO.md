# 아이템 스펙 다국어 번역 TODO

> 이 문서는 리모트 세션에서 이어서 작업하기 위한 가이드입니다.
> 작업자: Claude Code 에이전트 (1개씩 순차 실행)

## 배경

- `docs/stats/*.md` 26개 파일에 774개 아이템 스펙이 한국어로 작성됨
- 한국어 다듬기 완료 (코드 상수 제거, 영문 재료명 한국어화, 필드명 표준화)
- `docs/stats/i18n/_source_ko.md`에 번역 소스 통합 추출 (760개 아이템, 4357줄)
- 목표: 12개 언어로 번역 (한국어 제외)

## 현재 상태

### 완료 ✅
- **zh_CN** (简体中文): 4357줄, 한국어 0% — 완벽

### 불완전 ⚠️ (한국어 잔존, 재번역 필요)
| 파일 | 줄 수 | 한국어 잔존 | 비고 |
|------|-------|------------|------|
| de.md | 4358 | 761줄 (17%) | 포맷 정상 |
| fr.md | 4358 | 761줄 (17%) | 포맷 정상 |
| it.md | 4358 | 761줄 (17%) | 포맷 정상 |
| en.md | 4357 | 1366줄 (31%) | Python 사전 치환 시도 흔적 |
| ja.md | 4357 | 1629줄 (37%) | Python 사전 치환 시도 흔적 |
| es.md | 1679 | 569줄 (33%) | 줄바꿈 깨짐 (한 줄에 여러 필드) |
| es_MX.md | 1679 | 569줄 (33%) | 줄바꿈 깨짐 |
| pt_BR.md | 1679 | 569줄 (33%) | 줄바꿈 깨짐 |

### 미생성 ❌
- **zh_TW** (繁體中文) — zh_CN 기반 간체→번체 변환 + 용어 교정하면 빠름
- **pl** (Polski)
- **ru** (Русский)

## 작업 방법

### 에이전트 프롬프트 템플릿

각 언어당 에이전트 1개씩 순차 실행. 아래 프롬프트를 언어별로 수정해서 사용:

```
Translate DST item stats from Korean to {LANGUAGE}.

Read: /Users/jihwan-kim3/private-works/dst-craft/docs/stats/i18n/_source_ko.md (760 items, 4357 lines)

CRITICAL RULES:
1. Translate ALL Korean text. Zero Korean characters (가-힣) must remain.
2. Keep `## item_id` headers as-is (don't translate IDs)
3. Keep all numbers/percentages/stats as-is
4. Each `- ` line on its own line (proper line breaks!)
5. Field label translations:
   - 타입→{type}, 스택→{stack}, 해머 횟수→{hammer hits}
   - 사용 횟수→{uses}, 피해량→{damage}, 체력→{health}
   - 포만도→{hunger}, 정신력→{sanity}, 가연성→{flammable}
   - 수리 재료→{repair material}, 해머 전리품→{hammer loot}
   - 장착 슬롯→{equip slot}, 빛 반경→{light radius}
   - 연료 지속→{fuel duration}, 유통기한→{perish time}
6. Game terms should use official DST translations for the target language

Write to: /Users/jihwan-kim3/private-works/dst-craft/docs/stats/i18n/{lang}.md
Header: `# Item Stats — {Language Name}`

Process ALL 760 items completely.
```

### 작업 순서 (권장)

1. **en** (영어) — 가장 중요, 다른 언어 번역의 참고 기준
2. **ja** (일본어) — 유저 비중 높음
3. **zh_TW** (번체) — zh_CN 기반 변환으로 빠름
4. **de, fr, it** — 유럽어 3개
5. **es, es_MX, pt_BR** — 로망스어 3개 (줄바꿈 깨짐 주의!)
6. **pl, ru** — 슬라브어 2개

### 완료 후 검증

각 언어 완료 후 검증 명령:
```bash
# 한국어 잔존 확인
grep -c '[가-힣]' docs/stats/i18n/{lang}.md

# 아이템 수 확인 (760개여야 함)
grep -c '^## ' docs/stats/i18n/{lang}.md

# 줄 수 확인 (4357 ± 10 정도여야 함)
wc -l docs/stats/i18n/{lang}.md
```

### 주의사항

- **에이전트 1개씩만** 실행 (사용량 관리)
- es/es_MX/pt_BR은 이전 시도에서 줄바꿈이 깨졌으므로 "EACH line on its OWN LINE" 강조 필요
- zh_TW는 zh_CN.md를 읽고 간체→번체 변환하는 방식이 효율적
- Python 사전 기반 번역(translate.py)은 ~63%만 커버 — 에이전트 번역이 품질 우수

## 관련 파일

- `docs/stats/i18n/_source_ko.md` — 번역 소스 (한국어, 760개 아이템)
- `docs/stats/i18n/zh_CN.md` — 완료된 중국어 간체 (참고용)
- `docs/stats/i18n/translate.py` — Python 사전 기반 번역 스크립트 (보조용)
- `docs/stats/*.md` — 원본 한국어 스펙 (26개 파일)
- `docs/item-stats-todo.md` — 전체 파이프라인 TODO
