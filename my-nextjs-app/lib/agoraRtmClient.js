let AgoraRTM = null;
let rtmClient = null;
let rtmChannel = null;

async function loadRTMLibrary() {
  if (AgoraRTM) return AgoraRTM;
  if (typeof window === "undefined") return null; // evita SSR

  const mod = await import("agora-rtm-sdk");
  AgoraRTM = mod.default || mod; // alguns bundlers usam default
  return AgoraRTM;
}

export async function createRtmClient(appId, uid, channel, token = null) {
    const {RTM} = await loadRTMLibrary();
    if (!RTM) throw new Error("RTM SDK não carregado corretamente");

    try {
    const rtm = new RTM(appId, uid);
    const resultlogin = await rtm.login({ token: token });
    console.log("resultlogin");
    console.log(resultlogin);
    const resultsubscribe = await rtm.subscribe(channel);
    console.log("resultsubscribe");
    console.log(resultsubscribe);

    console.log(`[RTM] conectado no canal ${channel} como ${uid}`);
    return { rtm };
    } catch (status) {
    console.log("Error");
    console.log(status);
    }

}

export function getRtmClient() {
  return rtmClient;
}

export function getRtmChannel() {
  return rtmChannel;
}

export async function sendChannelMessage(message) {
  //await loadRTMLibrary()  
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
