"use client";

import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";

/** Footer 하단에 노출되는 법적 고지 링크 (개인정보처리방침·이용약관). */
export function FooterLegalLinks() {
  const { resolvedLocale } = useSettings();
  return (
    <nav className="flex items-center gap-2 py-2">
      <a href="/privacy" className="hover:text-foreground transition-colors">
        {t(resolvedLocale, "privacy_policy")}
      </a>
      <span aria-hidden="true">·</span>
      <a href="/terms" className="hover:text-foreground transition-colors">
        {t(resolvedLocale, "terms_of_service")}
      </a>
    </nav>
  );
}
