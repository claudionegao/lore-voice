// app/api/subscribeUpstash/route.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  if (!channel) return new Response("Missing channel", { status: 400 });

  // 👉 Em vez de redis.subscribe(), usamos o endpoint SSE do Upstash Pub/Sub:
  const response = await fetch(
    `https://qstash.upstash.io/v1/stream/${channel}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
