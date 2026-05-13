import type { ReactNode } from "react";
import { Footer } from "../crafting/Footer";

/**
 * 탭 컨텐츠용 스크롤 영역 + 푸터 sticky 패턴.
 *
 * 문제: 컨텐츠가 짧을 때 Footer가 화면 중간에 떠버림 (mt-auto는 flex-col 부모가 있어야 동작).
 *
 * 해결 구조:
 *  - 외곽: `flex-1 min-h-0 overflow-y-auto` — 탭 컨텐츠 영역에서 스크롤 뷰포트 형성
 *  - 내부: `flex flex-col min-h-full` — 컨텐츠가 짧아도 뷰포트 높이만큼 차지하도록 강제
 *  - Footer: `mt-auto`로 항상 바닥에 붙음. 컨텐츠가 길면 자연스럽게 아래로 밀림.
 *
 * 새 탭(예: QuestsApp, ConsoleApp)은 무조건 이 컴포넌트로 감쌀 것. Footer는 안 넣어도 됨.
 *
 * 예외 — Footer를 별도로 pinned 처리하는 탭(현재 CookpotApp)은 `noFooter` 옵션 사용.
 */
interface Props {
  children: ReactNode;
  /** 탭 홈 네비게이션(`document.querySelector('[data-scroll-container]')`)을 위한 마크 */
  scrollContainer?: boolean;
  /** Footer를 따로 외부에 둘 때 (예: CookpotApp 패턴) */
  noFooter?: boolean;
  /** scroll container 자체에 추가 클래스 (예: overscroll 동작 커스터마이즈) */
  className?: string;
}

export function TabScrollArea({ children, scrollContainer, noFooter, className = "" }: Props) {
  return (
    <div
      className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${className}`}
      data-scroll-container={scrollContainer ? "" : undefined}
    >
      <div className="flex flex-col min-h-full">
        {children}
        {!noFooter && <Footer />}
      </div>
    </div>
  );
}
