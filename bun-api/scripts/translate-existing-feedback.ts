// 기존 피드백/답변에 대한 수동 번역 백필 (Claude Opus 4.7 직접 작성).
// 이슈 #31의 1단계: 자동 워커 구축 전, 현재 DB에 들어 있는 row들만 우선 양방향 번역.
//
// 멱등성: WHERE message_translated_at IS NULL (또는 reply 측 동일) 조건으로만 UPDATE.
//   → 이미 번역된 row는 덮어쓰지 않음. 같은 스크립트 두 번 돌려도 안전.
// 실행:  bun run bun-api/scripts/translate-existing-feedback.ts
// 환경:  DB_PATH (기본 ~/dstcraft/data/app.db)

import { Database } from "bun:sqlite";
import { homedir } from "node:os";
import { join } from "node:path";

const DB_PATH = process.env.DB_PATH ?? join(homedir(), "dstcraft", "data", "app.db");
const MODEL = "claude-opus-4-7"; // 이 스크립트의 모든 번역은 Claude Opus 4.7(1M)이 직접 작성.

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
  },
  {
    id: "1776320439982-2c3l55",
    messageLang: "ko",
    messageTranslated: "Klaus and Dragonfly rewards feel a bit underwhelming.",
  },
  {
    id: "1776513016880-gjstfl",
    messageLang: "ko",
    messageTranslated: "Yo, who even are you?",
  },
  {
    id: "1777368330773-3xc7ft",
    messageLang: "ko",
    messageTranslated:
      "Mobile crockpot simulator bug: when a recipe randomly resolves between two dishes, clicking the final ingredient can also trigger the recipe-detail view because the tap target overlaps with the detail-view button.",
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
