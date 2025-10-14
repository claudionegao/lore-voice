import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Cria cliente Redis com as variáveis do Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export async function POST(req) {
  try {
    const { channel, message } = await req.json();

    if (!channel || !message) {
      return NextResponse.json(
        { error: "É necessário informar 'channel' e 'message'" },
        { status: 400 }
      );
    }

    const result = await redis.publish(channel, JSON.stringify(message));

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("Erro ao publicar no Upstash:", err);
    return NextResponse.json(
      { error: "Erro ao publicar a mensagem" },
      { status: 500 }
    );
  }
}
