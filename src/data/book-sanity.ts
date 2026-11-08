// 자동 생성 — scripts/extract-books.py. 수동 편집 금지 (#143)

/** read: 위커바텀·맥스웰 읽기 기본값(맥스웰은 배율 적용) / peruse: 워트 */
export const bookSanity: Record<string, { read: number; peruse: number }> = {
  book_tentacles: { read: -50, peruse: 50 },
  book_birds: { read: -50, peruse: 50 },
  book_brimstone: { read: -33, peruse: -33 },
  book_sleep: { read: -33, peruse: 33 },
  book_gardening: { read: -33, peruse: -33 },
  book_horticulture: { read: -33, peruse: -33 },
  book_horticulture_upgraded: { read: -33, peruse: -50 },
  book_silviculture: { read: -33, peruse: -33 },
  book_fish: { read: -33, peruse: 50 },
  book_fire: { read: -33, peruse: -33 },
  book_web: { read: -33, peruse: 33 },
  book_temperature: { read: -33, peruse: 33 },
  book_light: { read: -33, peruse: 33 },
  book_light_upgraded: { read: -33, peruse: 50 },
  book_rain: { read: -33, peruse: 33 },
  book_moon: { read: -50, peruse: -33 },
  book_bees: { read: -33, peruse: -33 },
  book_research_station: { read: -33, peruse: 33 },
};

export const MAXWELL_READING_SANITY_MULT = 2.5;
