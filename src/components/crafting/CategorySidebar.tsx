"use client";

import {
  User,
  Heart,
  Wrench,
  Lightbulb,
  Cpu,
  Gem,
  Swords,
  Shield,
  Shirt,
  CirclePlus,
  Wand2,
  Flower2,
  Home,
  Package,
  ChefHat,
  Sprout,
  Fish,
  Anchor,
  Cherry,
  Snowflake,
  Sun,
  CloudRain,
  type LucideIcon,
} from "lucide-react";
import type { Category, CategoryId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const iconMap: Record<string, LucideIcon> = {
  user: User,
  heart: Heart,
  wrench: Wrench,
  lightbulb: Lightbulb,
  cpu: Cpu,
  gem: Gem,
  sword: Swords,
  shield: Shield,
  shirt: Shirt,
  "plus-circle": CirclePlus,
  wand: Wand2,
  flower: Flower2,
  home: Home,
  package: Package,
  "chef-hat": ChefHat,
  sprout: Sprout,
  fish: Fish,
  anchor: Anchor,
  horse: Cherry,
  snowflake: Snowflake,
  sun: Sun,
  "cloud-rain": CloudRain,
};

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <>
      {/* Mobile: horizontal scrollable row */}
      <div className="sm:hidden w-full border-b border-zinc-800 bg-zinc-950">
        <ScrollArea className="w-full">
          <div className="flex gap-1 px-2 py-1.5">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Wrench;
              const isActive = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  className={cn(
                    "size-10 shrink-0 p-0 text-zinc-400",
                    isActive && "bg-zinc-700 text-zinc-100"
                  )}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <Icon className="size-5" />
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden sm:flex flex-col items-center w-14 shrink-0 border-r border-zinc-800 bg-zinc-950 sticky top-0 h-dvh overflow-y-auto py-2 gap-1">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Wrench;
          const isActive = selectedCategory === cat.id;
          return (
            <Tooltip key={cat.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "size-10 p-0 text-zinc-400 hover:text-zinc-200",
                    isActive && "bg-zinc-700 text-zinc-100"
                  )}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <Icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{cat.nameKo}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </>
  );
}
