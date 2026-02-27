export interface LocaleData {
  items: Record<string, { name?: string; desc?: string }>;
  materials: Record<string, { name?: string }>;
  categories: Record<string, { name?: string }>;
  characters: Record<string, { name?: string }>;
  /** Station names for stations without a corresponding item (none, ancient, etc.) */
  stations?: Record<string, { name?: string }>;
  /** Cooking recipe names */
  foods?: Record<string, { name?: string }>;
}
