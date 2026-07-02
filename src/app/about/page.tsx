"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BackToHome } from "@/components/ui/BackToHome";
import { useSettings } from "@/hooks/use-settings";
import { assetPath } from "@/lib/asset-path";

const CONTACT = "balocoding@gmail.com";

interface Block {
  h: string;
  paras: string[];
}

interface AboutDoc {
  title: string;
  updated: string;
  lead: string;
  ownerName: string;
  ownerRole: string;
  blocks: Block[];
  contactLabel: string;
}

const CONTENT: { ko: AboutDoc; en: AboutDoc } = {
  ko: {
    title: "소개",
    updated: "2026-07-01",
    lead: "dstcraft.com은 Don't Starve Together(DST)의 제작·요리·공략 정보를 한곳에서 찾을 수 있게 만든 비공식 팬 가이드입니다.",
    ownerName: "김지환 (Jihwan Kim)",
    ownerRole: "프론트엔드 개발자 · dst-craft 제작/운영",
    blocks: [
      {
        h: "이 사이트가 하는 일",
        paras: [
          "네 가지 재료를 조합해 요리솥 결과를 찾고, 아이템 제작법과 스탯, 보스 공략, 캐릭터 스킬트리, 콘솔 명령어까지 — 게임을 하다 궁금한 걸 빠르게 확인하도록 만들었습니다. 현재 7개 언어를 지원하며 하루 수백 명이 사용합니다.",
        ],
      },
      {
        h: "만든 사람",
        paras: [
          "이 사이트는 프론트엔드 개발자 김지환이 혼자 만들고 운영합니다. 저는 컴퓨터공학으로 대학에 들어갔다가 중퇴하고 트럼펫 연주자로 방향을 틀어, 군악대와 실용음악과를 거쳐 음악을 했습니다. 코로나 이후 서른여섯에 개발자로 다시 전직했습니다.",
          "개발 입문작은 Monster Hunter Double Cross(3DS)의 세이브 에디터였습니다. 기존 도구가 Windows 전용이라 Mac을 쓰던 제가 직접 C++로 만들었는데, 세이브 파일의 비트 단위 패킹 구조를 2주간 파고들어 풀어낸 경험이 개발자로 취업하는 결정적 계기가 됐습니다. 게임 데이터를 뜯어보고 도구로 만드는 그 재미가 dst-craft로 이어졌습니다.",
        ],
      },
      {
        h: "데이터는 어디서 오나 — 정확성에 대해",
        paras: [
          "dst-craft의 데이터는 위키를 짜깁기한 것이 아니라 게임 원본에서 직접 추출·검증합니다. DST 게임 파일(scripts.zip)의 recipes.lua·preparedfoods.lua·scrapbookdata.lua 등을 파싱하는 파이프라인을 만들어, 게임이 업데이트될 때마다 제작법·요리 조건·아이템 스탯을 자동으로 갱신합니다.",
          "한국어를 비롯한 번역은 커뮤니티 한글 모드를 기준으로 하고, 캐릭터 스킬트리는 인게임 정의와 정적 비교로 검증합니다. 그래서 게임 패치가 나오면 빠르고 정확하게 반영됩니다.",
        ],
      },
      {
        h: "저작권과 출처",
        paras: [
          "이 사이트는 Klei Entertainment의 공식 사이트가 아닙니다. Don't Starve Together와 게임 내 명칭·이미지·수치의 저작권은 Klei Entertainment에 있으며, 본 사이트는 이를 공략 안내 목적으로만 인용·표시합니다.",
          "일부 이미지는 dontstarve.wiki.gg에서 CC BY-SA 라이선스로 제공되는 자료를 사용합니다. 자세한 내용은 이용약관과 개인정보처리방침을 참고해 주세요.",
        ],
      },
      {
        h: "왜 만들었나",
        paras: [
          "저에게는 완성된 결과물보다 만드는 과정 자체가 더 큰 보상입니다. DST를 하다가 '재료 조합 결과를 빠르게 찾는 도구가 있으면 좋겠다'는 생각으로 시작했고, 지금은 같은 게임을 즐기는 여러 나라 사람들이 매일 쓰는 사이트가 됐습니다. 정확한 정보를 빠르게 전하는 것이 이 사이트의 목적입니다.",
          "개선 제안이나 오류 제보는 언제든 환영합니다.",
        ],
      },
    ],
    contactLabel: "문의",
  },
  en: {
    title: "About",
    updated: "2026-07-01",
    lead: "dstcraft.com is an unofficial fan guide that brings Don't Starve Together (DST) crafting, cooking, and strategy information together in one place.",
    ownerName: "Jihwan Kim",
    ownerRole: "Front-end developer · Creator & maintainer of dst-craft",
    blocks: [
      {
        h: "What this site does",
        paras: [
          "Combine four ingredients to find the Crock Pot result, look up crafting recipes and item stats, boss strategies, character skill trees, and console commands — whatever you need to check quickly while playing. It currently supports seven languages and is used by hundreds of players a day.",
        ],
      },
      {
        h: "Who makes it",
        paras: [
          "This site is built and run by one person: front-end developer Jihwan Kim. I started university in computer science, dropped out, and switched to playing the trumpet — through a military band and a contemporary music program, I spent years as a musician. After the pandemic, at 36, I moved back into software development.",
          "My entry into programming was a save editor for Monster Hunter Double Cross (3DS). The existing tools were Windows-only and I was on a Mac, so I wrote my own in C++ — spending two weeks figuring out the bit-level packing of the save file, an experience that became the deciding factor in landing my developer job. That same joy of taking game data apart and turning it into a tool led directly to dst-craft.",
        ],
      },
      {
        h: "Where the data comes from — on accuracy",
        paras: [
          "The data here isn't stitched together from wikis — it's extracted and verified directly from the game's own files. I built a pipeline that parses the game's scripts (recipes.lua, preparedfoods.lua, scrapbookdata.lua, and more) so that crafting recipes, cooking conditions, and item stats update automatically whenever the game is patched.",
          "Translations, including Korean, follow the community localization mods, and character skill trees are validated against the in-game definitions by static comparison. That's why game patches are reflected quickly and accurately.",
        ],
      },
      {
        h: "Copyright and attribution",
        paras: [
          "This is not an official Klei Entertainment site. Don't Starve Together and all in-game names, images, and stats are copyright Klei Entertainment; this site cites and displays them solely to provide guides.",
          "Some images use material provided under the CC BY-SA license from dontstarve.wiki.gg. See the Terms of Service and Privacy Policy for details.",
        ],
      },
      {
        h: "Why I made it",
        paras: [
          "For me, the process of building something is a bigger reward than the finished product. dst-craft started from a simple wish while playing DST — \"I want a tool that finds ingredient-combo results fast\" — and it has grown into a site used daily by players across many countries. Its purpose is to deliver accurate information, quickly.",
          "Suggestions and bug reports are always welcome.",
        ],
      },
    ],
    contactLabel: "Contact",
  },
};

