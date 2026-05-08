import { BackToHome } from "@/components/ui/BackToHome";
import { DamageCalculator } from "@/components/dev/DamageCalculator";

export const metadata = {
  title: "데미지 계산기 — DST 크래프트",
};

export default function DamageCalcPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BackToHome />
      <DamageCalculator />
    </div>
  );
}
