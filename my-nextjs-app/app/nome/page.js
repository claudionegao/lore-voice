"use client";

import React, { Suspense, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UserContext from "../context/UserContext";

const NomePage = () => {
  const { _client } = useContext(UserContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const nomeParam = searchParams.get("nome") || "";
  const skillParam = searchParams.get("skill") || "narrador";

  const [usuarios, setUsuarios] = useState([]);
  const [volumes, setVolumes] = useState({});
  const [selecionados, setSelecionados] = useState([]);
  const [meuUsuario, setMeuUsuario] = useState({
    nome: nomeParam,
    skill: skillParam,
    id: _client?._joinInfo?.uid || Math.random().toString(),
    vol: true,
  });

  const routerRef = useRef(router);

  // 🔹 Atualiza lista com base no remoteUsers sempre que mudar
  async function atualizarListaAgora() {
    if (!_client) return;

    try {
      const remoteUsers = _client.remoteUsers || [];
      const listaAtual = remoteUsers.map((u) => ({
        nome: u.uid.split("@")[0],
        skill: u.uid.split("@")[1] || "jogador",
        id: u._uintid,
        vol: (u.uid.split("@")[1] || "jogador") === "jogador",
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
      if (mediaType === "audio" && skill === "jogador" || meuUsuario.skill === "narrador") {
        user.audioTrack.play();
      }
    };

    const handleJoin = async (user) => {
      console.log(`🔵 ${user.uid} entrou`);
      atualizarListaAgora();
    };

    const handleLeave = (user) => {
      console.log(`🔴 ${user.uid} saiu`);
      atualizarListaAgora();
    };

    _client.remoteUsers.forEach(async (user) => {
      await _client.subscribe(user, "audio");
      const skill = typeof user.uid === "string" ? user.uid.split("@")[1] : "jogador";
      if (skill === "jogador" || meuUsuario.skill === "narrador") {
        user.audioTrack.play();
      }
    });

    _client.enableAudioVolumeIndicator();

    const handleVolume = (volumesInfo) => {
      setVolumes((prev) => {
        const atualizado = { ...prev };
        volumesInfo.forEach(({ uid, level }) => {
          let nome = "";
          if (uid === 0) nome = meuUsuario.nome;
          else if (typeof uid === "string") nome = uid.split("@")[0];
          if (nome) atualizado[nome] = Math.min(Math.round(level), 100);
        });
        return atualizado;
      });
    };

    _client.on("volume-indicator", handleVolume);
    _client.on("user-published", handlePublish);
    _client.on("user-joined", handleJoin);
    _client.on("user-left", handleLeave);

    // Listener SSE deny
    const denyEventSource = new EventSource("/api/subscribeUpstash?channel=deny");
    denyEventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const targetId = data.message.id;
      if (targetId.toString() === meuUsuario.id.toString()) {
        console.warn("❌ Você foi desconectado pelo admin!");

        // Para todas as tracks locais
        if (_client.localTracks) {
          _client.localTracks.forEach((track) => {
            track.stop();
            track.close();
          });
        }

        // Para todas as tracks remotas
        if (_client.remoteUsers) {
          _client.remoteUsers.forEach((user) => {
            if (user.audioTrack) {
              try { user.audioTrack.stop(); } catch {}
            }
          });
        }

        // Remove approval/localStorage
        localStorage.removeItem("connected");

        // Leave
        try { await _client.leave(); } catch (e) { console.error(e); }

        // Redireciona
        routerRef.current.replace("/");
      }
    };
    denyEventSource.onerror = (err) => {
      console.error("Erro no SSE deny:", err);
      denyEventSource.close();
    };

    atualizarListaAgora();

    return () => {
      _client.off("volume-indicator", handleVolume);
      _client.off("user-published", handlePublish);
      _client.off("user-joined", handleJoin);
      _client.off("user-left", handleLeave);
      denyEventSource.close();
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
      if (_client.localTracks) {
        _client.localTracks.forEach(track => {
          track.stop();
          track.close();
        });
      }
      if (_client) await _client.leave();
      localStorage.removeItem("connected");
    } catch (e) {
      console.warn("Erro ao sair:", e);
    }
    router.replace("/");
  }

  // ... restante do componente continua igual (renderUserList, VolumeBar, JSX)
};

export default function NomePageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NomePage />
    </Suspense>
  );
}
