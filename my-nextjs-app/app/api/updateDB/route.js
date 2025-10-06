// app/api/updateDB/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const channelName = "LoreVoice";
const auth = process.env.NEXT_PUBLIC_AGORA_API_AUTH;

export async function POST(req) {
  try {
    const body = await req.json();
    const { nome, makeHost = false } = body;

    if (!nome) {
      return NextResponse.json({ error: 'nome is required' }, { status: 400 });
    }

    // Função que busca usuários conectados na API do Agora
    async function fetchAgoraUsers() {
      const res = await fetch(
        `https://api.agora.io/dev/v1/channel/user/${appId}/${channelName}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const data = await res.json();
      return data.data?.users || [];
    }

    const connectedUids = await fetchAgoraUsers();

    // Se não houver usuários, sala não existe
    if (connectedUids.length === 0) {
      return NextResponse.json({ message: 'Sala não existe' }, { status: 200 });
    }

    // Função para buscar dados detalhados dos usuários
    async function fetchUserData(uids) {
      const usuariosData = [];
      for (const uid of uids) {
        const res = await fetch(
          `https://api.agora.io/dev/v1/channel/user/property/${appId}/${uid}/${channelName}`,
          { headers: { Authorization: `Basic ${auth}` } }
        );
        const uData = await res.json();
        if (uData.data) {
          usuariosData.push({
            uid,
            account: uData.data.account || `User-${uid}`,
            platform: uData.data.platform,
            role: uData.data.role,
            join: uData.data.join,
            in_channel: uData.data.in_channel,
          });
        }
      }
      return usuariosData;
    }

    let usuariosData = await fetchUserData(connectedUids);

    // Se só houver 1 usuário, ele vira host automaticamente
    if (usuariosData.length === 1 && usuariosData[0].account === nome) {
      await prisma.user.upsert({
        where: { agoraId: usuariosData[0].uid?.toString() },
        update: { host: true, skill: 'narrador' },
        create: {
          nome,
          host: true,
          skill: 'narrador',
          agoraId: usuariosData[0].uid?.toString(),
        },
      });
      return NextResponse.json({
        message: 'Você é o host e foi adicionado ao DB',
        host: true,
      });
    }

    // Verifica se o usuário pediu para se tornar host
    if (makeHost) {
      // Remove host atual, se existir
      await prisma.user.updateMany({
        where: { host: true },
        data: { host: false },
      });

      // Atualiza ou cria o novo host
      await prisma.user.upsert({
        where: { nome },
        update: { host: true },
        create: { nome, host: true, skill: 'narrador', agoraId: null },
      });

      return NextResponse.json({
        message: `${nome} agora é o host da sala`,
        host: true,
      });
    }

    // Se houver mais de 1 usuário, verificar se o usuário atual é host
    const dbUsers = await prisma.user.findMany();
    const userAtual = dbUsers.find((u) => u.nome === nome);

    if (!userAtual?.host) {
      return NextResponse.json({ error: 'Você não é o host da sala' }, { status: 403 });
    }

    // Sincronização do DB (adicionar/remover usuários)
    const dbIds = dbUsers.map((u) => u.agoraId);
    const toAdd = usuariosData.filter((u) => !dbIds.includes(u.uid?.toString()));
    for (const u of toAdd) {
      await prisma.user.create({
        data: {
          nome: u.account,
          skill: 'narrador',
          host: false,
          agoraId: u.uid?.toString() || null,
        },
      });
    }

    const connectedIds = usuariosData
      .map((u) => u.uid?.toString())
      .filter(Boolean);
    const toRemove = dbUsers.filter((u) => !connectedIds.includes(u.agoraId));
    for (const u of toRemove) {
      await prisma.user.delete({ where: { id: u.id } });
    }

    return NextResponse.json({
      message: 'DB synced successfully',
      added: toAdd.map((u) => u.account),
      removed: toRemove.map((u) => u.nome),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}
