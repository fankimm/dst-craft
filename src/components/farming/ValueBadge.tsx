/** "게임 수치" / "계산값" 구분 표시 (#120) — 게임에서 그대로 온 값과 우리가 계산한 값을 화면에서 나눈다 */
export function ValueBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded border border-border bg-surface px-1 py-px text-[10px] font-medium text-muted-foreground align-middle">
      {label}
    </span>
  );
}
