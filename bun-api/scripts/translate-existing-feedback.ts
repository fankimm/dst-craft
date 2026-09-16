// 기존 피드백/답변에 대한 수동 번역 백필 (Claude가 직접 작성).
// 이슈 #31의 1단계: 자동 워커 구축 전, 현재 DB에 들어 있는 row들만 우선 양방향 번역.
// 새 피드백이 쌓이면 아래 TRANSLATIONS에 항목을 추가하고 다시 실행한다 (이슈 #70).
// Claude가 API로 단 답변(reply_author='claude')의 번역도 여기서 같이 백필한다 (이슈 #72).
//
// 멱등성: WHERE message_translated_at IS NULL (또는 reply 측 동일) 조건으로만 UPDATE.
//   → 이미 번역된 row는 덮어쓰지 않음. 같은 스크립트 두 번 돌려도 안전.
//   → 따라서 MODEL 상수를 바꿔도 기존 row의 model 값은 그대로 유지된다.
// 실행:  bun run bun-api/scripts/translate-existing-feedback.ts
// 환경:  DB_PATH (기본 ~/dstcraft/data/app.db)

import { Database } from "bun:sqlite";
import { homedir } from "node:os";
import { join } from "node:path";

const DB_PATH = process.env.DB_PATH ?? join(homedir(), "dstcraft", "data", "app.db");
const MODEL = "claude-fable-5-1"; // 이번 실행분(2026-09-16 추가)의 번역 작성자. 이전 row들은 claude-opus-4-7 / claude-opus-5로 기록돼 있고 덮어쓰지 않는다.

type Lang = "ko" | "en";
interface Entry {
  id: string;
  messageLang: Lang;
  messageTranslated: string;
  replyLang?: Lang;
  replyTranslated?: string;
}

