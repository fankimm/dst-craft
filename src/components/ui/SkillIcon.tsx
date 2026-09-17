import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

interface SkillIconProps {
  /** `public/images/skill-icons/<icon>.png` 의 파일명 (확장자 제외) */
  icon: string;
  alt?: string;
  /** 크기 등 컨테이너 클래스 (예: `size-10`) */
  className?: string;
}

/**
 * 스킬 아이콘. 인게임에서 추출한 PNG는 **검은 선화 + 투명 배경**이라 다크모드의 어두운 카드 위에선
 * 형체가 안 보인다 (#113, 2026-08-27 피드백). 라이트모드는 그대로 두고 다크모드에서만 밝은 배경판을 깐다 —
 * 인게임 스킬트리도 밝은 양피지 위 검은 선화라 원본 느낌에 가깝다.
 */
export function SkillIcon({ icon, alt = "", className }: SkillIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 overflow-hidden rounded-md dark:bg-zinc-200",
        className,
      )}
    >
      <img
        src={assetPath(`/images/skill-icons/${icon}.png`)}
        alt={alt}
        className="size-full object-contain"
        loading="lazy"
      />
    </span>
  );
}
