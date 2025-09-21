
"use client";
import { useEffect, useRef, useState } from "react";
import { VoiceClient, VoiceStatus } from "./voice";

const WS_URL = typeof window !== "undefined"
  ? `ws://${window.location.hostname}:3001`
  : "ws://localhost:3001";

export default function Home() {
  const [status, setStatus] = useState<VoiceStatus>("disconnected");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const clientRef = useRef<VoiceClient | null>(null);

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const client = new VoiceClient(WS_URL);
      client.onStatusChange = (s) => {
        setStatus(s);
        setConnected(s === "connected");
        setConnecting(s === "connecting");
      };
      client.onRemoteStream = (stream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
        }
      };
      clientRef.current = client;
      await client.connect();
    } catch (e) {
      setError("Erro ao conectar: " + (e as Error).message);
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clientRef.current?.disconnect();
    setConnected(false);
    setStatus("disconnected");
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-center">Chat de Voz</h1>
        <div className="flex flex-col items-center gap-2">
          <button
            className={`w-40 h-12 rounded-full font-semibold text-lg transition-colors ${connected ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"} ${connecting ? "opacity-60 cursor-not-allowed" : ""}`}
            onClick={connected ? handleDisconnect : handleConnect}
            disabled={connecting}
          >
            {connected ? "Desconectar" : connecting ? "Conectando..." : "Connect"}
          </button>
          <span className={`mt-2 text-sm font-medium ${connected ? "text-green-600" : "text-gray-500"}`}>
            {connected ? "Conectado" : connecting ? "Conectando..." : "Desconectado"}
          </span>
          {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
        <audio ref={remoteAudioRef} autoPlay playsInline className="w-full mt-4" />
        <p className="text-xs text-gray-400 text-center">Todos que clicarem em Connect vão se ouvir em tempo real.</p>
      </div>
    </div>
  );
}
