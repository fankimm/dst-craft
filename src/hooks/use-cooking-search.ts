"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { CookingRecipe } from "@/data/recipes";
import { cookingRecipes } from "@/data/recipes";
import { cookpotIngredients } from "@/data/cookpot-ingredients";
import { foodName, t } from "@/lib/i18n";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";

// ── Tag types for cooking search ──

export type CookingTagType =
  | "ingredient"   // 재료 (고기, 채소, 열매 등 태그 or 개별 재료)
  | "station"      // 요리솥 / 이동식 요리솥
  | "foodType"     // 음식 유형 (meat, veggie, goodies 등)
  | "effect"       // 특수 효과 (temperature, speed 등)
  | "text";        // 자유 텍스트 검색

export interface CookingSearchTag {
  text: string;
  type: CookingTagType;
  image?: string;
  engName?: string; // ingredient의 영문 원본명
}

// ── Ingredient tag translations (for matching) ──

const reqTagTranslations: Record<string, Record<string, string>> = {
  ko: {
    Meat: "고기", Veggie: "채소", Fruit: "열매", Fish: "생선",
    Egg: "달걀", Sweetener: "감미료", Dairy: "유제품", Monster: "괴물",
    Frozen: "냉동", Decoration: "장식", Inedible: "비식용", Fat: "지방",
    Magic: "마법",
  },
  en: {},
  ja: {
    Meat: "肉", Veggie: "野菜", Fruit: "果物", Fish: "魚",
    Egg: "卵", Sweetener: "甘味料", Dairy: "乳製品", Monster: "モンスター",
  },
};

const tagIcons: Record<string, string> = {
  Meat: "meat.png", Veggie: "carrot.png", Fruit: "berries.png",
  Fish: "fish.png", Egg: "bird_egg.png", Sweetener: "honey.png",
  Dairy: "butter.png", Monster: "monstermeat.png", Frozen: "ice.png",
  Decoration: "succulent_picked.png", Inedible: "twigs.png",
  Fat: "butter.png", Magic: "nightmarefuel.png",
};

// ── Helper: parse requirement entry ──

function parseReqEntry(entry: string): { name: string; op: string; val: number } {
  const m = entry.match(/^(.+?)\s*(×|≥|>|<|≤|==)\s*(\d+(?:\.\d+)?)$/);
  if (m) return { name: m[1].trim(), op: m[2], val: parseFloat(m[3]) };
  return { name: entry.trim(), op: ">=", val: 1 };
}

// ── Helper: translate requirement tag ──

function translateReq(tag: string, locale: Locale): string {
  return reqTagTranslations[locale]?.[tag] ?? tag;
}

// ── Search function ──

function searchRecipes(
  tags: CookingSearchTag[],
  locale: Locale,
): CookingRecipe[] {
  if (tags.length === 0) return [];

  return cookingRecipes.filter((recipe) => {
    return tags.every((tag) => {
      switch (tag.type) {
        case "station":
          return recipe.station === tag.engName;

        case "foodType":
          return recipe.foodType === tag.engName;

        case "effect":
          return recipe.specialEffect === tag.engName;

        case "ingredient": {
          if (!recipe.requirements) return false;
          const items = recipe.requirements.split(",").map(s => s.trim()).filter(Boolean);
          return items.some(item => {
            if (item.startsWith("No ")) return false;
            const { name } = parseReqEntry(item);
            return name.split(/\s*\/\s*/).some(part => part === tag.engName);
          });
        }

        case "text": {
          const q = tag.text.toLowerCase();
          const localName = foodName(recipe, locale).toLowerCase();
          const engName = recipe.name.toLowerCase();
          // Search name
          if (localName.includes(q) || engName.includes(q)) return true;
          // Search requirements/ingredients
          if (recipe.requirements) {
            const items = recipe.requirements.split(",").map(s => s.trim()).filter(Boolean);
            for (const item of items) {
              const raw = item.replace(/^No\s+/, "");
              const { name } = parseReqEntry(raw);
              const parts = name.split(/\s*\/\s*/);
              for (const part of parts) {
                if (part.toLowerCase().includes(q)) return true;
                const translated = translateReq(part, locale);
                if (translated.toLowerCase().includes(q)) return true;
              }
            }
          }
          // Search effect
          if (recipe.specialEffect?.toLowerCase().includes(q)) return true;
          // Search food type
          if (recipe.foodType?.toLowerCase().includes(q)) return true;
          return false;
        }
      }
    });
  });
}

