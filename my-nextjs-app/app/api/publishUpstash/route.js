// pages/api/publish.js
import { Redis } from "@upstash/redis";

// Configura o Redis usando as variáveis de ambiente
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default async function POST(req, res) {
  /*if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }*/

  const { channel, message } = req.body;

  if (!channel || !message) {
    return res.status(400).json({ error: "É necessário informar 'channel' e 'message'" });
  }

  try {
    // Publica a mensagem no Upstash
    const result = await redis.publish(channel, JSON.stringify(message));
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao publicar a mensagem" });
  }
}
