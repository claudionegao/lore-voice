// app/api/publishUpstash/route.js
export async function POST(req) {
  const { channel, message } = await req.json();

  const res = await fetch(`https://qstash.upstash.io/v1/publish/${channel}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  return new Response(JSON.stringify({ ok: res.ok }), {
    headers: { "Content-Type": "application/json" },
  });
}
