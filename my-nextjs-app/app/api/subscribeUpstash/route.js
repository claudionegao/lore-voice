import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Essa rota vai manter a conexão aberta e enviar dados em tempo real
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");

  if (!channel) {
    return new Response("Missing channel", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const listener = async (message) => {
        controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
      };

      // Escuta o canal do usuário
      redis.subscribe(channel, listener);

      // Fecha a conexão quando o cliente desconecta
      req.signal.addEventListener("abort", () => {
        redis.unsubscribe(channel, listener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
