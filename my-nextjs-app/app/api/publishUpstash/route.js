import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { channel, message } = body;

    if (!channel || !message) {
      return new Response(
        JSON.stringify({ error: "É necessário informar 'channel' e 'message'" }),
        { status: 400 }
      );
    }

    console.log("🔹 Publicando no canal:", channel);
    console.log("🔹 Mensagem:", message);

    const result = await redis.publish(channel, JSON.stringify(message));

    console.log("✅ Resultado do publish:", result);

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Erro completo do publish:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Erro desconhecido",
        stack: err.stack,
      }),
      { status: 500 }
    );
  }
}
