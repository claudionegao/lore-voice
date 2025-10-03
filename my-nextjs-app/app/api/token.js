import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { channelName, uid } = await req.json();

    if (!channelName) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 });
    }

    // Variáveis de ambiente
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ error: "Missing Agora credentials" }, { status: 500 });
    }

    // Tempo de expiração (em segundos) → 1 hora
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTimestamp + expirationTimeInSeconds;

    // Se não mandar UID, usamos 0 (Agora gera automático)
    const agoraUid = uid ?? 0;

    // Gerar token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      agoraUid,
      RtcRole.PUBLISHER,
      privilegeExpireTs
    );

    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}