// ── Suggestion generation ──

export interface CookingSuggestion {
  text: string;
  type: CookingTagType;
  image?: string;
  engName: string;
}

function ingredientImage(ing: { id: string; image?: string }): string {
  return ing.image ?? `${ing.id}.png`;
}

// ── Catalog metadata for foodType / station / effect suggestions ──

const foodTypeMeta: Record<string, { key: TranslationKey; image: string }> = {
  meat:     { key: "foodtype_meat",     image: "game-items/meat.png" },
  veggie:   { key: "foodtype_veggie",   image: "game-items/carrot.png" },
  goodies:  { key: "foodtype_goodies",  image: "game-items/honey.png" },
  roughage: { key: "foodtype_roughage", image: "game-items/cutlichen.png" },
  nonfood:  { key: "foodtype_nonfood",  image: "game-items/batnosehat.png" },
};

const stationMeta: Record<string, { key: TranslationKey; image: string }> = {
  cookpot:         { key: "cooking_cookpot",         image: "game-items/cookpot.png" },
  portablecookpot: { key: "cooking_portablecookpot", image: "game-items/portablecookpot_item.png" },
  campfire:        { key: "cooking_campfire",        image: "game-items/campfire.png" },
  dryingrack:      { key: "cooking_dryingrack",      image: "game-items/meatrack.png" },
};

// effect_<value> keys must exist in i18n.ts for these to render localized labels.
const effectKey = (value: string) => `effect_${value}` as TranslationKey;

function effectLabel(value: string, locale: Locale): string {
  const key = effectKey(value);
  const label = t(locale, key);
  return label !== key ? label : value;
}

/** Distinct foodType / station / specialEffect values that actually appear in recipes. */
const distinctFoodTypes: string[] = Array.from(
  new Set(cookingRecipes.map((r) => r.foodType as string)),
).filter((v) => v in foodTypeMeta);
const distinctStations: string[] = Array.from(
  new Set(cookingRecipes.map((r) => r.station as string)),
).filter((v) => v in stationMeta);
const distinctEffects: string[] = Array.from(
  new Set(
    cookingRecipes
      .map((r) => r.specialEffect)
      .filter((v): v is NonNullable<typeof v> => v != null),
  ),
);

