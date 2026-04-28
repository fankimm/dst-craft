import { characters } from "@/data/characters";
import Link from "next/link";
import { L, type SeoLang } from "./labels";

const SITE_URL = "https://www.dstcraft.com";

const difficultyColors: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
  normal: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  hard: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
};

const diffKey = {
  easy: "diffEasy",
  normal: "diffNormal",
  hard: "diffHard",
} as const;

export function CharactersListContent({ lang }: { lang: SeoLang }) {
  const playable = characters.filter((c) => c.id !== "wonkey");
  const routePrefix = lang === "ko" ? "/ko" : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {L.backHome[lang]}
          </Link>
          <span className="text-xs text-muted-foreground">{L.characterGuide[lang]}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground">{L.charactersTitle[lang]}</h1>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            {L.charactersIntro[lang].replace("{n}", String(playable.length))}
          </p>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {playable.map((char) => {
            const primary = lang === "ko" ? (char.nameKo ?? char.name) : char.name;
            const secondary = lang === "ko" ? char.name : char.nameKo;
            return (
              <Link
                key={char.id}
                href={`${routePrefix}/character/${char.id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 hover:border-ring transition-colors text-center"
              >
                <img src={`/images/characters/${char.portrait}.png`} alt={primary} className="size-20 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{primary}</p>
                  {secondary && secondary !== primary && (
                    <p className="text-xs text-muted-foreground">{secondary}</p>
                  )}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[char.difficulty] ?? ""}`}>
                  {L[diffKey[char.difficulty]][lang]}
                </span>
                <div className="flex gap-2 text-[10px] text-muted-foreground">
                  <span>❤️ {char.health}</span>
                  <span>🍖 {char.hunger}</span>
                  <span>🧠 {char.sanity}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">{L.choosingCharacter[lang]}</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{L.choosingCharacterText[lang]}</p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{L.exploreCraftingCooking[lang]}</p>
          <p className="text-xs text-muted-foreground">{L.exploreHelper[lang]}</p>
          <Link
            href="/"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            {L.openCraftingGuide[lang]}
          </Link>
        </section>
      </main>
    </div>
  );
}

export function buildCharactersListMetadata(lang: SeoLang) {
  const title = lang === "ko"
    ? "모든 캐릭터 — Don't Starve Together 캐릭터 가이드"
    : "All Characters — Don't Starve Together Character Guide";
  const description = lang === "ko"
    ? "Don't Starve Together의 모든 플레이 가능한 캐릭터 가이드. 윌슨, 윌로우, 울프강, 웬디 등 캐릭터별 스탯, 특성, 난이도, 전용 아이템을 확인하세요."
    : "Complete guide to all playable characters in Don't Starve Together. See stats, perks, difficulty, and exclusive items for Wilson, Willow, Wolfgang, Wendy, and more.";

  const enUrl = `${SITE_URL}/characters`;
  const koUrl = `${SITE_URL}/ko/characters`;
  const canonical = lang === "ko" ? koUrl : enUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en: enUrl, "x-default": enUrl, ko: koUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: lang === "ko" ? "ko_KR" : "en_US",
    },
  };
}
