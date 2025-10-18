import { Redis } from "@upstash/redis";
import prisma from "./prisma.js";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function startListener() {
  console.log("🔌 Conectando ao canal Pub/Sub...");

  // Aqui substitui "mensagens" pelo nome do canal que tu usa
  await redis.subscribe("mensagens", async (message) => {
    console.log("📨 Nova mensagem recebida:", message);

    try {
      // Exemplo: salva no banco
      await prisma.mensagem.create({
        data: {
          conteudo: message.conteudo,
          usuario: message.usuario,
          criadoEm: new Date(),
        },
      });

      console.log("✅ Mensagem salva no banco!");
    } catch (err) {
      console.error("❌ Erro ao salvar mensagem:", err);
    }
  });
}
