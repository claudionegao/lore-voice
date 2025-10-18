import { Redis } from "@upstash/redis";
import prisma from "./prisma.js";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Start listener que processa todas as mensagens recebidas
 */
export async function startListener() {
  console.log("🔌 Listener iniciado em todos os canais...");

  while (true) {
    try {
      // Chama subscribe sem filtro de canal, Upstash REST retorna todas as mensagens
      const messages = await redis.subscribe("*"); // "*" significa todos os canais
      // Em Upstash REST, pode precisar passar nome do canal. Para vários canais, chamar subscribe várias vezes

      for (const message of messages) {
        try {
          const data = typeof message === "string" ? JSON.parse(message) : message;

          if (!data.conteudo || !data.channel || !data.userId) {
            console.warn("⚠️ Mensagem inválida:", data);
            continue;
          }

          await prisma.mensagem.create({
            data: {
              conteudo: data.conteudo,
              channel: data.channel, // salva o canal da mensagem
              userId: Number(data.userId),
            },
          });

          console.log("✅ Mensagem salva:", data);
        } catch (err) {
          console.error("❌ Erro ao processar mensagem:", err);
        }
      }

    } catch (err) {
      console.error("❌ Erro no listener:", err);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
