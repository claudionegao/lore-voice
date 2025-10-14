import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { channel, message } = await req.json();

    if (!channel || !message) {
      return NextResponse.json({ error: "É necessário informar 'channel' e 'message'" }, { status: 400 });
    }

    // Endpoint Pub/Sub do Upstash
    const res = await fetch(`https://qstash.upstash.io/v1/publish/${channel}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await res.json();

    return NextResponse.json({ ok: true, result: data });
    } catch (err) {
    console.error("Erro completo do publish:", err);
    return res.status(500).json({ error: err.message, stack: err.stack });
    }
}
