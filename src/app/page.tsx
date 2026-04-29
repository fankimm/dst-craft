import { AppShell } from "@/components/AppShell";
import { SeoFooterLinks } from "@/components/SeoFooterLinks";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Don't Craft Without Recipes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Don't Craft Without Recipes is a free web app that provides a complete database of all crafting and cooking recipes in Don't Starve Together, including materials, crafting stations, crock pot recipes, character skill trees, and character-specific items.",
      },
    },
    {
      "@type": "Question",
      name: "How do I search for crafting and cooking recipes in Don't Starve Together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the search bar to find any item or food by name. You can filter by category, crafting station, or character-specific recipes. The crock pot simulator lets you test ingredient combinations, and the skill tree simulator lets you plan character builds. The guide supports 13 languages including English, Korean, Japanese, and Chinese.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AppShell />
      <SeoFooterLinks />
    </>
  );
}
