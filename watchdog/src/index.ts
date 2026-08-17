/**
 * dstcraft-watchdog — prod /api 헬스 감시 (Cloudflare Cron Trigger)
 *
 * 매분 HEALTH_URL을 3회 찔러 실패 수로 상태를 판정한다.
 *   0     → ok
 *   1     → ok 취급 (transient noise)
 *   2     → degraded
 *   3     → down
 *
 * 알림은 "상태가 바뀔 때"만 보낸다. 장애가 이어져도 매분 텔레그램이 오지 않도록
 * 직전 상태를 KV에 저장해두고, down 지속 중에는 DOWN_REMINDER_MS 간격으로만 재알림.
 *
 * Worker는 SSH를 못 하므로 실제 복구(DNS failover)는 GitHub Actions가 맡는다.
 * down 판정이 처음 선 순간 workflow_dispatch로 한 번만 눌러준다.
 */

interface Env {
  STATE: KVNamespace;
  HEALTH_URL: string;
  GH_REPO: string;
  GH_WORKFLOW: string;
  GH_REF: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  GH_TOKEN?: string;
}

type Level = "ok" | "degraded" | "down";

interface State {
  level: Level;
  /** 현재 level로 진입한 시각 */
  since: number;
  /** 마지막으로 텔레그램을 보낸 시각 */
  notifiedAt: number;
  /** 이번 down 구간에서 복구 워크플로우를 이미 눌렀는지 */
  dispatched: boolean;
  /** 복구 트리거 시도 횟수 — 실패해도 무한 재시도하지 않도록 */
  dispatchAttempts: number;
  /** degraded 지속 알림을 이미 보냈는지 */
  degradedEscalated: boolean;
}

interface Probe {
  ok: boolean;
  status: number;
  ms: number;
  err?: string;
}

const STATE_KEY = "health-state";
const TRIES = 3;
/**
 * 5s였다가 10s로 완화 (#77).
 *
 * 오탐이 반복돼 조사해보니 origin은 멀쩡했다 — 실패한 프로브는 nginx access.log에
 * 아예 찍히지 않았고 cloudflared 로그에도 health 관련 오류가 0건이었다. 즉 요청이
 * origin에 닿기 전에, Worker → CF edge → 터널 앞단에서 사라진다.
 * cloudflared 메트릭의 quic_client_lost_packets{reason="timeout"}가 꾸준히 쌓이는
 * 것과 맞물린다 — 가정용 업링크라 QUIC 패킷 유실이 간헐적으로 생긴다.
 *
 * 5s는 홈 서버 기준으로 빠듯해서 이 구간에 한 번 걸리면 곧장 실패로 셌다.
 * 진짜 다운이면 10s로도 3회 모두 걸리니 감지력은 그대로다.
 */
const TRY_TIMEOUT_MS = 10_000;
const TRY_GAP_MS = 2_000;
/** down이 이어질 때 재알림 간격 */
const DOWN_REMINDER_MS = 30 * 60 * 1000;
/** degraded가 이만큼 이어지면 한 번 더 알린다 */
const DEGRADED_ESCALATE_MS = 10 * 60 * 1000;

/** down 구간당 복구 트리거 재시도 상한 */
const MAX_DISPATCH_ATTEMPTS = 3;

const DEFAULT_STATE: State = {
  level: "ok",
  since: 0,
  notifiedAt: 0,
  dispatched: false,
  dispatchAttempts: 0,
  degradedEscalated: false,
};

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runCheck(env));
  },

  /** 상태 확인용. 비밀값은 노출하지 않는다. */
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    // 크론이 도는지와 무관하게 판정 로직을 강제 실행해볼 수 있는 경로.
    // 배포 검증용이며, 알림 규칙은 크론과 동일하게 적용된다.
    if (url.pathname === "/run") {
      const probes = await runCheck(env);
      return Response.json({ ran: true, probes, state: await readState(env) });
    }
    if (url.pathname === "/status") {
      const state = await readState(env);
      return Response.json({
        ...state,
        sinceISO: state.since ? new Date(state.since).toISOString() : null,
        target: env.HEALTH_URL,
      });
    }
    return new Response("dstcraft-watchdog\n/status 로 현재 판정 상태 확인\n", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};

async function runCheck(env: Env) {
  const probes = await probeHealth(env.HEALTH_URL);
  const fails = probes.filter((p) => !p.ok).length;
  const level: Level = fails >= TRIES ? "down" : fails >= 2 ? "degraded" : "ok";

  const prev = await readState(env);
  const now = Date.now();
  const next: State =
    level === prev.level
      ? { ...prev }
      : {
          level,
          since: now,
          notifiedAt: 0,
          dispatched: false,
          dispatchAttempts: 0,
          degradedEscalated: false,
        };

  const lastErr = probes.find((p) => !p.ok);
  const detail = `http: ${lastErr?.status || "?"} · err: ${lastErr?.err ?? "?"}`;
  const timing = probes.map((p) => (p.ok ? `${p.ms}ms` : "fail")).join(" / ");

  // down 진입 즉시 복구 워크플로우를 누른다. 실패하면 다음 라운드에 재시도하되,
  // GH_TOKEN 미설정처럼 영영 안 되는 경우가 있으므로 구간당 MAX_DISPATCH_ATTEMPTS까지만.
  if (level === "down" && !next.dispatched && next.dispatchAttempts < MAX_DISPATCH_ATTEMPTS) {
    next.dispatchAttempts++;
    next.dispatched = await dispatchRecovery(env, detail);
  }

  const alert = decideAlert(prev, next, now);
  if (alert) {
    await sendTelegram(env, alert(detail, timing, now - next.since));
    next.notifiedAt = now;
    if (level === "degraded" && prev.level === "degraded") next.degradedEscalated = true;
  }

  // KV 무료 쓰기 한도는 하루 1000회인데 매분 실행이면 1440회다.
  // 평시(ok 유지)에는 next가 prev와 완전히 같으므로 쓰지 않는다.
  const serialized = JSON.stringify(next);
  if (serialized !== JSON.stringify(prev)) {
    await env.STATE.put(STATE_KEY, serialized);
  }
  console.log(`level=${level} fails=${fails}/${TRIES} timing=${timing} alerted=${!!alert}`);
  return probes;
}

