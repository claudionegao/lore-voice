// app/nome/page.js
"use client";

import React, { Suspense, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserContext from '../context/UserContext';

const NomePage = () => {
  const { _client, users } = useContext(UserContext); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const nome = searchParams.get('nome') || '';

  const [usuarios, setUsuarios] = useState([]);
  const [papel, setPapel] = useState("narrador"); // agora começa selecionado no Narrador
  const [selecionados, setSelecionados] = useState([]);
  const [volumes, setVolumes] = useState({});

  // 🔹 Verifica conexão
  useEffect(() => {
    if (!_client || _client.connectionState !== "CONNECTED") {
      router.replace("/");
    }
  }, [_client]);

  // 🔹 Buscar usuários do DB inicialmente
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch('/api/getUsers');
        const data = await res.json();
        setUsuarios(data);

        // Inicializa volumes
        const vols = Object.fromEntries(data.map(u => [u.nome, Math.floor(Math.random() * 100) + 1]));
        setVolumes(vols);

      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    }
    fetchUsuarios();
  }, [nome]);

  // 🔹 Atualiza lista local sempre que 'users' do contexto mudar
  useEffect(() => {
    if (Array.isArray(users)) {
      setUsuarios(users);
    }
  }, [users]);

  async function handleDesconectar() {
    await _client.leave();
    router.replace("/");
  }

  function handleCheckbox(usuario) {
    setSelecionados(prev =>
      prev.includes(usuario)
        ? prev.filter(u => u !== usuario)
        : [...prev, usuario]
    );
  }

  async function handlePapelChange(novoPapel) {
    setPapel(novoPapel);
    setUsuarios(prev =>
      prev.map(u => u.nome === nome ? { ...u, skill: novoPapel } : u)
    );

    // Atualiza DB
    await fetch('/api/updateSkill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, skill: novoPapel })
    });

    // Envia notificação para outros usuários via _client
    _client.sendMessage({
      type: 'papelChanged',
      data: { nome, skill: novoPapel }
    });
  }

  const narradores = usuarios.filter(u => u.skill === "narrador");
  const jogadores = usuarios.filter(u => u.skill === "jogador");

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

  function renderUserList(list) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {list.map((u, i) => (
          <li
            key={i}
            style={{
              padding: "6px 0",
              color: u.nome === nome ? "#fff" : "#b3b3cc",
              fontWeight: u.nome === nome ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {papel === "narrador" && u.nome !== nome && (
              <input
                type="checkbox"
                checked={selecionados.includes(u.nome)}
                onChange={() => handleCheckbox(u.nome)}
                style={{ accentColor: "#6366f1" }}
              />
            )}
            {u.nome}
            {u.nome === nome && (
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
        }}>{nome}</h1>

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

        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, color: "#b3b3cc" }}>Selecione seu papel:</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input
              type="radio"
              name="papel"
              value="narrador"
              checked={papel === "narrador"}
              onChange={() => handlePapelChange("narrador")}
              style={{ accentColor: "#6366f1" }}
            />
            Narrador
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="radio"
              name="papel"
              value="jogador"
              checked={papel === "jogador"}
              onChange={() => handlePapelChange("jogador")}
              style={{ accentColor: "#6366f1" }}
            />
            Jogador
          </label>
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
