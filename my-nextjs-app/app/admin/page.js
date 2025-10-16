"use client";
import { useState, useEffect } from "react";
import messeger from "../../lib/messagelib";
import "./style.css";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // Login do administrador
  function handleLogin() {
    if (password === correctPassword) {
      setAuthorized(true);

      // Listener de solicitações
      messeger.mListener("admin", (msg) => {
        setRequests(prev => {
          if (prev.some(r => r.name === msg.name)) return prev;
          return [...prev, msg];
        });
      });

      // Listener de usuários conectados
      messeger.mListener("connected-users", (msg) => {
        setConnectedUsers(msg.users || []);
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
    setRequests(prev => prev.filter(r => r !== req));
  }

  // Remove solicitação sem desconectar
  function handleDeny(req) {
    setRequests(prev => prev.filter(r => r !== req));
  }

  // Desconecta usuário conectado
  function handleDisconnect(user) {
    messeger.sMessage("deny", {
      id: user.id,        // id do usuário conectado
      timestamp: Date.now(),
    });
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
      {authorized && (
        <div className="requests-menu">
          <h3>Solicitações de Acesso</h3>
          {requests.length === 0 ? (
            <p>Nenhuma solicitação no momento.</p>
          ) : (
            requests.map((req, idx) => (
              <div key={idx} className="request-item">
                <span>{req.name}</span>
                <div className="request-buttons">
                  <button className="approve" onClick={() => handleApprove(req)}>Approve</button>
                  <button className="deny" onClick={() => handleDeny(req)}>Deny</button>
                </div>
              </div>
            ))
          )}

          {/* Usuários conectados */}
          <h3 style={{ marginTop: 20 }}>Usuários Conectados</h3>
          {connectedUsers.length === 0 ? (
            <p>Nenhum usuário conectado.</p>
          ) : (
            connectedUsers.map((user, idx) => (
              <div key={idx} className="request-item">
                <span>{user.name} ({user.skill})</span>
                <div className="request-buttons">
                  <button className="deny" onClick={() => handleDisconnect(user)}>Disconnect</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
