import { Redis } from "@upstash/redis";
import prisma from "./prisma.js";
import dotenv from "dotenv";

dotenv.config();

// Conecta ao Upstash WebSocket
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,  // WebSocket URL
  token: process.env.UPSTASH_REDIS_REST_TOKEN, // mesmo token
});

export async function startListener(channels = ["mensagens"]) {
  console.log("🔌 Listener WS iniciado...");

  for (const channel of channels) {
    const sub = await redis.subscribe(channel);

    sub.on("message", async (message) => {
      try {
        const data = typeof message === "string" ? JSON.parse(message) : message;

        if (!data.conteudo || !data.channel || !data.userId) {
          console.warn("⚠️ Mensagem inválida:", data);
          return;
        }

        await prisma.mensagem.create({
          data: {
            conteudo: data.conteudo,
            channel: data.channel,
            userId: Number(data.userId),
          },
        });

        console.log("✅ Mensagem salva:", data);
      } catch (err) {
        console.error("❌ Erro ao processar mensagem:", err);
      }
    });

    sub.on("error", (err) => {
      console.error(`❌ Erro no canal ${channel}:`, err);
    });

    console.log(`👂 Escutando canal: ${channel}`);
  }
}
