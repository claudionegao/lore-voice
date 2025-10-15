// lib/messagelib.js

const messager = {
  // Envia mensagem para o canal especificado
  async sMessage(channel, message) {
    try {
      const res = await fetch("/api/publishUpstash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel, message }),
      });

      const data = await res.json();
      console.log("📤 Resposta da API:", data);
    } catch (err) {
      console.error("❌ Erro ao chamar a API:", err);
    }
  },

  // Escuta mensagens de um canal via SSE
  mListener(channel, callback) {
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
  },
};

export default messager;