// id 순서는 created_at ASC. message_lang은 원문 언어이고, translated는 반대 언어로 작성됨.
const TRANSLATIONS: Entry[] = [
  {
    id: "1774682512455-cyeo4q",
    messageLang: "en",
    messageTranslated:
      "스킬 트리 탭이 추가됐으면 좋겠어요. 자주 참고하고 싶을 때가 많거든요. 트리를 보여주는 탭에서 각 스킬을 탭하면 인게임 설명이 뜨는 정도면 완벽할 것 같습니다 :)",
    // 원문이 영어인 유일한 건 — 답변도 영어로 달았으므로 번역본은 한국어.
    replyLang: "en",
    replyTranslated:
      "스킬 트리 탭 올라갔습니다 — 트리는 전부 들어있고, 스킬을 누르면 인게임 설명이 뜹니다. 주문하신 그대로요 :) 좋은 제안 감사합니다!",
  },
  {
    id: "1776320439982-2c3l55",
    messageLang: "ko",
    messageTranslated: "Klaus and Dragonfly rewards feel a bit underwhelming.",
    replyLang: "ko",
    replyTranslated:
      "Reward lists filled in. Whether they're worth dying for is your call now 🐉",
  },
  {
    id: "1776513016880-gjstfl",
    messageLang: "ko",
    messageTranslated: "Yo, who even are you?",
    replyLang: "ko",
    replyTranslated:
      "Just a survivor who took too many notes and accidentally shipped a website 🌲",
  },
  {
    id: "1777368330773-3xc7ft",
    messageLang: "ko",
    messageTranslated:
      "Mobile crockpot simulator bug: when a recipe randomly resolves between two dishes, clicking the final ingredient can also trigger the recipe-detail view because the tap target overlaps with the detail-view button.",
    replyLang: "ko",
    replyTranslated:
      "Fixed — one tap no longer counts as two. The last ingredient goes in without dragging the detail view along. Thanks for the report!",
  },
  {
    id: "1777628959489-z8hdzt",
    messageLang: "ko",
    messageTranslated:
      "All vegetable items in the health-restoring food recommendations are tagged as Wurt's favorite foods.",
    replyLang: "ko",
    replyTranslated:
      "In-game, Wurt has AddFoodtypeAffinity(FOODTYPE.VEGGIE), which gives her a hunger bonus (×1.33) on every vegetable food. So it isn't just durian/kelp — every vegetable really is a favorite food for her. If you still think this is a bug, please send another feedback.",
  },
  {
    id: "1777835487307-47sw97",
    messageLang: "en",
    messageTranslated: "스킬 트리 탭 너무 좋아요 :3 웹버도 빨리 추가됐으면 좋겠어요",
    replyLang: "en",
    replyTranslated: "이 🕸️웹앱🕸️ 써주셔서 감사해요 ❤️ 🕷️🕷️🕷️",
  },
  {
    id: "1778085843516-08rn7w",
    messageLang: "ko",
    messageTranslated:
      "I'd love a feature that shows WX-78's stat changes when equipping his circuits.",
    replyLang: "ko",
    replyTranslated:
      "Added the WX-78 circuit board and made circuits equippable. You can now see the numerical values and effects applied by skills and circuits in the status view. Thanks for the feedback.",
  },
  {
    id: "1778223144783-5nkgpt",
    messageLang: "ko",
    messageTranslated:
      "It'd be great to have a damage calculator. For example, when Wolfgang — equipped with a Wabis helmet, having eaten chili-sprinkled Lightning Jelly — fights an armored scrap-metal target, I'd love to see how many hits it takes and what the damage works out to. Each modifier could be a simple on/off toggle.",
    replyLang: "ko",
    replyTranslated: "Great idea. I'll start on it soon.",
  },
  {
    id: "1778249755501-k9djcq",
    messageLang: "ko",
    messageTranslated:
      "I think durian is actually the only food Wurt favors — only durian has the extra +15 hunger bonus attached.",
    replyLang: "ko",
    replyTranslated: "Thanks for checking. Off to go smack Claude. 😅",
  },
  {
    id: "1778304001535-6cvr61",
    messageLang: "ko",
    messageTranslated:
      "Pearl's drink recipes are missing, and it'd be great to have quest checklists for the Mouthpiece / Hermit / Fuelweaver quests.",
    replyLang: "ko",
    replyTranslated:
      "I'll add the drinks! Funny enough — I was already planning to build the checklist. Great minds think alike.",
  },
  {
    id: "1778380415007-cr5go4",
    messageLang: "ko",
    messageTranslated:
      "Could you add a debug version with the default restrictions lifted — so we can unlock all Insights via mods, or stack unlimited WX-78 circuits?",
    replyLang: "ko",
    replyTranslated: "Yes, I'll add it. Thanks for the suggestion.",
  },
  {
    id: "1779279710356-r4b5fr",
    messageLang: "ko",
    messageTranslated:
      "I can't take any skills in Winona's Charlie or Wagstaff branches — the Nightmare Generator / Enlightened G.E.M.erator side.",
    replyLang: "ko",
    replyTranslated: "Fixed. Thanks for the report ❤️",
  },
  {
    id: "1779446957552-3rgl9y",
    messageLang: "ko",
    messageTranslated:
      "Could you add a way to look up recipes in reverse — tap a material to see everything that can be crafted with it?",
    replyLang: "ko",
    replyTranslated: "Done — implemented. Thanks for the great suggestion.",
  },
  {
    id: "1779535886458-v1mko8",
    messageLang: "ko",
    messageTranslated: "Please add a Hermit trade list too!",
  },
  {
    id: "1779544094929-424fkv",
    messageLang: "ko",
    messageTranslated:
      "It'd be great to see the sanity gain/loss values for the characters who can read Wickerbottom's books. Thanks for making such a great site.",
  },
  {
    id: "1779971540965-gv1yyh",
    messageLang: "ko",
    messageTranslated: "I'd love to see a Pearl home-decoration affinity list.",
  },
  // --- 2026-08-11 추가분 (이슈 #70) ---
  {
    // "감시합니당" — "감사합니당"(고맙습니당)의 오타. 귀여운 어미 + 오타 맛을 살려 초월번역.
    id: "1785109461858-gxkotz",
    messageLang: "ko",
    messageTranslated: "Thank ewe! 🐑",
    // 답변도 같은 말장난을 받아친다 — 한국어는 "감시/감사" 오타를, 영어는 ewe(양)를 이어받음.
    replyLang: "ko",
    replyTranslated: "Ewe've got my word — I'll keep it worth watching 🐑",
  },
  {
    id: "1785440343749-p1wxms",
    messageLang: "ko",
    messageTranslated: "You're an absolute legend.",
    replyLang: "ko",
    replyTranslated:
      "Legend's a stretch — I just keep the crockpot lit 🔥 That one line is worth a few more late nights.",
  },
  {
    // v0.31.3에서 고친 요리솥 재료 중복 버그 제보.
    id: "1786395320853-r2i66t",
    messageLang: "ko",
    messageTranslated:
      "If you favorite Dried Forget-Me-Lots, they breed endlessly — just like the real thing.",
    replyLang: "ko",
    replyTranslated:
      "The developer had one too many Forget-Me-Lots and registered the same ingredient twice. Then they started breeding on screen. All cleaned up. Thanks for the report 🌿",
  },
  // --- 2026-09-16 추가분 (이슈 #106) ---
  {
    // 원문이 영어인 두 번째 건 (#102 검색 자동완성 요청). 원래 reply에 영문+국문을 병기했던 것을
    // 영문만 남기고 국문을 여기로 옮겼다 — 병기 금지 규칙은 CLAUDE.md "Feedback Replies" 참조.
    id: "1788851925065-6uqdmo",
    messageLang: "en",
    messageTranslated:
      "기능 요청: 아이템을 검색해서 탭하면 그 아이템이 재료로 쓰이는 곳이 아니라 아이템 설명이 열리게 해주세요.",
    replyLang: "en",
    replyTranslated:
      "요청 감사합니다! 재료로도 쓰이는 제작품(판자·밧줄·창 등)은 검색 드롭다운에 '아이템'과 '재료' 두 줄로 나오고, '아이템' 줄을 누르면 그 아이템 상세가 바로 열립니다. '재료' 줄은 그 재료가 들어가는 제작법 목록입니다.",
  },
  // --- 2026-09-16 추가분 (이슈 #107) — 미번역 한국어 피드백 8건, 답변은 아직 없음 ---
  {
    id: "1786669699396-8catpk",
    messageLang: "ko",
    messageTranslated: "It'd be great to have an Items category where you can look up item info too ~!",
  },
  {
    id: "1786706814363-hl9jum",
    messageLang: "ko",
    messageTranslated: "Would love a category with info on regular monsters too, not just bosses!",
  },
  {
    id: "1787228907525-8jd5c6",
    messageLang: "ko",
    messageTranslated:
      "Could you add a feature that shows the exact numbers for the stat increases you get when picking a skill?",
  },
  {
    // "도발탄" = ko.po 의 MEGAFLARE(Hostile Flare) 한글명
    id: "1787476043177-txe21r",
    messageLang: "ko",
    messageTranslated: "Can the Hostile Flare only be used in winter?",
  },
  {
    id: "1787854326772-cq0iie",
    messageLang: "ko",
    messageTranslated:
      "Minor thing: in dark mode the skill tree images are hard to make out — the background is dark and the images are dark too.",
  },
  {
    id: "1788012304165-qq9emx",
    messageLang: "ko",
    messageTranslated: "Any chance a Farming tab gets added?? (recommended fertilizer / crop combos, etc.)",
  },
  {
    // #105 스크롤 먹통 제보. 답변(한국어, reply_author=claude)은 2026-09-16 등록 — 번역은 #109
    id: "1788942886048-by7h8z",
    messageLang: "ko",
    messageTranslated:
      "Sometimes — I'm not sure when — scrolling stops working entirely on both the web and the app 😢 Do you know why? Leaving and coming back does fix it 🥺🥺",
    replyLang: "ko",
    replyTranslated:
      "Thanks for the report! We found the cause. Whenever the viewport changed — closing the search keyboard, rotating the screen, and so on — the app's height setting was wiped and scrolling stopped. There was also a second path where only the Crafting tab froze after closing a boss, cooking, or skin detail sheet. Both are fixed and deployed. If it ever happens again, please let us know 🙏",
  },
  {
    id: "1789483590837-grx2ak",
    messageLang: "ko",
    messageTranslated: "Could you add the chess piece sketches?",
  },
];

