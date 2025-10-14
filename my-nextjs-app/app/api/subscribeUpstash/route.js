import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");

  const stream = new ReadableStream({
    async start(controller) {
      console.log("🔌 SSE iniciado no canal:", channel);

      const sub = await redis.subscribe(channel);
      sub.on("message", (message) => {
        const payload = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
      }, 20000);

      req.signal.addEventListener("abort", async () => {
        clearInterval(keepAlive);
        await sub.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
