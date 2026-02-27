"use client";

import { assetPath } from "@/lib/asset-path";

export function CookpotApp() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <img
        src={assetPath("/images/game-items/cookpot.png")}
        alt="Crock Pot"
        className="size-24 object-contain"
        draggable={false}
      />
      <span className="text-sm font-medium text-muted-foreground">Coming Soon</span>
    </div>
  );
}
