"use client";

import React, { Suspense, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import { sendChannelMessage } from "../../lib/agoraRtmClient";

const NomePage = () => {
  const { _client } = useContext(UserContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const nomeParam = searchParams.get("nome") || "";
  const skillParam = searchParams.get("skill") || "narrador";

  const [usuarios, setUsuarios] = useState([]);
  const [volumes, setVolumes] = useState({});
  const [selecionados, setSelecionados] = useState([]);
  const [volumeVisivel, setVolumeVisivel] = useState({}); // 🔹 controle por UID
  const [meuUsuario, setMeuUsuario] = useState({
    nome: nomeParam,
    skill: skillParam,
    id: _client._joinInfo.uid,
  });

  // 🔹 Atualiza lista com base no remoteUsers sempre que mudar
  async function atualizarListaAgora() {
    if (!_client) return;

    try {
      const remoteUsers = _client.remoteUsers || [];
      const listaAtual = remoteUsers.map((u) => ({
        nome: u.uid.split("@")[0],
        skill: u.uid.split("@")[1] || "jogador",
        id: u._uintid,
        uid: u.uid,
      }));
      setUsuarios(listaAtual);
    } catch (err) {
      console.error("Erro ao atualizar lista:", err);
    }
  }

  // 🔹 Inicializa listeners de eventos do Agora
  useEffect(() => {
    if (!_client) return;

    const handlePublish = async (user, mediaType) => {
      await _client.subscribe(user, mediaType);
      const skill = typeof user.uid === "string" ? user.uid.split("@")[1] : "jogador";
      if (mediaType === "audio" && skill === "jogador") user.audioTrack.play();
    };

    const handleJoin = async (user) => {
      console.log(`🔵 ${user.uid} entrou`);
      atualizarListaAgora();
    };

    const handleLeave = (user) => {
      console.log(`🔴 ${user.uid} saiu`);
      atualizarListaAgora();
    };

    // Inicializa áudio dos usuários existentes
    _client.remoteUsers.forEach(async (user) => {
      await _client.subscribe(user, "audio");
      const skill = typeof user.uid === "string" ? user.uid.split("@")[1] : "jogador";
      if (skill === "jogador") user.audioTrack.play();
    });

    _client.enableAudioVolumeIndicator();

    const handleVolume = (volumesInfo) => {
      setVolumes(prev => {
        const atualizado = { ...prev };
        volumesInfo.forEach(({ uid, level }) => {
          let nome = "";
          if (uid === 0) {
            nome = meuUsuario.nome;
          } else if (typeof uid === "string") {
            nome = uid.split("@")[0];
          }
          if (nome) atualizado[nome] = Math.min(Math.round(level), 100);
        });
        return atualizado;
      });
    };

    _client.on("volume-indicator", handleVolume);
    _client.on("user-published", handlePublish);
    _client.on("user-joined", handleJoin);
    _client.on("user-left", handleLeave);

    // 🔹 SSE para controle de mute/desmute
    const eventSource = new EventSource(`/api/subscribeUpstash?channel=${_client._joinInfo.uid}`);
    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const targetUid = data.message.from;
      const shouldMute = data.message.mute;

      if (!_client || !_client.remoteUsers) return;

      const user = _client.remoteUsers.find(u => u.uid.toString() === targetUid.toString());
      if (!user) return;

      // Controla áudio
      if (user.audioTrack) {
        if (shouldMute) user.audioTrack.stop();
        else user.audioTrack.play();
      }

      // Controla visibilidade do volume (só para narradores)
      const isNarrador = typeof user.uid === "string" && user.uid.split("@")[1] === "narrador";
      if (isNarrador) {
        setVolumeVisivel(prev => ({
          ...prev,
          [user.uid]: !shouldMute
        }));
      }
    };
    eventSource.onerror = (err) => {
      console.error("❌ Erro na conexão SSE:", err);
      eventSource.close();
    };

    atualizarListaAgora();

    return () => {
      _client.off("volume-indicator", handleVolume);
      _client.off("user-published", handlePublish);
      _client.off("user-joined", handleJoin);
      _client.off("user-left", handleLeave);
      eventSource.close();
    };
  }, [_client]);

  // 🔹 Verifica conexão
  useEffect(() => {
    if (!_client || _client.connectionState !== "CONNECTED") {
      router.replace("/");
    }
  }, [_client]);

  // 🔹 Desconectar
  async function handleDesconectar() {
    try {
      if (_client.localTracks && _client.localTracks.length > 0) {
        _client.localTracks.forEach(track => {
          track.stop();
          track.close();
        });
      }
      await _client.leave();
      console.log("🔴 Desconectado e microfone parado");
    } catch (e) {
      console.warn("Erro ao sair:", e);
    }
    router.replace("/");
  }

  // 🔹 Checkbox de seleção (apenas narrador)
  async function handleCheckbox(usuario) {
    const estavaSelecionado = selecionados.includes(usuario);
    const novosSelecionados = estavaSelecionados
      ? selecionados.filter(u => u !== usuario)
      : [...selecionados, usuario];

    setSelecionados(novosSelecionados);

    const tipo = estavaSelecionado ? true : false;

    try {
      const res = await fetch("/api/publishUpstash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: usuario.id,
          message: {
            from: meuUsuario.id,
            mute: tipo
          }
        })
      });
      const data = await res.json();
      console.log("Resposta da API:", data);
    } catch (err) {
      console.error("Erro ao chamar a API:", err);
    }
  }

  // 🔹 Renderiza lista de usuários
  function renderUserList(list) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {list.map((u, i) => (
          <li
            key={i}
            style={{
              padding: "6px 0",
              color: u.nome === meuUsuario.nome ? "#fff" : "#b3b3cc",
              fontWeight: u.nome === meuUsuario.nome ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {u.skill === "jogador" && meuUsuario.skill === "narrador" && (
              <input
                type="checkbox"
                checked={selecionados.includes(u)}
                onChange={() => handleCheckbox(u)}
                style={{ accentColor: "#6366f1" }}
              />
            )}
            {u.nome}
            {u.nome === meuUsuario.nome && (
              <span style={{ color: "#6366f1", marginLeft: 6 }}>(você)</span>
            )}
            <div
              style={{
                width: 48,
                height: 10,
                background: "#181824",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid #282846",
                marginLeft: 8,
                marginRight: 4,
                display: u.skill === "narrador"
                  ? volumeVisivel[u.uid] ? "flex" : "none"
                  : "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: `${volumes[u.nome] ?? 0}%`,
                  height: "100%",
                  background:
                    volumes[u.nome] > 70
                      ? "#22c55e"
                      : volumes[u.nome] > 30
                      ? "#eab308"
                      : "#ef4444",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const narradores = usuarios.filter(u => u.skill === "narrador");
  const jogadores = usuarios.filter(u => u.skill === "jogador");

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        display: "flex",
        flexDirection: "row",
        gap: 32,
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#23233a",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 4px 24px 0 #0006",
          color: "#f3f3f3",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          alignItems: "stretch",
          minWidth: 320,
          flex: 1,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "#6366f1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          {meuUsuario.nome} ({meuUsuario.skill})
          <div
            style={{
              width: 48,
              height: 10,
              background: "#181824",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #282846",
              marginLeft: 8,
              marginRight: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: `${volumes[meuUsuario.nome] ?? 0}%`,
                height: "100%",
                background:
                  volumes[meuUsuario.nome] > 70
                    ? "#22c55e"
                    : volumes[meuUsuario.nome] > 30
                    ? "#eab308"
                    : "#ef4444",
                transition: "width 0.3s",
              }}
            />
          </div>
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              marginRight: 8,
              boxShadow: "0 0 6px #22c55e88",
            }}
          />
          <span style={{ fontWeight: 500, color: "#b3b3cc" }}>Conectado</span>
        </div>

        <button
          onClick={handleDesconectar}
          style={{
            marginTop: 16,
            padding: "10px 0",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Desconectar
        </button>
      </div>

      <div
        style={{
          border: "1px solid #282846",
          borderRadius: 10,
          padding: "24px 20px",
          background: "#232345",
          minWidth: 220,
          maxWidth: 280,
          flex: "0 0 220px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 10, color: "#a5b4fc", fontWeight: 500 }}>
          Narradores
        </div>
        {renderUserList(narradores)}

        <div style={{ margin: "18px 0 10px 0", color: "#a5b4fc", fontWeight: 500 }}>
          Jogadores
        </div>
        {renderUserList(jogadores)}
      </div>
    </div>
  );
};

export default function NomePageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NomePage />
    </Suspense>
  );
}
