"use client";

import Image from "next/image";
import { characters } from "@/data/characters";
import { characterName, characterTitle, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CHARACTERS_WITH_SKILLS } from "@/data/skill-trees/registry";
import { Footer } from "../crafting/Footer";

interface Props {
  locale: Locale;
  onSelect: (characterId: string) => void;
}

const skillCharacters = characters.filter((c) =>
  CHARACTERS_WITH_SKILLS.includes(c.id),
);

export function SkillCharacterGrid({ locale, onSelect }: Props) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 max-w-4xl mx-auto w-full">
        {skillCharacters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-lg border bg-surface",
              "hover:bg-surface-hover hover:border-ring transition-colors touch-manipulation",
            )}
          >
            <Image
              src={`/images/category-icons/characters/${char.portrait}.png`}
              alt={char.name}
              width={56}
              height={56}
              className="size-14 rounded-full"
            />
            <span className="text-xs font-medium text-foreground truncate w-full text-center">
              {characterName(char, locale)}
            </span>
            {characterTitle(char, locale) && (
              <span className="text-[10px] text-muted-foreground truncate w-full text-center -mt-1">
                {characterTitle(char, locale)}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
