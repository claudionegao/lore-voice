"use client";
import { useState } from "react";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  // Senha vinda do .env.local (ex: NEXT_PUBLIC_ADMIN_PASS=1234)
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS;

  function handleLogin() {
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Senha incorreta!");
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {/* Conteúdo principal (fica esmaecido enquanto bloqueado) */}
      <div
        className={`transition-all duration-500 ${
          authorized ? "opacity-100 blur-none" : "opacity-20 blur-sm"
        }`}
      >
        <h1 className="text-3xl font-bold p-6 text-center">
          Painel Administrativo
        </h1>
        <p className="text-center text-gray-400">
          {authorized
            ? "Bem-vindo, Administrador!"
            : "Acesso restrito até a verificação."}
        </p>
      </div>

      {/* Overlay com o pedido de senha */}
      {!authorized && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-80 text-center">
            <h2 className="text-xl mb-4 font-semibold">Digite a senha</h2>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white text-center outline-none"
              placeholder="Senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 hover:bg-green-700 transition p-2 rounded-lg font-semibold"
            >
              Entrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
