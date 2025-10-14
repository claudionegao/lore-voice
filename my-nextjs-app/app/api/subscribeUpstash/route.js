// app/api/subscribeUpstash/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // força modo full Node no Render

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel');

  if (!channel) {
    return NextResponse.json({ error: 'Canal não especificado' }, { status: 400 });
  }

  return new Response(
    new ReadableStream({
      async start(controller) {
        controller.enqueue(`: conectado ao canal ${channel}\n\n`);

        const encoder = new TextEncoder();

        try {
          while (true) {
            const res = await fetch(
              `${process.env.UPSTASH_REDIS_REST_URL}/get/${channel}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                },
                cache: 'no-store',
              }
            );

            if (res.ok) {
              const data = await res.json();
              if (data?.result) {
                controller.enqueue(encoder.encode(`data: ${data.result}\n\n`));
              }
            }

            // Espera 5 segundos antes de checar de novo (sem polling agressivo)
            await new Promise((r) => setTimeout(r, 5000));
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${err.message}\n\n`));
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    }
  );
}
