"use client";

import { useMemo, useState } from "react";
import { ItemSlot } from "@/components/ui/ItemSlot";
import { TagChip } from "@/components/ui/TagChip";
import {
  ARMORS,
  BUFFS,
  CHARACTERS,
  DUMMIES,
  PUNCHINGBAG_HP,
  WEAPONS,
  calcDamage,
  type DamageInput,
  type DummyId,
} from "@/lib/damage-calc";
import { allItems } from "@/data/items";
import { cn } from "@/lib/utils";

function imageOf(id: string): string {
  const it = allItems.find((i) => i.id === id);
  return it?.image ?? `${id}.png`;
}

function fmt(n: number): string {
  if (!isFinite(n)) return "∞";
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function DamageCalculator() {
  const [characterId, setCharacterId] = useState<string>("default");
  const [weaponId, setWeaponId] = useState<string>("spear");
  const [dummyId, setDummyId] = useState<DummyId>("punchingbag");
  const [headArmorId, setHeadArmorId] = useState<string | null>(null);
  const [bodyArmorId, setBodyArmorId] = useState<string | null>(null);
  const [activeBuffs, setActiveBuffs] = useState<Set<string>>(new Set());
  const [wetTarget, setWetTarget] = useState(false);

  const input: DamageInput = useMemo(
    () => ({
      weaponId,
      characterId,
      dummyId,
      dummyHeadArmorId: headArmorId,
      dummyBodyArmorId: bodyArmorId,
      activeBuffs,
      wetTarget,
    }),
    [weaponId, characterId, dummyId, headArmorId, bodyArmorId, activeBuffs, wetTarget]
  );

  const result = useMemo(() => calcDamage(input), [input]);

  function toggleBuff(id: string) {
    setActiveBuffs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const headArmors = ARMORS.filter((a) => a.slot === "head");
  const bodyArmors = ARMORS.filter((a) => a.slot === "body");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">데미지 계산기</h1>
        <p className="text-sm text-muted-foreground">
          동네북씨(체력 {PUNCHINGBAG_HP})를 표적으로 무기·캐릭터·버프·장착 갑옷 조합의 1히트 피해와 처치 타격 수를 계산합니다.
        </p>
      </div>

      {/* 캐릭터 */}
      <Section title="캐릭터">
        <div className="flex flex-wrap gap-2">
          {CHARACTERS.map((c) => (
            <TagChip
              key={c.id}
              label={c.name}
              onClick={() => setCharacterId(c.id)}
              className={cn(characterId === c.id && "border-primary bg-primary/10")}
            />
          ))}
        </div>
      </Section>

      {/* 무기 */}
      <Section title="무기">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {WEAPONS.map((w) => (
            <div
              key={w.id}
              className={cn(
                "rounded border p-1 transition-colors",
                weaponId === w.id ? "border-primary bg-primary/10" : "border-input"
              )}
            >
              <ItemSlot
                icon={imageOf(w.id)}
                label={w.name}
                badge={w.damage > 0 ? `${fmt(w.damage)}` : undefined}
                onClick={() => setWeaponId(w.id)}
              />
            </div>
          ))}
        </div>
        {(() => {
          const w = WEAPONS.find((x) => x.id === weaponId);
          if (!w) return null;
          return (
            <p className="text-xs text-muted-foreground mt-2">
              피해 {fmt(w.damage)}
              {w.planarDamage ? ` · 차원 +${fmt(w.planarDamage)}` : ""}
              {w.uses != null ? ` · 내구도 ${w.uses}회` : ""}
              {w.electric ? " · 전기" : ""}
              {w.note ? ` — ${w.note}` : ""}
              {w.characterLock ? ` · ${w.characterLock} 전용` : ""}
            </p>
          );
        })()}
      </Section>

      {/* 표적 */}
      <Section title="표적 (동네북씨)">
        <div className="flex flex-wrap gap-2 mb-3">
          {DUMMIES.map((d) => (
            <TagChip
              key={d.id}
              label={d.name}
              icon={`game-items/${imageOf(d.id)}`}
              onClick={() => setDummyId(d.id)}
              className={cn(dummyId === d.id && "border-primary bg-primary/10")}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          {DUMMIES.find((d) => d.id === dummyId)?.hasPlanarEntity
            ? "차원 표적 — 일반 데미지가 √공식으로 약화됩니다 (차원 피해는 정상 적용)."
            : "기본 표적 — 일반 데미지/차원 피해 모두 정상 적용."}
        </div>

        <ArmorPicker
          title="머리 장착"
          armors={headArmors}
          selectedId={headArmorId}
          onSelect={(id) => setHeadArmorId(id === headArmorId ? null : id)}
        />
        <ArmorPicker
          title="몸통 장착"
          armors={bodyArmors}
          selectedId={bodyArmorId}
          onSelect={(id) => setBodyArmorId(id === bodyArmorId ? null : id)}
        />
      </Section>

      {/* 버프 */}
      <Section title="버프 / 변수">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BUFFS.map((b) => {
            const on = activeBuffs.has(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBuff(b.id)}
                className={cn(
                  "text-left rounded-md border p-2 transition-colors",
                  on ? "border-primary bg-primary/10" : "border-input hover:bg-foreground/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{b.label}</span>
                  <span className={cn("size-4 rounded border", on ? "bg-primary border-primary" : "border-input")} />
                </div>
                {b.note && <div className="text-xs text-muted-foreground mt-0.5">{b.note}</div>}
              </button>
            );
          })}
          <button
            onClick={() => setWetTarget((v) => !v)}
            className={cn(
              "text-left rounded-md border p-2 transition-colors",
              wetTarget ? "border-primary bg-primary/10" : "border-input hover:bg-foreground/5"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">표적이 젖음</span>
              <span className={cn("size-4 rounded border", wetTarget ? "bg-primary border-primary" : "border-input")} />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">전기 공격에만 영향: ×1.5 → ×2.5</div>
          </button>
        </div>
      </Section>

      {/* 결과 */}
      <Section title="결과">
        {result ? <ResultPanel result={result} /> : <p className="text-sm text-muted-foreground">데이터 없음</p>}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold mb-2 text-foreground/80">{title}</h2>
      {children}
    </section>
  );
}

function ArmorPicker({
  title,
  armors,
  selectedId,
  onSelect,
}: {
  title: string;
  armors: ReturnType<typeof Object>[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-3">
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {(armors as Array<{ id: string; name: string; absorb: number; planarDef?: number }>).map((a) => (
          <div
            key={a.id}
            className={cn(
              "rounded border p-1 transition-colors",
              selectedId === a.id ? "border-primary bg-primary/10" : "border-input"
            )}
          >
            <ItemSlot
              icon={imageOf(a.id)}
              label={a.name}
              badge={`${Math.round(a.absorb * 100)}%`}
              onClick={() => onSelect(a.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: NonNullable<ReturnType<typeof calcDamage>> }) {
  const t = result.trace;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="1히트 총 피해" value={fmt(result.totalPerHit)} highlight />
        <Stat label="처치 타격 수" value={fmt(result.hitsToKill)} />
        <Stat
          label="무기 1자루 처치"
          value={result.killsPerWeapon != null ? `${result.killsPerWeapon}마리` : "—"}
        />
      </div>

      <details className="rounded border border-input bg-surface p-3 text-xs">
        <summary className="cursor-pointer font-medium text-sm">계산 과정 펼치기</summary>
        <div className="mt-2 space-y-1 font-mono text-[11px]">
          <Row label="기본 피해" value={fmt(t.baseDamage)} />
          <Row label="× 캐릭터 배율" value={`× ${t.charMult}`} />
          <Row label="× 외부 배율 (버프)" value={`× ${t.externalMult.toFixed(3)}`} />
          <Row label="× 전기 배율" value={`× ${t.electricMult.toFixed(2)}`} />
          <Row label="= 정규 데미지(원본)" value={fmt(t.rawDamage)} bold />
          <Row label="− 갑옷 흡수" value={`-${fmt(t.armorAbsorb)}`} />
          <Row label="= 갑옷 통과" value={fmt(t.afterArmor)} />
          <Row label="플레이너 엔티티 약화 후" value={fmt(t.afterPlanarEntity)} bold />
          <div className="pt-2 border-t border-input/50 mt-2" />
          <Row label="무기 차원 피해" value={fmt(t.weaponPlanar)} />
          <Row label="+ 버프 차원 피해" value={`+${fmt(t.bonusPlanar)}`} />
          <Row label="− 차원 방어" value={`-${fmt(t.planarDef)}`} />
          <Row label="= 차원 피해 적용" value={fmt(t.planarApplied)} bold />
        </div>
      </details>

      {result.totalPerHit === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          ⚠ 표적 갑옷 흡수가 100%이거나 차원 방어가 차원 피해와 같거나 더 크면 피해가 0이 됩니다.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-md border p-2",
      highlight ? "border-primary bg-primary/5" : "border-input bg-surface"
    )}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-bold tabular-nums", highlight && "text-primary")}>{value}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "font-semibold text-foreground")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
