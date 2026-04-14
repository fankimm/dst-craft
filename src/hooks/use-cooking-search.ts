"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { CookingRecipe } from "@/data/recipes";
import { cookingRecipes } from "@/data/recipes";
import { cookpotIngredients } from "@/data/cookpot-ingredients";
import { foodName } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
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

export function getCookingSuggestions(query: string, locale: Locale): CookingSuggestion[] {
  const lower = query.toLowerCase();
  if (!lower) return [];
  const results: CookingSuggestion[] = [];
  const seen = new Set<string>();

  // 1. Ingredient tag suggestions (Meat, Veggie, etc.)
  for (const [engTag, icon] of Object.entries(tagIcons)) {
    const translated = reqTagTranslations[locale]?.[engTag];
    const names = [engTag.toLowerCase()];
    if (translated) names.push(translated.toLowerCase());
    if (names.some(n => n.includes(lower))) {
      if (!seen.has(engTag)) {
        seen.add(engTag);
        results.push({
          text: translated || engTag,
          type: "ingredient",
          image: `game-items/${icon}`,
          engName: engTag,
        });
      }
    }
  }

  // 2. Individual ingredient suggestions
  for (const ing of cookpotIngredients) {
    const names = [ing.name.toLowerCase()];
    if (ing.nameKo) names.push(ing.nameKo.toLowerCase());
    if (names.some(n => n.includes(lower)) && !seen.has(ing.name)) {
      seen.add(ing.name);
      results.push({
        text: locale === "ko" && ing.nameKo ? ing.nameKo : ing.name,
        type: "ingredient",
        image: `game-items/${ingredientImage(ing)}`,
        engName: ing.name,
      });
    }
    if (results.length >= 12) break;
  }

  // 3. Recipe name suggestions
  const q = lower;
  for (const r of cookingRecipes) {
    if (results.length >= 12) break;
    const localName = foodName(r, locale).toLowerCase();
    const engName = r.name.toLowerCase();
    if ((localName.includes(q) || engName.includes(q)) && !seen.has(r.id)) {
      seen.add(r.id);
      results.push({
        text: foodName(r, locale),
        type: "text",
        image: `game-items/${r.id}.png`,
        engName: r.id,
      });
    }
  }

  return results.slice(0, 12);
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
  };
}
