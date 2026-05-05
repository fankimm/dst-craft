const WORKER_URL = "https://dst-analytics.fankimm.workers.dev";

export const onRequestPost: PagesFunction = async ({ request }) => {
  const res = await fetch(`${WORKER_URL}/track`, {
    method: "POST",
    headers: request.headers,
    body: request.body,
  });
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
};
