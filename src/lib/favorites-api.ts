const WORKER_URL = process.env.NEXT_PUBLIC_ANALYTICS_WORKER_URL ?? "";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
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
  const res = await fetch(`${WORKER_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

export async function updateFavorite(token: string, itemId: string, action: "add" | "remove"): Promise<void> {
  await fetch(`${WORKER_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemId, action }),
  });
}
