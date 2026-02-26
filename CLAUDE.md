# CLAUDE.md

## Communication Rules
- 유저가 모호하게 요청하면 바로 작업하지 말고, 용어집(docs/terminology.md)의 용어로 확인 질문을 한 뒤 진행할 것
- 용어집에 없는 새 UI 요소나 개념이 등장하면 용어집에 추가 제안할 것

## Project
- Don't Starve Together 크래프팅 레시피 가이드 웹앱
- Next.js 16 (App Router, Static Export) + TypeScript + Tailwind CSS v4 + shadcn/ui
- GitHub Pages 배포, PWA 지원

## Key Paths
- `src/data/` — 게임 데이터 (categories, characters, materials, items/)
- `src/components/crafting/` — 메인 앱 컴포넌트
- `src/hooks/` — 커스텀 훅 (use-crafting-state, use-settings, use-search)
- `src/lib/` — 유틸리티 (types, i18n, crafting-data, utils)
- `docs/terminology.md` — UI 용어집
