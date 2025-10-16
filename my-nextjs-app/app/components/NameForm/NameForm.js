"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import UserContext from "../../context/UserContext";
import messeger from "../../../lib/messagelib";
import "./style.css";

const NameForm = () => {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("narrador");
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [timer, setTimer] = useState(5);
  const [AgoraRTC, setAgoraRTC] = useState(null);

  const router = useRouter();
  const { _setClient } = useContext(UserContext);

  const timerRef = useRef(null);
  const requestCount = useRef(0);

  // 🔹 Importa o SDK do Agora dinamicamente
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("agora-rtc-sdk-ng").then((mod) => setAgoraRTC(mod.default));
  }, []);

  // 🔹 Timer inicial de 5s (para reenviar solicitação)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setButtonDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // 🔹 Envia a solicitação ao admin
  async function sendRequest() {
    if (!name) return;

    await messeger.sMessage("admin", {
      name,
      skill,
      timestamp: Date.now(),
    });

    requestCount.current += 1;
    const newTimer = requestCount.current > 1 ? Math.ceil(5 * 1.5) : 5;
    setTimer(newTimer);
    setButtonDisabled(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setButtonDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // 🔹 Envia pedido de conexão
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !AgoraRTC) return;

    // ✅ Verifica se já está conectado (localStorage)
    const alreadyConnected = localStorage.getItem("connected");
    if (alreadyConnected === "true") {
      setAwaitingApproval(true);
      setButtonDisabled(true);
      console.log("🔁 Já autorizado anteriormente, pulando aprovação.");
      return connectRtc();
    }

    // Caso contrário, pede aprovação
    await sendRequest();
    setAwaitingApproval(true);

    // 🔹 Escuta o canal de aprovação
    const listener = messeger.mListener("access", (msg) => {
      if (msg.name === name && msg.approved) {
        // ✅ Salva estado conectado no localStorage
        localStorage.setItem("connected", "true");

        if (timerRef.current) clearInterval(timerRef.current);
        setTimer(0);
        setButtonDisabled(true);
        connectRtc();
      }
    });
  }

  // 🔹 Conecta ao canal de voz
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

  return (
    <div className="page-container">
      {!awaitingApproval ? (
        <form onSubmit={handleSubmit} className="name-form">
          <label>Qual seu nome?</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            required
          />

          <div>
            <label>
              <input
                type="radio"
                name="skill"
                value="narrador"
                checked={skill === "narrador"}
                onChange={() => setSkill("narrador")}
              />
              Narrador
            </label>
            <label>
              <input
                type="radio"
                name="skill"
                value="jogador"
                checked={skill === "jogador"}
                onChange={() => setSkill("jogador")}
              />
              Jogador
            </label>
          </div>

          <button type="submit" className="button connect-button">
            Connect
          </button>
        </form>
      ) : (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Aguardando aprovação</h2>
            <p>Sua solicitação foi enviada ao administrador.</p>

            <button
              onClick={sendRequest}
              disabled={buttonDisabled}
              className={`button resend-button ${
                buttonDisabled ? "button-disabled" : ""
              }`}
            >
              {buttonDisabled ? `Aguardar ${timer}s` : "Reenviar"}
            </button>

            <button
              onClick={() => setAwaitingApproval(false)}
              className="button cancel-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NameForm;
