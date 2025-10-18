// src/listener.js
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

// Configura o Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function startListener(channel, callback) {
    const eventSource = new EventSource(`/api/subscribeUpstash?channel=${channel}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📥 From lib:", data.message);
        if (callback) callback(data.message);
      } catch (err) {
        console.error("❌ Erro ao processar mensagem:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ Erro na conexão SSE:", err);
      eventSource.close();
    };

    console.log(`👂 Ouvindo canal: ${channel}`);
    return eventSource;
}
