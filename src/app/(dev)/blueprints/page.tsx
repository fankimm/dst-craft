import { allItems } from "@/data/items";
import { allLocales } from "@/data/locales";
import { BackToHome } from "@/components/ui/BackToHome";

export default function BlueprintsPage() {
  const items = allItems.filter((item) => item.blueprint);
  const ko = allLocales.ko;

  // Group by station
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const station = item.station;
    if (!groups[station]) groups[station] = [];
    groups[station].push(item);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Blueprint Items</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>
          {items.length}개 — blueprint: true (TECH.LOST, 블루프린트 필요 아이템)
        </p>

        {Object.entries(groups).map(([station, stationItems]) => (
          <div key={station} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, borderBottom: "1px solid #333", paddingBottom: 4 }}>
              {station} ({stationItems.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stationItems.map((item) => {
                const koName = ko?.items[item.id]?.name;
                return (
                  <div
                    key={item.id}
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
                      src={`/images/game-items/${item.image}`}
                      alt={item.name}
                      width={48}
                      height={48}
                      style={{ imageRendering: "auto", flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>
                        {koName ?? item.name}
                      </div>
                      {koName && (
                        <div style={{ fontSize: 12, color: "#999" }}>{item.name}</div>
                      )}
                      <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>
                        {item.id}
                        {item.characterOnly && ` (${item.characterOnly})`}
                        {item.builderSkill && ` [skill: ${item.builderSkill}]`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
