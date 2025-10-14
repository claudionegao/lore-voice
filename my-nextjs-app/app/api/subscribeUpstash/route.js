import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");

  if (!channel) {
    return NextResponse.json({ error: "Channel obrigatório" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      console.log("🔌 SSE iniciado no canal:", channel);
      // Configura a assinatura
      const sub = redis.subscribe(channel, (message) => {
        // Envia o evento pro navegador
        const payload = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      });

      // Keep-alive a cada 20 segundos
      const keepAlive = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
      }, 20000);

      req.signal.addEventListener("abort", async () => {
        clearInterval(keepAlive);
        (await sub).unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