/** 보낼 메시지가 있으면 문구 생성 함수를, 없으면 null을 돌려준다. */
function decideAlert(
  prev: State,
  next: State,
  now: number
): ((detail: string, timing: string, elapsed: number) => string) | null {
  const changed = prev.level !== next.level;

  if (changed && next.level === "down") {
    return (detail) => `🔥 dstcraft.com /api 응답 없음 (${TRIES}/${TRIES} 실패)\n${detail}`;
  }
  if (changed && next.level === "degraded") {
    return (detail, timing) => `⚠️ dstcraft.com /api 불안정 (2/${TRIES} 실패)\n${detail}\n응답: ${timing}`;
  }
  if (changed && next.level === "ok") {
    // degraded에서 돌아온 건 조용히 넘긴다. 진짜 장애에서 복구된 것만 알림.
    if (prev.level !== "down") return null;
    return (_d, timing, _e) => {
      const mins = Math.max(1, Math.round((now - prev.since) / 60000));
      return `✅ dstcraft.com /api 복구됨 (약 ${mins}분 중단)\n응답: ${timing}`;
    };
  }

  // 상태 유지 중 — 장기화됐을 때만 다시 알린다.
  if (next.level === "down" && now - next.notifiedAt >= DOWN_REMINDER_MS) {
    return (detail, _t, elapsed) =>
      `🔥 dstcraft.com /api 여전히 응답 없음 (${Math.round(elapsed / 60000)}분째)\n${detail}`;
  }
  if (
    next.level === "degraded" &&
    !next.degradedEscalated &&
    now - next.since >= DEGRADED_ESCALATE_MS
  ) {
    return (_d, timing, elapsed) =>
      `⚠️ dstcraft.com /api 불안정 지속 (${Math.round(elapsed / 60000)}분째)\n응답: ${timing}`;
  }
  return null;
}

async function probeHealth(url: string): Promise<Probe[]> {
  const probes: Probe[] = [];
  for (let i = 0; i < TRIES; i++) {
    if (i > 0) await sleep(TRY_GAP_MS);
    probes.push(await probeOnce(url));
  }
  return probes;
}

async function probeOnce(url: string): Promise<Probe> {
  const started = Date.now();
  // 캐시된 응답을 보고 "살아있다"고 오판하지 않도록 매번 다른 URL + 캐시 우회.
  const target = `${url}${url.includes("?") ? "&" : "?"}cb=${crypto.randomUUID()}`;
  try {
    const res = await fetch(target, {
      headers: { "cache-control": "no-cache", "user-agent": "dstcraft-watchdog" },
      signal: AbortSignal.timeout(TRY_TIMEOUT_MS),
      cf: { cacheTtl: 0, cacheEverything: false },
    });
    const ms = Date.now() - started;
    if (!res.ok) return { ok: false, status: res.status, ms, err: `HTTP ${res.status}` };
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!body?.ok) return { ok: false, status: res.status, ms, err: "body ok!=true" };
    return { ok: true, status: res.status, ms };
  } catch (e) {
    const ms = Date.now() - started;
    const err = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, ms, err: err.slice(0, 160) };
  }
}

async function dispatchRecovery(env: Env, detail: string): Promise<boolean> {
  if (!env.GH_TOKEN) {
    console.log("GH_TOKEN 없음 — 복구 워크플로우 트리거 건너뜀");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${env.GH_REPO}/actions/workflows/${env.GH_WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.GH_TOKEN}`,
          accept: "application/vnd.github+json",
          "x-github-api-version": "2022-11-28",
          "user-agent": "dstcraft-watchdog",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ref: env.GH_REF,
          inputs: { reason: `cf-watchdog: ${detail}`.slice(0, 200) },
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) {
      console.log(`workflow_dispatch 실패: HTTP ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.log(`workflow_dispatch 예외: ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

async function sendTelegram(env: Env, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log(`텔레그램 시크릿 없음 — 미발송: ${text}`);
    return;
  }
  const body = new URLSearchParams({ chat_id: env.TELEGRAM_CHAT_ID, text });
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.log(`텔레그램 발송 실패: HTTP ${res.status}`);
  } catch (e) {
    console.log(`텔레그램 발송 예외: ${e instanceof Error ? e.message : e}`);
  }
}

async function readState(env: Env): Promise<State> {
  const raw = await env.STATE.get(STATE_KEY);
  if (!raw) return { ...DEFAULT_STATE };
  try {
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
