"use client";
import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

const NameForm = () => {
  const [name, setName] = useState("");
  const [AgoraRTC, setAgoraRTC] = useState(null);
  const [AgoraRTM, setAgoraRTM] = useState(null);
  const router = useRouter();
  const { _client, _mClient, _setClient, setUsers, _setMclient } =
    useContext(UserContext);

  // 🔹 Aguarda conexão RTC
  function waitForConnection(client, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (client.connectionState === "CONNECTED") return resolve();

      const timer = setTimeout(() => {
        client.off("connection-state-change", onChange);
        reject(new Error("Tempo esgotado para conectar ao canal"));
      }, timeout);

      function onChange(state) {
        if (state === "CONNECTED") {
          clearTimeout(timer);
          client.off("connection-state-change", onChange);
          resolve();
        }
      }

      client.on("connection-state-change", onChange);
    });
  }

  // 🔹 Busca usuários do DB
  async function buscarUsuariosDB() {
    try {
      const res = await fetch("/api/getUsers");
      const data = await res.json();
      return data.users || [];
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      return [];
    }
  }

  // 🔹 Lógica do host
  async function handleUserChange() {
    const usuariosDB = await buscarUsuariosDB();
    const hostUser = usuariosDB.find((u) => u.host);

    if (hostUser) {
      if (hostUser.nome !== name) return;
      await fetch("/api/updateDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name }),
      });
      return;
    }

    const minIdUser = usuariosDB.reduce(
      (prev, curr) => (!prev || curr.id < prev.id ? curr : prev),
      null
    );

    if (!minIdUser) return;

    if (minIdUser.nome === name) {
      await fetch("/api/updateDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, makeHost: true }),
      });
    }
  }

  // 🔹 Import dinâmico apenas no browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    // RTC ESM
    import("agora-rtc-sdk-ng").then((mod) => setAgoraRTC(mod.default));

    // RTM ESM
    import("agora-rtm-sdk").then((mod) => setAgoraRTM(mod));
  }, []);

  // 🔹 Eventos de usuário RTC
  useEffect(() => {
    if (!_client) return;

    _mClient?.on("MessageFromPeer", (msg, peerId) => {
      try {
        const data = JSON.parse(msg.text);
        if (data.type === "papelChanged") {
          setUsers((prev) =>
            prev.map((u) =>
              u.nome === data.data.nome ? { ...u, skill: data.data.skill } : u
            )
          );
        }
      } catch (err) {
        console.error("Erro ao processar mensagem RTM:", err);
      }
    });

    _client.on("user-published", async (user, mediaType) => {
      await _client.subscribe(user, mediaType);
      console.log(`user ${user.uid} entrou`);
      if (mediaType === "audio") user.audioTrack.play();
      await handleUserChange();
    });

    _client.on("user-unpublished", async (user) => {
      console.log(`user ${user.uid} saiu`);
      await handleUserChange();
    });

    if (_client.connectionState === "CONNECTED") {
      router.push(`/nome?nome=${encodeURIComponent(name)}`);
    }
  }, [_client]);

  // 🔹 Submissão do formulário
  async function handleSubmit(e) {
    e.preventDefault();
    if (!AgoraRTC || !AgoraRTM) return;

    // RTM
    const rtmClient = AgoraRTM.createInstance(appId, { enableLogUpload: false });
    await rtmClient.login({ uid: name });
    const channel = await rtmClient.createChannel("SkillChannel");
    await channel.join();

    // RTC
    const rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "LoreVoice", name }),
    });
    const { token } = await res.json();

    await rtcClient.join(appId, "LoreVoice", token, name);
    const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtcClient.publish([micTrack]);
    await waitForConnection(rtcClient);

    await fetch("/api/updateDB", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: name }),
    });

    _setClient(rtcClient);
    _setMclient(channel);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto"
    >
      <label htmlFor="name" className="text-lg font-semibold text-gray-700">
        Qual seu nome?
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Digite seu nome"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition"
        disabled={!AgoraRTC || !AgoraRTM}
      >
        Connect
      </button>
    </form>
  );
};

export default NameForm;
