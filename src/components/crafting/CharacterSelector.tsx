"use client";

import type { Character } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { t, characterName } from "@/lib/i18n";
import { assetPath } from "@/lib/asset-path";

interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacter: string | null;
  onSelectCharacter: (characterId: string | null) => void;
}

function CharacterAvatar({
  character,
  isSelected,
  onClick,
  locale,
}: {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
  locale: "ko" | "en";
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover",
        isSelected
          ? "border-amber-500 ring-1 ring-amber-500/50"
          : "border-border hover:border-ring"
      )}
    >
      {imgError ? (
        <div className="flex items-center justify-center size-12 sm:size-14">
          <span className="text-sm text-muted-foreground font-medium">
            {characterName(character, locale).charAt(0)}
          </span>
        </div>
      ) : (
        <img
          src={assetPath(`/images/category-icons/characters/${character.portrait}.png`)}
          alt={characterName(character, locale)}
          className="size-12 sm:size-14 object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
          draggable={false}
        />
      )}
      <span className="text-xs sm:text-sm text-foreground/80 font-medium text-center leading-tight">
        {characterName(character, locale)}
      </span>
    </button>
  );
}

export function CharacterSelector({
  characters,
  selectedCharacter,
  onSelectCharacter,
}: CharacterSelectorProps) {
  const { resolvedLocale } = useSettings();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4">
      {/* All option */}
      <button
        onClick={() => onSelectCharacter("all")}
        className="flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-3 sm:p-4 transition-colors active:bg-surface-hover hover:bg-surface-hover border-border hover:border-ring"
      >
        <div className="flex items-center justify-center size-12 sm:size-14">
          <span className="text-lg sm:text-xl font-bold text-foreground/80">ALL</span>
        </div>
        <span className="text-xs sm:text-sm text-foreground/80 font-medium">
          {t(resolvedLocale, "all")}
        </span>
      </button>

      {characters.map((character) => (
        <CharacterAvatar
          key={character.id}
          character={character}
          isSelected={false}
          onClick={() => onSelectCharacter(character.id)}
          locale={resolvedLocale}
        />
      ))}
    </div>
  );
}
