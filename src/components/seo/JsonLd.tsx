/**
 * JSON-LD를 출력하는 헬퍼.
 *
 * `dangerouslySetInnerHTML` props는 React가 hydration payload에 직렬화해서
 * RSC stream에 똑같은 JSON-LD가 한 번 더 들어가고, GSC가 "FAQPage 입력란 중복"으로
 * 잡는다. children 패턴은 `<script>` 같은 raw text element 안에서 string을
 * escape 없이 그대로 출력해서 props 노출 없이 한 번만 나온다.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
    >
      {JSON.stringify(data)}
    </script>
  );
}