export function getCookingSuggestions(query: string, locale: Locale): CookingSuggestion[] {
  const lower = query.toLowerCase();
  if (!lower) return [];
  const results: CookingSuggestion[] = [];
  const seen = new Set<string>();

  // Match priority mirrors the crafting tab (broad → narrow):
  // foodType → ingredient tag → station → effect → individual ingredient → recipe name

  // 1. Food type (meat / veggie / goodies / ...)
  for (const value of distinctFoodTypes) {
    const meta = foodTypeMeta[value];
    const localized = t(locale, meta.key);
    const names = [value, localized.toLowerCase()];
    const id = `foodType:${value}`;
    if (names.some((n) => n.includes(lower)) && !seen.has(id)) {
      seen.add(id);
      results.push({ text: localized, type: "foodType", image: meta.image, engName: value });
    }
  }

  // 2. Ingredient tag (Meat / Veggie / Fruit / ... — these are recipe-requirement tokens)
  for (const [engTag, icon] of Object.entries(tagIcons)) {
    const translated = reqTagTranslations[locale]?.[engTag];
    const names = [engTag.toLowerCase()];
    if (translated) names.push(translated.toLowerCase());
    const id = `ingredient:${engTag}`;
    if (names.some((n) => n.includes(lower)) && !seen.has(id)) {
      seen.add(id);
      results.push({
        text: translated || engTag,
        type: "ingredient",
        image: `game-items/${icon}`,
        engName: engTag,
      });
    }
  }

  // 3. Station (cookpot / portable / campfire / dryingrack)
  for (const value of distinctStations) {
    const meta = stationMeta[value];
    const localized = t(locale, meta.key);
    const names = [value, localized.toLowerCase()];
    const id = `station:${value}`;
    if (names.some((n) => n.includes(lower)) && !seen.has(id)) {
      seen.add(id);
      results.push({ text: localized, type: "station", image: meta.image, engName: value });
    }
  }

  // 4. Special effect (heat_resistance / electric_attack / ...)
  for (const value of distinctEffects) {
    const localized = effectLabel(value, locale);
    const names = [value.toLowerCase(), localized.toLowerCase()];
    const id = `effect:${value}`;
    if (names.some((n) => n.includes(lower)) && !seen.has(id)) {
      seen.add(id);
      results.push({ text: localized, type: "effect", engName: value });
    }
  }

  // 5. Individual ingredient (carrot / monstermeat / ...)
  for (const ing of cookpotIngredients) {
    const names = [ing.name.toLowerCase()];
    if (ing.nameKo) names.push(ing.nameKo.toLowerCase());
    const id = `ingredient:${ing.name}`;
    if (names.some((n) => n.includes(lower)) && !seen.has(id)) {
      seen.add(id);
      results.push({
        text: locale === "ko" && ing.nameKo ? ing.nameKo : ing.name,
        type: "ingredient",
        image: `game-items/${ingredientImage(ing)}`,
        engName: ing.name,
      });
    }
  }

  // 6. Recipe name (Meatballs / Pierogi / ...)
  for (const r of cookingRecipes) {
    const localName = foodName(r, locale).toLowerCase();
    const engName = r.name.toLowerCase();
    const id = `text:${r.id}`;
    if ((localName.includes(lower) || engName.includes(lower)) && !seen.has(id)) {
      seen.add(id);
      results.push({
        text: foodName(r, locale),
        type: "text",
        image: `game-items/${r.id}.png`,
        engName: r.id,
      });
    }
  }

  return results;
}

// ── Hook ──

function tagKey(tags: CookingSearchTag[]): string {
  return tags.map((t) => `${t.type}\x01${t.text}\x01${t.engName ?? ""}`).join("\0");
}

export function useCookingSearch(locale: Locale) {
  const { isAdmin } = useAuth();
  const [tags, setTags] = useState<CookingSearchTag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [debouncedTags, setDebouncedTags] = useState<CookingSearchTag[]>([]);
  const [results, setResults] = useState<CookingRecipe[]>([]);
  const searchTracked = useRef(false);

  const effectiveTags: CookingSearchTag[] = useMemo(() =>
    inputValue.trim()
      ? [...tags, { text: inputValue.trim(), type: "text" as const }]
      : tags,
    [tags, inputValue]
  );

  // `pending` is true while the 300ms debounce is in flight — i.e., the user
  // typed something that hasn't yet been reflected in `results`. Used by
  // CookingSearchBar for transient "검색 중" visual feedback.
  const pending = tagKey(effectiveTags) !== tagKey(debouncedTags);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTags(effectiveTags), 300);
    return () => clearTimeout(timer);
  }, [tagKey(effectiveTags)]);

  useEffect(() => {
    if (debouncedTags.length === 0) {
      setResults([]);
      return;
    }
    setResults(searchRecipes(debouncedTags, locale));
    if (!searchTracked.current) {
      searchTracked.current = true;
      trackEvent("search", isAdmin);
    }
  }, [tagKey(debouncedTags), locale]);

  const addTag = useCallback(
    (value: string | CookingSearchTag) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed && !tags.some((t) => t.text === trimmed)) {
          setTags((prev) => [...prev, { text: trimmed, type: "text" }]);
        }
      } else {
        if (!tags.some((t) => t.engName === value.engName && t.type === value.type)) {
          setTags((prev) => [...prev, value]);
        }
      }
      setInputValue("");
    },
    [tags]
  );

  const removeTag = useCallback((index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setTags([]);
    setInputValue("");
  }, []);

  const isSearching = tags.length > 0 || inputValue.trim().length > 0;

  return {
    tags,
    inputValue,
    setInputValue,
    addTag,
    removeTag,
    clearAll,
    results,
    isSearching,
    pending,
  };
}
