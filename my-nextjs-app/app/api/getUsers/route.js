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

    // 2️⃣ Buscar informações detalhadas de cada usuário
    const infoResponse = await fetch(
      `https://api.agora.io/v1/apps/${appId}/users?userIds=${uids.join(",")}`,
      {
        headers: {
          Authorization: `Basic ${agoraAuth}`,
        },
      }
    );

    if (!infoResponse.ok) {
      const text = await infoResponse.text();
      return NextResponse.json(
        { error: "Erro ao buscar informações dos usuários", details: text },
        { status: infoResponse.status }
      );
    }

    const infoData = await infoResponse.json();

    // 3️⃣ Combinar os dados (uids + info)
    const users = uids.map((uid) => {
      const info =
        infoData?.data?.find?.((u) => u?.userId?.toString() === uid?.toString()) ||
        {};
      return { uid, ...info };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
