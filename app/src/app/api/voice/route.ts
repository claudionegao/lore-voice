import { NextRequest } from "next/server";
import { WebSocketServer } from "ws";

// Armazena conexões ativas
const clients = new Set<WebSocket>();

// Singleton do servidor WebSocket
let wss: WebSocketServer | null = null;

export async function GET(req: NextRequest) {
  if (!wss) {
    // @ts-ignore
    wss = new WebSocketServer({ noServer: true });
    wss.on("connection", (ws: WebSocket) => {
      clients.add(ws);
      ws.on("message", (msg: string) => {
        // Repasse para todos os outros clientes
        for (const client of clients) {
          if (client !== ws && client.readyState === 1) {
            client.send(msg);
          }
        }
      });
      ws.on("close", () => {
        clients.delete(ws);
      });
    });
  }

  // @ts-ignore
  if (req.nextUrl.protocol === "ws:" || req.nextUrl.protocol === "wss:") {
    // @ts-ignore
    const { socket } = req;
    wss.handleUpgrade(req, socket, Buffer.alloc(0), (ws: WebSocket) => {
      wss!.emit("connection", ws, req);
    });
    return new Response(null, { status: 101 });
  }

  return new Response("WebSocket endpoint", { status: 200 });
}
