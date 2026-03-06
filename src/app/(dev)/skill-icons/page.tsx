import { skillNames } from "@/data/skill-names";
import { BackToHome } from "@/components/ui/BackToHome";

export default function SkillIconsPage() {
  const entries = Object.entries(skillNames);

  // Group by character prefix
  const groups: Record<string, [string, { en: string; ko: string }][]> = {};
  for (const entry of entries) {
    const [id] = entry;
    const char = id.replace(/_.*/, ""); // first segment
    if (!groups[char]) groups[char] = [];
    groups[char].push(entry);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Skill Icons Preview</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>
          {entries.length} skills — extracted from game files (skilltree_icons.tex)
        </p>

        {Object.entries(groups).map(([char, skills]) => (
          <div key={char} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, textTransform: "capitalize", borderBottom: "1px solid #333", paddingBottom: 4 }}>
              {char}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
              {skills.map(([id, names]) => (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    border: "1px solid #333",
                    borderRadius: 8,
                    background: "#1a1a1a",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/skill-icons/${id}.png`}
                    alt={id}
                    width={48}
                    height={48}
                    style={{ imageRendering: "auto", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>{names.ko}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{names.en}</div>
                    <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
