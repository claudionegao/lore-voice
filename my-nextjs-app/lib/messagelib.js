const messager = {
    async sMessage(channel,message){
        try {
          const res = await fetch("/api/publishUpstash", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              channel: channel,
              message: message
            }),
          });
        
          const data = await res.json();
          console.log("Resposta da API:", data);
        } catch (err) {
          console.error("Erro ao chamar a API:", err);
        }
    },
    
    async mListener(channel){
        const eventSource = new EventSource(`/api/subscribeUpstash?channel=${channel}`);
        eventSource.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          console.log("From lib")
          console.log(data.message)
          return data.message;
        }
    },
};

export default messager