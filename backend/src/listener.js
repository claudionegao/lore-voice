// src/listener.js
import { Redis } from "@upstash/redis";
import prisma from "./prisma.js";
import dotenv from "dotenv";

dotenv.config();

// Configura o Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function startListener() {
  console.log("🔌 Listener iniciado, aguardando mensagens...");
  
  while (true) {
    try {
      // subscribe via REST retorna array de mensagens novas
      const messages = await redis.subscribe("mensagens");
      
      messages.forEach(async (message) => {
        console.log("📨 Mensagem recebida:", message);
        try {
          const data = typeof message === "string" ? JSON.parse(message) : message;

          if (!data.conteudo || !data.channel || !data.userId) return;

          await prisma.mensagem.create({
            data: {
              conteudo: data.conteudo,
              channel: data.channel,
              userId: Number(data.userId),
            },
          });

          console.log("✅ Mensagem salva no banco!");
        } catch (err) {
          console.error("❌ Erro ao processar mensagem:", err);
        }
      });
    } catch (err) {
      console.error("❌ Erro no listener:", err);
      await new Promise((r) => setTimeout(r, 1000)); // retry em 1s
    }
  }
}

// Chama a função
startListener();
