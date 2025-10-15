"use client";
import { useState } from "react";
import messeger from "../../lib/messagelib";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState([]); // fila de solicitações

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // Login do administrador
  function handleLogin() {
    if (password === correctPassword) {
      setAuthorized(true);

      // inicia listener real usando callback
      const listener = messeger.mListener("admin", (msg) => {
        setRequests((prev) => [...prev, msg]);
      });

    } else {
      alert("Senha incorreta!");
    }
  }

  // Aprova solicitação
  function handleApprove(req) {
    messeger.sMessage("access", {
      name: req.name,
      approved: true,
      timestamp: Date.now(),
      message: "Acesso permitido",
    });
    setRequests((prev) => prev.filter((r) => r !== req));
  }

  // Nega solicitação
  function handleDeny(req) {
    setRequests((prev) => prev.filter((r) => r !== req));
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
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

      {/* Overlay de login */}
      {!authorized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="relative bg-[#1e1e2f]/95 border border-blue-600 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] w-[350px] p-6 flex flex-col items-center">
            <h2 className="text-lg mb-4 font-semibold text-gray-100">
              Digite a senha de acesso
            </h2>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-gray-800 text-white text-center outline-none border border-blue-600 focus:border-green-500 transition"
              placeholder="Senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded-lg font-semibold shadow-md"
            >
              Entrar
            </button>
          </div>
        </div>
      )}

      {/* Menu de solicitações */}
      {authorized && requests.length > 0 && (
        <div className="absolute top-10 right-10 w-80 bg-gray-800/95 border border-blue-600 rounded-xl shadow-lg p-4 z-30">
          <h3 className="text-lg font-semibold mb-2 border-b border-blue-600 pb-2">
            Solicitações de Acesso
          </h3>
          {requests.map((req, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-700/80 rounded-lg p-2 mb-2 border border-blue-600"
            >
              <span className="text-gray-200">{req.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req)}
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm font-semibold"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(req)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm font-semibold"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
