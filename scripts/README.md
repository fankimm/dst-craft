# Scripts

유틸리티 스크립트 목록.

| 파일 | 설명 | 사용법 |
|------|------|--------|
| `check-data.cjs` | 데이터 무결성 검증 (중복 ID, 재료 참조 확인) | `node scripts/check-data.cjs` |
| `migrate-data.cjs` | 구 nameEn/nameKo 형식 → 방식C(영어 기본+로케일 분리) 마이그레이션 | `node scripts/migrate-data.cjs` |
| `add-items.cjs` | 신규 아이템 추가 + 한글명 교정 스크립트 | `node scripts/add-items.cjs` |
| `download-images.ts` | 위키에서 아이템/재료 이미지 다운로드 | `npx tsx scripts/download-images.ts` |
