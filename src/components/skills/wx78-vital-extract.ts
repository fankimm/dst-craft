// WX-78 회로 본문 텍스트에서 vital(최대 체력/허기/정신력) 부분을 추출하는 헬퍼.
// 추출된 vital은 Status 패널 StatBox 헤더에 합산 카드로, 나머지(rest)만 effect row 본문으로 사용.
// Circuit Board detail 패널과 Status 패널 양쪽에서 동일하게 사용 → ko/en 동작 대칭 보장.

export type VitalKind = "maxHealth" | "maxSanity" | "maxHunger";

const VITAL_FROM_KO_LABEL: Record<string, VitalKind> = {
  "체력": "maxHealth",
  "정신력": "maxSanity",
  "허기": "maxHunger",
};

const VITAL_FROM_EN_LABEL: Record<string, VitalKind> = {
  "Health": "maxHealth",
  "Sanity": "maxSanity",
  "Hunger": "maxHunger",
};

// 표준화 케이스:
//   1) standalone:  "최대 X(이|가) N 증가한다."
//   2) 앞에 붙은 compound:  "최대 X(이|가) N 증가하고[, ] ..."
//   3) 끝에 붙은 compound:  "..., 최대 X(이|가) N 증가한다."
export function extractVitalKo(text: string): { kind: VitalKind; perModule: number; rest: string } | null {
  let m = text.match(/^최대 (체력|정신력|허기)(?:이|가) (\d+) 증가한다\.?\s*$/);
  if (m) return { kind: VITAL_FROM_KO_LABEL[m[1]], perModule: parseInt(m[2], 10), rest: "" };
  m = text.match(/^최대 (체력|정신력|허기)(?:이|가) (\d+) 증가하고[,\s]+(.+)$/);
  if (m) return { kind: VITAL_FROM_KO_LABEL[m[1]], perModule: parseInt(m[2], 10), rest: m[3].trim() };
  m = text.match(/^(.+),\s*최대 (체력|정신력|허기)(?:이|가) (\d+) 증가한다\.?\s*$/);
  if (m) {
    const rest = m[1].trim();
    return { kind: VITAL_FROM_KO_LABEL[m[2]], perModule: parseInt(m[3], 10), rest: rest.endsWith(".") ? rest : `${rest}.` };
  }
  return null;
}

// extractVitalKo의 영문 미러. Klei scrapbook은 두 패턴을 혼용:
//   "raises Maximum X +N." / "raises Maximum X +N points."
//   "increases Maximum X by N points."
// 결합 형태도 처리:
//   1) standalone
//   2) 앞:  "increases Maximum X by N points and ..."
//   3) 뒤:  "... and increases Maximum X by N points." / "..., increases Maximum X by N points."
export function extractVitalEn(text: string): { kind: VitalKind; perModule: number; rest: string } | null {
  let m = text.match(/^(?:raises|increases)\s+Maximum\s+(Health|Sanity|Hunger)\s+(?:by\s+)?\+?(\d+)(?:\s+points?)?\.?\s*$/);
  if (m) return { kind: VITAL_FROM_EN_LABEL[m[1]], perModule: parseInt(m[2], 10), rest: "" };
  m = text.match(/^(?:raises|increases)\s+Maximum\s+(Health|Sanity|Hunger)\s+(?:by\s+)?\+?(\d+)(?:\s+points?)?\s+and\s+(.+)$/);
  if (m) return { kind: VITAL_FROM_EN_LABEL[m[1]], perModule: parseInt(m[2], 10), rest: m[3].trim() };
  m = text.match(/^(.+?)(?:\s+and|,)\s+(?:raises|increases)\s+Maximum\s+(Health|Sanity|Hunger)\s+(?:by\s+)?\+?(\d+)(?:\s+points?)?\.?\s*$/);
  if (m) {
    const rest = m[1].trim();
    return { kind: VITAL_FROM_EN_LABEL[m[2]], perModule: parseInt(m[3], 10), rest: rest.endsWith(".") ? rest : `${rest}.` };
  }
  return null;
}

// locale-aware vital 추출 (ko/en 자동 분기)
export function extractVital(text: string, locale: string): { kind: VitalKind; perModule: number; rest: string } | null {
  return locale === "ko" ? extractVitalKo(text) : extractVitalEn(text);
}
