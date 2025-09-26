'use client';

import { useUser } from "../context/UserContext";
import { useState } from "react";
import { entradaUsuario } from "../methods/connect";

export default function Formulario() {
  const { setNome, setTipo } = useUser();

  const [inputNome, setInputNome] = useState("");
  const [inputTipo, setInputTipo] = useState("Jogador"); // 👈 valor inicial

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNome(inputNome);
    setTipo(inputTipo);
    entradaUsuario(inputNome, inputTipo);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <h1>Lore Voice</h1>

      <input
        type="text"
        placeholder="Digite seu nome"
        value={inputNome}
        onChange={(e) => setInputNome(e.target.value)}
        className="border px-2 py-1 rounded"
      />

      <div className="flex flex-col items-start gap-2">
        <label className="font-semibold">Tipo de usuário:</label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tipo"
            value="Narrador"
            checked={inputTipo === "Narrador"}
            onChange={(e) => setInputTipo(e.target.value)}
          />
          Narrador
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tipo"
            value="Jogador"
            checked={inputTipo === "Jogador"}
            onChange={(e) => setInputTipo(e.target.value)}
          />
          Jogador
        </label>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Conectar
      </button>
    </form>
  );
}
