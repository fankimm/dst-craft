import { apiFetch, TokenExpiredError } from "./api-fetch";

const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  role?: string;
}

export async function loginWithGoogle(idToken: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${WORKER_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function fetchFavorites(token: string): Promise<string[]> {
  try {
    const res = await apiFetch(`${WORKER_URL}/favorites`, token);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch (e) {
    if (e instanceof TokenExpiredError) return [];
    throw e;
  }
}

export async function updateFavorite(token: string, itemId: string, action: "add" | "remove"): Promise<void> {
  try {
    await apiFetch(`${WORKER_URL}/favorites`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, action }),
    });
  } catch (e) {
    if (e instanceof TokenExpiredError) return;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Skill tree sync
// ---------------------------------------------------------------------------

export interface SkillsData {
  skills: Record<string, string[]>;
  locks: Record<string, string[]>;
}

export async function fetchAllSkills(token: string): Promise<SkillsData> {
  try {
    const res = await apiFetch(`${WORKER_URL}/skills`, token);
    if (!res.ok) return { skills: {}, locks: {} };
    return res.json();
  } catch (e) {
    if (e instanceof TokenExpiredError) return { skills: {}, locks: {} };
    throw e;
  }
}

export async function saveCharacterSkills(
  token: string,
  characterId: string,
  skills: string[],
  locks: string[],
): Promise<void> {
  try {
    await apiFetch(`${WORKER_URL}/skills`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, skills, locks }),
    });
  } catch (e) {
    if (e instanceof TokenExpiredError) return;
    throw e;
  }
}
