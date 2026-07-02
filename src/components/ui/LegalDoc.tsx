import { BackToHome } from "@/components/ui/BackToHome";

interface Section {
  h: string;
  body: string[];
}

export interface LegalDocContent {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}

/**
 * 법적 고지 문서(개인정보처리방침·이용약관)용 공통 레이아웃.
 * 페이지는 locale별 LegalDocContent만 넘긴다.
 * children은 본문 섹션 뒤에 렌더된다 (예: privacy의 Ezoic 고지문 주입 앵커).
 */
export function LegalDoc({
  doc,
  locale,
  children,
}: {
  doc: LegalDocContent;
  locale: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-lg font-bold">{doc.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "ko" ? "최종 갱신" : "Last updated"}: {doc.updated}
          </p>
        </div>

        <p className="text-sm text-foreground/80">{doc.intro}</p>

        {doc.sections.map((s) => (
          <section key={s.h} className="space-y-2">
            <h2 className="text-base font-semibold">{s.h}</h2>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {s.body.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-muted-foreground">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {children}
      </main>
    </div>
  );
}