const db = new Database(DB_PATH);
const now = Math.floor(Date.now() / 1000);

let msgUpdated = 0;
let replyUpdated = 0;

const updateMessage = db.query(
  `UPDATE feedback
     SET message_translated = ?,
         message_lang = ?,
         message_translated_at = ?,
         message_translated_model = ?
   WHERE id = ?
     AND message_translated_at IS NULL`,
);
const updateReply = db.query(
  `UPDATE feedback
     SET reply_translated = ?,
         reply_lang = ?,
         reply_translated_at = ?,
         reply_translated_model = ?
   WHERE id = ?
     AND reply IS NOT NULL
     AND reply_translated_at IS NULL`,
);

for (const e of TRANSLATIONS) {
  const m = updateMessage.run(e.messageTranslated, e.messageLang, now, MODEL, e.id);
  if (m.changes > 0) msgUpdated++;
  if (e.replyTranslated && e.replyLang) {
    const r = updateReply.run(e.replyTranslated, e.replyLang, now, MODEL, e.id);
    if (r.changes > 0) replyUpdated++;
  }
}

console.log(`message_translated updated: ${msgUpdated}/${TRANSLATIONS.length}`);
console.log(
  `reply_translated updated:   ${replyUpdated}/${TRANSLATIONS.filter((e) => e.replyTranslated).length}`,
);