/** Owner portrait. Falls back to initials if the image fails to load. */
function OwnerPhoto({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const initials = "JK";

  // Static export + next/image: an image that 404s before hydration never fires
  // React's onError, so the fallback wouldn't show. Re-check load state on mount.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-semibold text-muted-foreground">
        {initials}
      </div>
    );
  }
  return (
    <Image
      ref={ref}
      src={assetPath("/images/about-owner.jpg")}
      alt={name}
      width={80}
      height={80}
      className="size-20 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

export default function AboutPage() {
  const { resolvedLocale } = useSettings();
  const c = resolvedLocale === "ko" ? CONTENT.ko : CONTENT.en;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-lg font-bold">{c.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {resolvedLocale === "ko" ? "최종 갱신" : "Last updated"}: {c.updated}
          </p>
        </div>

        <p className="text-sm text-foreground/80">{c.lead}</p>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 p-4">
          <OwnerPhoto name={c.ownerName} />
          <div>
            <div className="text-sm font-semibold">{c.ownerName}</div>
            <div className="text-xs text-muted-foreground">{c.ownerRole}</div>
          </div>
        </div>

        {c.blocks.map((b) => (
          <section key={b.h} className="space-y-2">
            <h2 className="text-base font-semibold">{b.h}</h2>
            {b.paras.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/80">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section className="space-y-2">
          <h2 className="text-base font-semibold">{c.contactLabel}</h2>
          <p className="text-sm text-foreground/80">
            <a href={`mailto:${CONTACT}`} className="underline hover:text-foreground">
              {CONTACT}
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
