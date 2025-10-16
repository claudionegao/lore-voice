// app/api/getUsers/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const channelName = "LoreVoice"; // canal que quer monitorar
    const agoraAuth = process.env.NEXT_PUBLIC_AGORA_API_AUTH; // Basic Auth pronto

    // 1️⃣ Buscar usuários conectados no canal
    const listResponse = await fetch(
      `https://api.agora.io/dev/v1/channel/user/${appId}/${channelName}`,
      {
        headers: {
          Authorization: `Basic ${agoraAuth}`,
        },
      }
    );

    if (!listResponse.ok) {
      const text = await listResponse.text();
      return NextResponse.json(
        { error: "Erro ao consultar usuários conectados", details: text },
        { status: listResponse.status }
      );
    }

    const listData = await listResponse.json();
    const uids = listData?.data?.users || [];

    if (uids.length === 0) {
      return NextResponse.json({ users: [] }); // sem ninguém conectado
    }

    // 2️⃣ Buscar status detalhado de cada usuário
    const users = await Promise.all(
      uids.map(async (uid) => {
        const propResponse = await fetch(
          `https://api.agora.io/dev/v1/channel/user/property/${appId}/${uid}/${channelName}`,
          {
            headers: {
              Authorization: `Basic ${agoraAuth}`,
            },
          }
        );

        if (!propResponse.ok) {
          const text = await propResponse.text();
          return { uid, error: text };
        }

        const propData = await propResponse.json();
        return { uid, status: propData?.data || {} };
      })
    );

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
