import { isJWTValid } from "./jwt";

export const AUTH_EXPIRED_EVENT = "auth:expired";

export class TokenExpiredError extends Error {
  constructor() {
    super("Authentication token expired or invalid");
    this.name = "TokenExpiredError";
  }
}

export function notifyAuthExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

/**
 * 인증이 필수인 API 호출 wrapper.
 * 토큰이 없거나 만료됐으면 호출 차단 + auth:expired 이벤트 발사 후 throw.
 * 응답이 401이면 동일하게 처리.
 * 호출자는 try/catch로 TokenExpiredError를 잡아 기본값 반환하면 됨.
 */
export async function apiFetch(
  url: string,
  token: string | null | undefined,
  init: RequestInit = {},
): Promise<Response> {
  if (!isJWTValid(token)) {
    notifyAuthExpired();
    throw new TokenExpiredError();
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    notifyAuthExpired();
    throw new TokenExpiredError();
  }
  return res;
}
