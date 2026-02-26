import type { LocaleData } from "./types";
import { ko } from "./ko";
import { zh_CN } from "./zh_CN";
import { zh_TW } from "./zh_TW";
import { fr } from "./fr";
import { de } from "./de";
import { it } from "./it";
import { ja } from "./ja";
import { pl } from "./pl";
import { pt_BR } from "./pt_BR";
import { ru } from "./ru";
import { es } from "./es";
import { es_MX } from "./es_MX";

export const allLocales: Record<string, LocaleData> = {
  ko,
  "zh_CN": zh_CN,
  "zh_TW": zh_TW,
  "fr": fr,
  "de": de,
  "it": it,
  "ja": ja,
  "pl": pl,
  "pt_BR": pt_BR,
  "ru": ru,
  "es": es,
  "es_MX": es_MX,
};
