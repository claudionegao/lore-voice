// my-nextjs-app/app/methods/connect.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { get } from "http";
import { listarUsuariosConectados,getuserinfo } from "./userlist";
let rtcClient: any;


export async function entradaUsuario(nome: string, tipo: string) {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
  // Aqui você pode validar, salvar, conectar, etc.
  const res = await fetch(`/api/token?uid=${nome}`);
  const data = await res.json();
    const channelName = 'LoreVoice';
  const token = data.token;
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  rtcClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  await rtcClient.setClientRole('host');
  try {
    await rtcClient.join(appId, channelName, token, nome);
    const uidReal = rtcClient.uid;
    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtcClient.publish([localAudioTrack]);
    console.clear();
    console.log(`✅ ${nome}(${uidReal}) conectado com sucesso ao canal "${channelName}" como ${tipo}`);
  } catch (error) {
    console.clear();
    console.error("❌ Erro ao conectar:", error);
  }
// serializar retorno de fetch
  const response = await listarUsuariosConectados();
  const users = response.data.broadcasters
  users.forEach(async (user:any) => {
    const data = await getuserinfo(user)
    console.log(data);
  });
  
  const usuariosConectados = new Set();

  rtcClient.on("user-published", async (user: any, mediaType: "audio" | "video") => {
    usuariosConectados.add(user.uid);
    console.log("Conectados agora:", Array.from(usuariosConectados));
  });

  rtcClient.on("user-unpublished", (user: any) => {
    usuariosConectados.delete(user.uid);
    console.log("Conectados agora:", Array.from(usuariosConectados));
  });
  //disconnect from channel
  rtcClient.leave();
}

export const fetchToken = async (uid: string) => {
  const res = await fetch(`/api/token?uid=${uid}`);
  const data = await res.json();
  return data.token;
};
/* eslint-enable @typescript-eslint/no-explicit-any */