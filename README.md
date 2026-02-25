# DST Crafting Guide

Don't Starve Together 크래프팅 레시피 가이드 웹앱.

## Features

- **카테고리 드릴다운 네비게이션**: 카테고리 그리드 → 아이템 목록 → 아이템 상세. URL 쿼리 파라미터 기반으로 브라우저 뒤로가기/앞으로가기 지원 (Safari 스와이프 제스처 포함)
- **21개 카테고리**: 캐릭터 고유, 도구, 조명, 제작대, 정제 재료, 무기, 갑옷, 의상, 치유, 마법, 장식, 건축물, 저장, 요리, 식량/원예, 낚시, 항해, 비팔로, 겨울, 여름, 방수
- **100+ 크래프팅 아이템**: 재료, 제작대, 카테고리 정보 포함. 다중 카테고리 지원 (예: 눈우산 → 방수/의상/여름)
- **30개 캐릭터 고유 아이템**: Willow, Wolfgang, Wendy, Wickerbottom, Maxwell, Wigfrid, Webber, Warly, Wormwood, Winona, Walter, Wanda
- **19명 캐릭터 필터**: 캐릭터별 고유 아이템 필터링
- **다크/라이트/시스템 테마**: 설정 버튼으로 전환. CSS 변수 기반 시맨틱 컬러 토큰
- **한국어/영어 지원**: 브라우저 언어 자동 감지 (시스템 설정) 또는 수동 선택
- **PWA**: 오프라인 지원, 홈 화면에 추가 가능
- **반응형 디자인**: 모바일 바텀시트 + 데스크탑 하단 패널

## Tech Stack

- [Next.js](https://nextjs.org) 15 (App Router, Static Export)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (Button, Input, ScrollArea, Tooltip, Sheet, Badge)
- [Lucide React](https://lucide.dev) (아이콘)

## Getting Started

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인.

## Build

```bash
npm run build
```

`out/` 디렉토리에 정적 파일 생성. 아무 정적 호스팅에 배포 가능.

## Project Structure

```
src/
├── app/                    # Next.js 페이지 (layout, page, globals.css)
├── components/
│   ├── crafting/           # 메인 앱 컴포넌트
│   │   ├── CraftingApp     # 메인 앱 (드릴다운 네비게이션)
│   │   ├── CategoryGrid    # 카테고리 선택 그리드
│   │   ├── CategoryHeader  # 헤더 (뒤로가기 + 검색 + 설정)
│   │   ├── ItemGrid        # 아이템 목록 그리드
│   │   ├── ItemIcon        # 아이템 카드
│   │   ├── ItemDetail      # 아이템 상세 (카테고리 배지, 재료)
│   │   ├── CharacterSelector # 캐릭터 필터
│   │   ├── SearchBar       # 검색
│   │   ├── SettingsButton  # 테마/언어 설정
│   │   └── MaterialSlot    # 재료 슬롯
│   └── ui/                 # shadcn/ui 컴포넌트
├── data/                   # 게임 데이터
│   ├── categories.ts       # 21개 카테고리
│   ├── characters.ts       # 19명 캐릭터
│   ├── materials.ts        # 재료 목록
│   └── items/              # 카테고리별 아이템 데이터
├── hooks/                  # React 커스텀 훅
│   ├── use-crafting-state  # URL 기반 상태 관리
│   ├── use-settings        # 테마/언어 Context
│   └── use-search          # 검색
└── lib/                    # 유틸리티
    ├── types.ts            # TypeScript 타입
    ├── i18n.ts             # 번역 (한/영)
    ├── crafting-data.ts    # 데이터 쿼리 함수
    └── utils.ts            # cn() 유틸리티
```
