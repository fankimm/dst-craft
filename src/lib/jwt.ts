export function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const padded =
      parts[1].replace(/-/g, "+").replace(/_/g, "/") +
      "==".slice(0, (4 - (parts[1].length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function isJWTValid(token: string | null | undefined): boolean {
  if (!token) return false;
  const payload = decodeJWTPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  // 30초 버퍼: clock skew + 호출 도중 만료 회피
  return payload.exp > Date.now() / 1000 + 30;
}
