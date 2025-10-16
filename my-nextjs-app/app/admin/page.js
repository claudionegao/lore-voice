"use client";
import { useState, useEffect } from "react";
import messeger from "../../lib/messagelib";
import "./style.css";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // Login do administrador
  function handleLogin() {
    if (password === correctPassword) {
      setAuthorized(true);

      // Listener real
      messeger.mListener("admin", (msg) => {
        setRequests((prev) => {
          // Ignora duplicatas
          if (prev.some(r => r.name === msg.name)) return prev;
          return [...prev, msg];
        });
      });

      // Buscar lista de usuários ao entrar
      fetchUsers();
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

  // Busca usuários conectados no endpoint da API do site
  async function fetchUsers() {
    try {
      const res = await fetch("/api/getUsers");
      const data = await res.json();
      setUsers(data.users || []);
      console.log(data.users)
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  }

  // Disconnect de um usuário específico
  async function handleDisconnect(uid) {
    try {
      await messeger.sMessage("disconnect", { id: uid, timestamp: Date.now() });
      // Atualiza lista após desconectar
      fetchUsers();
    } catch (err) {
      console.error("Erro ao desconectar usuário:", err);
    }
  }

  return (
    <div className="admin-page">
      {/* Conteúdo principal */}
      <div className={authorized ? "content-visible" : "content-hidden"}>
        <div className="admin-header">
          <h1>Painel Administrativo</h1>
          <p>
            {authorized
              ? "Bem-vindo, Administrador!"
              : "Acesso restrito até a verificação."}
          </p>
        </div>
      </div>

      {/* Overlay de login */}
      {!authorized && (
        <div className="login-overlay">
          <div className="login-box">
            <h2>Digite a senha de acesso</h2>
            <input
              type="password"
              placeholder="Senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Entrar</button>
          </div>
        </div>
      )}

      {/* Menu de solicitações */}
      {authorized && requests.length > 0 && (
        <div className="requests-menu">
          <h3>Solicitações de Acesso</h3>
          {requests.map((req, idx) => (
            <div key={idx} className="request-item">
              <span>{req.name}</span>
              <div className="request-buttons">
                <button className="approve" onClick={() => handleApprove(req)}>Approve</button>
                <button className="deny" onClick={() => handleDeny(req)}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de usuários conectados */}
      {authorized && (
        <div className="users-menu">
          <h3>Usuários Conectados</h3>
          <button onClick={fetchUsers} className="refresh-button">Refresh</button>
          {users.length === 0 ? (
            <p>Nenhum usuário conectado no momento.</p>
          ) : (
            users.map((user, idx) => (
              <div key={idx} className="user-item">
                <span>{`${user.account.split("@")[0]} | ${user.uid}`}</span>
                <button className="disconnect" onClick={() => handleDisconnect(user.uid)}>Disconnect</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
