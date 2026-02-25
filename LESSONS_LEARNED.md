# Lessons Learned (오답노트)

개발 과정에서 발생한 실수와 해결 방법을 기록합니다.
같은 실수를 반복하지 않기 위한 참고 문서입니다.

---

## 1. 아이템 추가 시 이미지 파일 누락

**날짜**: 2026-02-25
**증상**: 새로 추가한 캐릭터 고유 아이템들의 아이콘이 표시되지 않음 (? 또는 텍스트 fallback)
**원인**: `items.ts`에 아이템 데이터를 추가하면서 `/public/images/items/` 디렉토리에 해당 이미지 파일을 넣지 않음
**영향받은 아이템**: Wigfrid 전투 노래 7종, 스킬트리 아이템 7종, Wendy 영약 5종+, Wickerbottom 책 3종+, 기타 캐릭터 아이템 다수

### 체크리스트 (아이템 추가 시 반드시 확인)
- [ ] `items.ts`에 데이터 추가
- [ ] `/public/images/items/{이미지명}.png` 파일 존재 확인
- [ ] `/public/images/materials/{재료이미지명}.png` 파일 존재 확인 (새 재료 추가 시)
- [ ] `ko.ts` items 번역 추가
- [ ] `ko.ts` materials 번역 추가 (새 재료 추가 시)
- [ ] 이미지 파일명이 `items.ts`의 `image` 필드와 정확히 일치하는지 확인

### 이미지 경로 규칙
- 아이템 이미지: `/public/images/items/{PascalCase_Name}.png` (예: `Battle_Spear.png`)
- 재료 이미지: `/public/images/materials/{snake_case_name}.png` (예: `nightmare_fuel.png`)

---

## 2. 한국어 번역 정확도

**날짜**: 2026-02-25
**증상**: 한국어 번역이 게임 내 공식 번역과 다름
**원인**: 영어 이름을 직접 번역하거나 음차하여 사용함. 공식 korean.po 파일을 참조하지 않음
**예시**:
- `Elding Spear`: "엘딩 스피어" (음차) → 공식: **"낙뢰 창"** (의역)
- `Sisturn`: "시스턴" (음차) → 공식: **"자매 납골당"** (의역)
- `Mourning Glory`: "추모의 영광" (직역) → 공식: **"비탄꽃"** (의역)

### 해결 방법
- `reference/korean.po` 파일을 참조 데이터로 프로젝트에 포함 (.gitignore 처리)
- 소스: https://github.com/CN-DST-DEVELOPER/scripts/blob/main/languages/korean.po
- 아이템/재료 추가 시 반드시 korean.po에서 `STRINGS.NAMES.*` 항목의 공식 번역을 확인

### 검색 방법
```bash
# korean.po에서 아이템 이름 검색
grep -A2 'msgid "Battle Spear"' reference/korean.po
```

---

## 3. Next.js 하이드레이션 오류

**날짜**: 2026-02-25
**증상**: SSR 페이지 로드 시 hydration mismatch 오류 발생
**원인**: `useState(readUrlState)`에서 서버(URL 없음)와 클라이언트(URL 파라미터 있음)의 초기값이 달라짐
**해결**: SSR-safe 기본값으로 초기화 후, `useEffect`에서 마운트 후 URL 상태 동기화

### 규칙
- URL/localStorage/window 등 브라우저 전용 API에 의존하는 상태는 `useState(기본값)` + `useEffect`로 초기화
- `use-settings.tsx`의 `mounted` 패턴 참고

---

## 4. iOS Safari 입력 필드 자동 확대

**날짜**: 2026-02-25
**증상**: iPhone에서 검색 필드 터치 시 화면이 확대됨
**원인**: iOS Safari는 font-size가 16px 미만인 input에 자동 줌 적용
**해결**: 모바일에서 `text-base` (16px), 데스크톱에서 `text-sm` (14px) 사용
```
className="text-base sm:text-sm"
```

---

## 5. 뒤로가기 네비게이션 - 새 탭에서 동작 안함

**날짜**: 2026-02-25
**증상**: URL을 복사해서 새 탭에 붙여넣기 후 뒤로가기 버튼이 상위 페이지가 아닌 빈 페이지로 이동
**원인**: `window.history.back()`은 히스토리 스택에 의존하므로, 새 탭에서는 이전 페이지가 없음
**해결**: `pushState`에 `{ _appNav: true }` 플래그를 추가하고, `goBack`에서 플래그 유무에 따라 `history.back()` 또는 URL 기반 상위 페이지 이동 분기
