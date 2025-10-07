"use client";
import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

const NameForm = () => {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("narrador"); // skill selecionada
  const [AgoraRTC, setAgoraRTC] = useState(null);
  const router = useRouter();
  const { _client, _setClient,users, setUsers } = useContext(UserContext);

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

  // 🔹 Import dinâmico apenas no browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("agora-rtc-sdk-ng").then((mod) => setAgoraRTC(mod.default));
  }, []);

  useEffect(() => {
    if (!_client) return;

    async function criarDataStream() {
      try {
        const [dataTrack] = await AgoraRTC.createDataStream({ reliable: true, ordered: true });
        await _client.publish(dataTrack);
        _client._dataTrack = dataTrack;
        console.log("DataStream criado:", streamId);
      } catch (e) {
        console.error("Erro ao criar DataStream:", e);
      }
    }

    criarDataStream();
  }, [_client]);


  // 🔹 Submissão do formulário
  async function handleSubmit(e) {
    e.preventDefault();
    if (!AgoraRTC) return;

    const rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "LoreVoice", name }),
    });
    const { token } = await res.json();

    await rtcClient.join(appId, "LoreVoice", token, name+'@'+skill);
    const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtcClient.publish([micTrack]);
    await waitForConnection(rtcClient);

    await fetch("/api/updateDB", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: name, skill }),
    });

    _setClient(rtcClient);
    router.push(`/nome?nome=${encodeURIComponent(name)}&skill=${encodeURIComponent(skill)}`);
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

      {/* Skill selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="radio"
            name="skill"
            value="narrador"
            checked={skill === "narrador"}
            onChange={() => setSkill("narrador")}
            style={{ accentColor: "#6366f1" }}
          />
          Narrador
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="radio"
            name="skill"
            value="jogador"
            checked={skill === "jogador"}
            onChange={() => setSkill("jogador")}
            style={{ accentColor: "#6366f1" }}
          />
          Jogador
        </label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition"
        disabled={!AgoraRTC}
      >
        Connect
      </button>
    </form>
  );
};

export default NameForm;
