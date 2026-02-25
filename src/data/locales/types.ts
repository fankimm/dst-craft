export interface LocaleData {
  items: Record<string, { name?: string; desc?: string }>;
  materials: Record<string, { name?: string }>;
  categories: Record<string, { name?: string }>;
  characters: Record<string, { name?: string }>;
}
