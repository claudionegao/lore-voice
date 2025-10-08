import { useState, useEffect } from "react";

let AgoraRTM = null;
let rtmClient = null;
let rtmChannel = null;

async function loadRTMLibrary() {
  if (AgoraRTM) return AgoraRTM;
  if (typeof window === "undefined") return null; // Evita SSR

  const mod = await import("agora-rtm-sdk");
  AgoraRTM = mod.default || mod;
  return AgoraRTM;
}


export async function createRtmClient(appId, uid, channel, token = null) {
  await loadRTMLibrary()  
  if (rtmClient) return { rtmClient, rtmChannel };

  rtmClient = AgoraRTM.createInstance(appId);

  await rtmClient.login({ uid, token });

  rtmChannel = rtmClient.createChannel(channel);
  await rtmChannel.join();

  console.log(`[RTM] conectado no canal ${channel} como ${uid}`);
  return { rtmClient, rtmChannel };
}

export function getRtmClient() {
  await loadRTMLibrary()  
  return rtmClient;
}

export function getRtmChannel() {
  await loadRTMLibrary()  
  return rtmChannel;
}

export async function sendChannelMessage(message) {
  await loadRTMLibrary()  
  if (!rtmChannel) return console.warn("Canal RTM não inicializado");
  await rtmChannel.sendMessage({ text: JSON.stringify(message) });
}

export function onChannelMessage(callback) {
  await loadRTMLibrary()  
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
