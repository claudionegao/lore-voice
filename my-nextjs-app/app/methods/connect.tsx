// my-nextjs-app/app/methods/connect.tsx

import AgoraRTC from 'agora-rtc-sdk-ng';
import IRemoteUser, {IRemoteAudioTrack, IAgoraRTCClient } from 'agora-rtc-sdk-ng'

let rtcClient: any;


export async function entradaUsuario(nome: string, tipo: string) {
  // Aqui você pode validar, salvar, conectar, etc.
  const res = await fetch(`/api/token?uid=${nome}`);
  const data = await res.json();
    const channelName = 'LoreVoice';
  const token = data.token;
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  rtcClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  await rtcClient.setClientRole('host');
  await rtcClient.join(appId, channelName, token, nome);
  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await rtcClient.publish([localAudioTrack]);

  
  const usuariosConectados = new Set();

  rtcClient.on("user-published", async (user: typeof IRemoteUser, mediaType: "audio" | "video") => {
    usuariosConectados.add(user.uid);
    console.log("Conectados agora:", Array.from(usuariosConectados));
  });

  rtcClient.on("user-unpublished", (user) => {
    usuariosConectados.delete(user.uid);
    console.log("Conectados agora:", Array.from(usuariosConectados));
  });

}

export const fetchToken = async (uid: string) => {
  const res = await fetch(`/api/token?uid=${uid}`);
  const data = await res.json();
  return data.token;
};
