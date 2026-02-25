"use client";

import type { CraftingItem, CraftingStation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MaterialSlot } from "./MaterialSlot";
import { useState } from "react";

const stationNames: Record<CraftingStation, string> = {
  none: "손 제작",
  science_1: "과학 기계",
  science_2: "연금술 엔진",
  magic_1: "프레스티해티테이터",
  magic_2: "그림자 조종기",
  ancient: "고대",
  celestial: "천상",
  think_tank: "씽크 탱크",
  cartography: "지도 제작대",
  tackle_station: "낚시 도구 제작대",
  potter_wheel: "도자기 물레",
  character: "캐릭터 고유",
};

interface ItemDetailProps {
  item: CraftingItem | null;
}

export function ItemDetail({ item }: ItemDetailProps) {
  const [imgError, setImgError] = useState(false);

  if (!item) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500 text-sm">
        아이템을 선택하세요
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4">
      {/* Item image */}
      <div className="flex items-start justify-center shrink-0">
        <div className="flex items-center justify-center size-16 rounded-md border border-zinc-700 bg-zinc-900">
          {imgError ? (
            <span className="text-xs text-zinc-500 text-center px-1">
              {item.nameKo}
            </span>
          ) : (
            <img
              src={`/images/items/${item.image}`}
              alt={item.nameKo}
              className="size-14 object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{item.nameKo}</h3>
          <p className="text-xs text-zinc-500">{item.nameEn}</p>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] bg-zinc-800 text-zinc-300 border-zinc-700"
          >
            {stationNames[item.station]}
          </Badge>
          {item.characterOnly && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-amber-900/40 text-amber-400 border-amber-700/50"
            >
              {item.characterOnly}
            </Badge>
          )}
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-3 pt-1">
          {item.materials.map((mat) => (
            <MaterialSlot
              key={mat.materialId}
              materialId={mat.materialId}
              quantity={mat.quantity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
