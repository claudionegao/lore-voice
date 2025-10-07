"use client";

import React, { Suspense, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserContext from '../context/UserContext';

const NomePage = () => {
  const { _client, users, setUsers } = useContext(UserContext); // agora usa setUsers do contexto
  const router = useRouter();
  const searchParams = useSearchParams();

  const nomeParam = searchParams.get('nome') || '';
  const skillParam = searchParams.get('skill') || 'narrador';

  const [usuarios, setUsuarios] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [volumes, setVolumes] = useState({});
  const [meuUsuario, setMeuUsuario] = useState({ nome: nomeParam, skill: skillParam });

  // 🔹 Carrega usuários do DB ao iniciar (para popular o contexto)
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const res = await fetch('/api/getUsers');
        const data = await res.json();

        if (Array.isArray(data)) {
          setUsers(data); // atualiza o contexto
          setUsuarios(data); // atualiza localmente também

          const vols = Object.fromEntries(
            data.map(u => [u.nome, Math.floor(Math.random() * 100) + 1])
          );
          setVolumes(vols);
        }
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    }

    carregarUsuarios();
  }, []);

  // 🔹 Atualiza o próprio usuário (nome + skill)
  useEffect(() => {
    if (users && users.length > 0) {
      const encontrado = users.find(u => u.nome === nomeParam);
      setMeuUsuario(encontrado || { nome: nomeParam, skill: skillParam });
    }
  }, [users, nomeParam, skillParam]);

  // 🔹 Verifica conexão
  useEffect(() => {
    if (!_client || _client.connectionState !== "CONNECTED") {
      router.replace("/");
    }
  }, [_client]);

  // 🔹 Atualiza lista de usuários sempre que mudar no contexto
  useEffect(() => {
    if (Array.isArray(users)) {
      setUsuarios(users);
      const vols = Object.fromEntries(
        users.map(u => [u.nome, Math.floor(Math.random() * 100) + 1])
      );
      setVolumes(vols);
    }
  }, [users]);

  // 🔹 Desconectar do canal
  async function handleDesconectar() {
    try {
      await _client.leave();
    } catch (e) {
      console.warn("Erro ao sair:", e);
    }
    router.replace("/");
  }

  // 🔹 Selecionar jogadores (apenas narrador)
  function handleCheckbox(usuario) {
    setSelecionados(prev =>
      prev.includes(usuario)
        ? prev.filter(u => u !== usuario)
        : [...prev, usuario]
    );
  }

  // 🔹 Separar por função
  const narradores = usuarios.filter(u => u.skill === "narrador");
  const jogadores = usuarios.filter(u => u.skill === "jogador");

  // 🔹 Componente de barra de volume
  function VolumeBar({ value }) {
    return (
      <div style={{
        width: 48,
        height: 10,
        background: "#181824",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #282846",
        marginLeft: 8,
        marginRight: 4,
        display: "flex",
        alignItems: "center"
      }}>
        <div style={{
          width: `${value}%`,
          height: "100%",
          background: value > 70 ? "#22c55e" : value > 30 ? "#eab308" : "#ef4444",
          transition: "width 0.3s"
        }} />
      </div>
    );
  }

  // 🔹 Renderiza listas de usuários
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
            {meuUsuario.skill === "narrador" && u.nome !== meuUsuario.nome && (
              <input
                type="checkbox"
                checked={selecionados.includes(u.nome)}
                onChange={() => handleCheckbox(u.nome)}
                style={{ accentColor: "#6366f1" }}
              />
            )}
            {u.nome}
            {u.nome === meuUsuario.nome && (
              <span style={{ color: "#6366f1", marginLeft: 6 }}>(você)</span>
            )}
            <VolumeBar value={volumes[u.nome] ?? 0} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: "40px auto",
      display: "flex",
      flexDirection: "row",
      gap: 32,
      alignItems: "flex-start",
      justifyContent: "center",
    }}>
      <div style={{
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
      }}>
        <h1 style={{
          textAlign: "center",
          fontSize: "2rem",
          fontWeight: 700,
          margin: 0,
          color: "#6366f1",
        }}>
          {meuUsuario?.nome || nomeParam} ({meuUsuario?.skill || skillParam})
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
            marginRight: 8,
            boxShadow: "0 0 6px #22c55e88",
          }} />
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

      <div style={{
        border: "1px solid #282846",
        borderRadius: 10,
        padding: "24px 20px",
        background: "#232345",
        minWidth: 220,
        maxWidth: 280,
        flex: "0 0 220px",
        boxSizing: "border-box",
      }}>
        <div style={{ marginBottom: 10, color: "#a5b4fc", fontWeight: 500 }}>Narradores</div>
        {renderUserList(narradores)}
        <div style={{ margin: "18px 0 10px 0", color: "#a5b4fc", fontWeight: 500 }}>Jogadores</div>
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
