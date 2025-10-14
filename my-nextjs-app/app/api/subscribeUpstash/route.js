import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    if (!channel) return NextResponse.json({ error: "Missing channel" }, { status: 400 });

    // SSE do Upstash Pub/Sub
    const response = await fetch(`https://qstash.upstash.io/v1/stream/${channel}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Erro ao conectar SSE:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
