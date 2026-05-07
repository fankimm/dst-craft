import { Hono } from "hono";
import { redisPipeline } from "../lib/redis";
import { extractSub } from "../lib/jwt";

const app = new Hono();

// GET /skills — fetch all saved skill builds for the user
app.get("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const results = await redisPipeline([
    ["HGETALL", `dst:skills:${sub}`],
    ["HGETALL", `dst:skills-locks:${sub}`],
  ]);
  const skillsRaw = results[0]?.result as string[] | null;
  const locksRaw = results[1]?.result as string[] | null;

  const skills: Record<string, string[]> = {};
  if (Array.isArray(skillsRaw)) {
    for (let i = 0; i < skillsRaw.length; i += 2) {
      try {
        skills[skillsRaw[i]] = JSON.parse(skillsRaw[i + 1]);
      } catch {}
    }
  }

  const locks: Record<string, string[]> = {};
  if (Array.isArray(locksRaw)) {
    for (let i = 0; i < locksRaw.length; i += 2) {
      try {
        locks[locksRaw[i]] = JSON.parse(locksRaw[i + 1]);
      } catch {}
    }
  }

  return c.json({ skills, locks });
});

// POST /skills — save skill build for one character
app.post("/", async (c) => {
  const sub = await extractSub(c.req.header("Authorization"));
  if (!sub) return c.json({ error: "Unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const characterId = body.characterId as string;
  const skills = body.skills as string[];
  const locks = body.locks as string[];

  if (!characterId || !Array.isArray(skills) || !Array.isArray(locks)) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const commands: string[][] = [];
  if (skills.length > 0) {
    commands.push(["HSET", `dst:skills:${sub}`, characterId, JSON.stringify(skills)]);
  } else {
    commands.push(["HDEL", `dst:skills:${sub}`, characterId]);
  }
  if (locks.length > 0) {
    commands.push(["HSET", `dst:skills-locks:${sub}`, characterId, JSON.stringify(locks)]);
  } else {
    commands.push(["HDEL", `dst:skills-locks:${sub}`, characterId]);
  }

  await redisPipeline(commands);
  return c.json({ ok: true });
});

export default app;
