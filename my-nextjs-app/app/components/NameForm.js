"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import messeger from "../../lib/messagelib";

const NameForm = () => {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("narrador");
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [AgoraRTC, setAgoraRTC] = useState(null);
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  const { _setClient } = useContext(UserContext);
  const timerRef = useRef(null);

  const initialTime = 5; // segundos do primeiro timer

  // Import dinâmico do RTC
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("agora-rtc-sdk-ng").then((mod) => setAgoraRTC(mod.default));
  }, []);

  // Função para enviar solicitação
  async function sendRequest() {
    await messeger.sMessage("admin", {
      name,
      skill,
      timestamp: Date.now(),
    });

    // Incrementa tentativa e calcula timer
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    let time = initialTime;
    if (newAttempts > 1) time = Math.ceil(time * Math.pow(1.5, newAttempts - 1));
    setTimer(time);

    // Limpa timer anterior
    if (timerRef.current) clearInterval(timerRef.current);

    // Contagem regressiva
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !AgoraRTC) return;

    // 1️⃣ Envia solicitação
    await sendRequest();
    setAwaitingApproval(true);

    // 2️⃣ Escuta aprovação
    const listener = messeger.mListener("access", (msg) => {
      if (msg.name === name && msg.approved) {
        setTimer(0); // desabilita botão
        connectRtc();
      }
    });
  }

  async function connectRtc() {
    const rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "LoreVoice", name }),
    });
    const { token } = await res.json();
    await rtcClient.join(
      process.env.NEXT_PUBLIC_AGORA_APP_ID,
      "LoreVoice",
      token,
      name + "@" + skill
    );
    const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtcClient.publish([micTrack]);
    _setClient(rtcClient);
    router.push(
      `/nome?nome=${encodeURIComponent(name)}&skill=${encodeURIComponent(skill)}`
    );
  }

  const buttonDisabled = timer > 0;

  return (
    <>
      {!awaitingApproval ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto"
        >
          <label className="text-lg font-semibold text-gray-700">
            Qual seu nome?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Skill selector */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
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
            <label className="flex items-center gap-2">
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
          >
            Connect
          </button>
        </form>
      ) : (
        // Janela aguardando aprovação
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center border border-blue-600">
            <h2 className="text-xl font-semibold mb-4">Aguardando aprovação</h2>
            <p className="mb-4">
              Sua solicitação foi enviada ao administrador.
            </p>
            <button
              onClick={sendRequest}
              disabled={buttonDisabled}
              className={`px-4 py-2 rounded font-semibold transition w-full ${
                buttonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {buttonDisabled ? `Reenviar em ${timer}s` : "Reenviar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NameForm;
