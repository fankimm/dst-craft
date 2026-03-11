import { characters } from "@/data/characters";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.dstcraft.com";

export const metadata: Metadata = {
  title: "All Characters — Don't Starve Together Character Guide",
  description:
    "Complete guide to all playable characters in Don't Starve Together. See stats, perks, difficulty, and exclusive items for Wilson, Willow, Wolfgang, Wendy, and more.",
  alternates: { canonical: `${SITE_URL}/characters` },
  openGraph: {
    title: "All Characters — Don't Starve Together Character Guide",
    description:
      "Complete guide to all playable characters in Don't Starve Together. Stats, perks, and tips for every character.",
    url: `${SITE_URL}/characters`,
  },
};

const difficultyColors: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30",
  normal: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  hard: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
};

const difficultyLabels: Record<string, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};

export default function CharactersPage() {
  // Exclude Wonkey from main grid (special monkey form, not a normal character)
  const playable = characters.filter((c) => c.id !== "wonkey");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to dstcraft.com
          </Link>
          <span className="text-xs text-muted-foreground">Character Guide</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-foreground">
            Don&apos;t Starve Together Characters
          </h1>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
            Don&apos;t Starve Together features {playable.length} playable characters, each with unique
            abilities, stats, and exclusive crafting recipes. Choose the right character for your
            playstyle — from beginner-friendly options like Wilson and Wendy to advanced characters
            like Wanda and Maxwell.
          </p>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {playable.map((char) => (
            <Link
              key={char.id}
              href={`/character/${char.id}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 hover:border-ring transition-colors text-center"
            >
              <img
                src={`/images/characters/${char.portrait}.png`}
                alt={char.name}
                className="size-20 object-contain"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{char.name}</p>
                {char.nameKo && (
                  <p className="text-xs text-muted-foreground">{char.nameKo}</p>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  difficultyColors[char.difficulty] ?? ""
                }`}
              >
                {difficultyLabels[char.difficulty]}
              </span>
              <div className="flex gap-2 text-[10px] text-muted-foreground">
                <span>❤️ {char.health}</span>
                <span>🍖 {char.hunger}</span>
                <span>🧠 {char.sanity}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* SEO text */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">
            Choosing Your Character in DST
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Each character in Don&apos;t Starve Together has unique strengths and weaknesses. Beginners
            should start with easy characters like Wilson (no downsides, grows a useful beard),
            Wendy (summons Abigail for combat help), or Wigfrid (strong fighter with lifesteal).
            More experienced players can try challenging characters like Wolfgang (gym-based power
            system), Maxwell (fragile but has shadow minions), or Wanda (age-based health system
            with time manipulation). Warly is perfect for players who enjoy the cooking system,
            while Webber and Wurt offer unique ally-management playstyles.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Explore crafting recipes and cooking guides
          </p>
          <p className="text-xs text-muted-foreground">
            Find character-specific crafting recipes, crock pot recipes, and boss strategies
          </p>
          <Link
            href="/"
            className="inline-block mt-1 rounded-lg bg-foreground text-background text-sm font-semibold px-5 py-2 hover:opacity-80 transition-opacity"
          >
            Open Crafting Guide →
          </Link>
        </section>
      </main>
    </div>
  );
}
