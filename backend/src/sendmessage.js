const { Redis } = require("@upstash/redis");
require('dotenv').config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const message = {
  conteudo: "Olá mundo! Teste do listener",
  channel: "geral",
  userId: 42
};

async function sendMessage() {
  try {
    await redis.publish("mensagens", JSON.stringify(message));
    console.log("✅ Mensagem enviada com sucesso:", message);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err);
  }
}

sendMessage();
