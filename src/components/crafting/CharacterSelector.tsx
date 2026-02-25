"use client";

import type { Character } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacter: string | null;
  onSelectCharacter: (characterId: string | null) => void;
}

function CharacterAvatar({
  character,
  isSelected,
  onClick,
}: {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative flex items-center justify-center size-12 rounded-full border-2 transition-colors overflow-hidden bg-zinc-900 hover:border-zinc-500",
            isSelected
              ? "border-amber-500 ring-1 ring-amber-500/50"
              : "border-zinc-700"
          )}
        >
          {imgError ? (
            <span className="text-[10px] text-zinc-400">
              {character.nameKo.charAt(0)}
            </span>
          ) : (
            <img
              src={`/images/characters/${character.portrait}.png`}
              alt={character.nameKo}
              className="size-10 object-cover rounded-full"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{character.nameKo}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function CharacterSelector({
  characters,
  selectedCharacter,
  onSelectCharacter,
}: CharacterSelectorProps) {
  return (
    <div className="p-3">
      <div className="flex flex-wrap gap-2">
        {/* All option */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSelectCharacter(null)}
              className={cn(
                "flex items-center justify-center size-12 rounded-full border-2 transition-colors bg-zinc-900 hover:border-zinc-500 text-xs font-medium",
                selectedCharacter === null
                  ? "border-amber-500 ring-1 ring-amber-500/50 text-amber-400"
                  : "border-zinc-700 text-zinc-400"
              )}
            >
              ALL
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>전체 캐릭터</p>
          </TooltipContent>
        </Tooltip>

        {characters.map((character) => (
          <CharacterAvatar
            key={character.id}
            character={character}
            isSelected={selectedCharacter === character.id}
            onClick={() => onSelectCharacter(character.id)}
          />
        ))}
      </div>
    </div>
  );
}
