"use client";
import { useState, useEffect } from "react";
import messeger from "../../lib/messagelib";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS; // defina no .env.local

  useEffect(() => {
    // escuta solicitações de acesso
    messeger.mListener("admin");
  }, []);

  function handleLogin() {
    if (password === correctPassword) {
      setAuthorized(true);
      messeger.sMessage("access", {
        name: "Administrador",
        approved: true,
        timestamp: Date.now(),
        message: "Acesso permitido",
      });
    } else {
      alert("Senha incorreta");
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {/* Conteúdo da página */}
      <div className={`${authorized ? "opacity-100" : "opacity-20 blur-sm"} transition-all duration-500`}>
        <h1 className="text-3xl font-bold p-6">Painel Administrativo</h1>
        {/* funções aqui */}
      </div>

      {/* Overlay de bloqueio */}
      {!authorized && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
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
