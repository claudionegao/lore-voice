let rtmClient = null;
let rtmChannel = null;


const [AgoraRTM, setAgoraRTM] = useState(null);

useEffect(() => {
if (typeof window === "undefined") return;

import("agora-rtm-sdk").then((mod) => setAgoraRTM(mod.default || mod));
}, []);


export async function createRtmClient(appId, uid, channel, token = null) {
  if (rtmClient) return { rtmClient, rtmChannel };

  rtmClient = AgoraRTM.createInstance(appId);

  await rtmClient.login({ uid, token });

  rtmChannel = rtmClient.createChannel(channel);
  await rtmChannel.join();

  console.log(`[RTM] conectado no canal ${channel} como ${uid}`);
  return { rtmClient, rtmChannel };
}

export function getRtmClient() {
  return rtmClient;
}

export function getRtmChannel() {
  return rtmChannel;
}

export async function sendChannelMessage(message) {
  if (!rtmChannel) return console.warn("Canal RTM não inicializado");
  await rtmChannel.sendMessage({ text: JSON.stringify(message) });
}

export function onChannelMessage(callback) {
  if (!rtmChannel) return console.warn("Canal RTM não inicializado");
  rtmChannel.on("ChannelMessage", (msg, memberId) => {
    try {
      const data = JSON.parse(msg.text ?? msg);
      callback(data, memberId);
    } catch (err) {
      console.warn("Mensagem RTM inválida", msg);
    }
  });
}
