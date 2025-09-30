"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// Simula usuários e papéis
const usuariosMock = [
  { nome: "Alice", papel: "jogador" },
  { nome: "Bob", papel: "narrador" },
];

const NomePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nome = searchParams.get('nome') || '';

  // Estado local para todos os usuários (incluindo o atual)
  const [usuarios, setUsuarios] = useState(() => {
    const jaExiste = usuariosMock.some(u => u.nome === nome);
    return jaExiste
      ? usuariosMock
      : [...usuariosMock, { nome, papel: "jogador" }];
  });

  const papelAtual = usuarios.find(u => u.nome === nome)?.papel === "narrador" ? "narrador" : "jogador";
  const [papel, setPapel] = useState<"narrador" | "jogador">(papelAtual);
  const [selecionados, setSelecionados] = useState<string[any]>([]);

  const [volumes] = useState() =>
    Object.fromEntries(usuarios.map(u => [u.nome, Math.floor(Math.random() * 100) + 1]))
  );

  function handleDesconectar() {
    router.replace("/");
  }

  function handleCheckbox(usuario) {
    setSelecionados((prev) =>
      prev.includes(usuario)
        ? prev.filter((u) => u !== usuario)
        : [...prev, usuario]
    );
  }

  function handlePapelChange(novoPapel) {
    setPapel(novoPapel);
    setUsuarios(prev =>
      prev.map(u =>
        u.nome === nome ? { ...u, papel: novoPapel } : u
      )
    );
  }

  const narradores = usuarios.filter(u => u.papel === "narrador");
  const jogadores = usuarios.filter(u => u.papel === "jogador");

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
      {/* Div para o restante das informações */}
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
          }}
        >
          {nome}
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

        <div>
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: "#b3b3cc",
            }}
          >
            Selecione seu papel:
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
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
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
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

      {/* Lista de usuários em divisória separada */}
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
