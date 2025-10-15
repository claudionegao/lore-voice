"use client";
import { useState } from "react";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS;

  function handleLogin() {
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Senha incorreta!");
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Conteúdo principal */}
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

      {/* Overlay + janela flutuante */}
      {!authorized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="relative bg-[#1e1e2f]/95 border border-gray-700 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] w-[350px] p-6 flex flex-col items-center animate-fadeIn">
            {/* Barra de título */}
            <div className="absolute top-0 left-0 w-full bg-gray-700/80 rounded-t-2xl h-8 flex items-center justify-between px-3">
              <span className="text-sm text-gray-200 font-medium">
                🔒 Autenticação Administrativa
              </span>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
            </div>

            {/* Corpo da janela */}
            <div className="mt-10 text-center w-full">
              <h2 className="text-lg mb-4 font-semibold text-gray-100">
                Digite a senha de acesso
              </h2>
              <input
                type="password"
                className="w-full p-2 mb-4 rounded bg-gray-800 text-white text-center outline-none border border-gray-600 focus:border-green-500 transition"
                placeholder="Senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 hover:bg-green-700 transition p-2 rounded-lg font-semibold shadow-md"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
