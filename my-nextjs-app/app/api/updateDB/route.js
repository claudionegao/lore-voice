// app/api/updateDB/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const channelName = "LoreVoice";
const auth = process.env.NEXT_PUBLIC_AGORA_API_AUTH;

export async function POST(req) {
  try {
    const body = await req.json();
    const { nome } = body; // Apenas o nome do usuário atual

    if (!nome) {
      return NextResponse.json({ error: 'nome is required' }, { status: 400 });
    }

    // Função que busca usuários conectados na API do Agora
    async function fetchAgoraUsers() {
      const res = await fetch(`https://api.agora.io/dev/v1/channel/user/${appId}/${channelName}`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      const data = await res.json();
      return (data.data?.users || []);
    }

    // Busca inicial
    let connectedUids = await fetchAgoraUsers();

    // Função para buscar dados detalhados dos usuários
    async function fetchUserData(uids) {
      const usuariosData = [];
      for (const uid of uids) {
        const res = await fetch(`https://api.agora.io/dev/v1/channel/user/property/${appId}/${uid}/${channelName}`, {
          headers: { Authorization: `Basic ${auth}` }
        });
        const uData = await res.json();
        if (uData.data) {
          usuariosData.push({
            uid,
            account: uData.data.account || `User-${uid}`,
            platform: uData.data.platform,
            role: uData.data.role,
            join: uData.data.join,
            in_channel: uData.data.in_channel
          });
        }
      }
      return usuariosData;
    }

    let usuariosData = await fetchUserData(connectedUids);

    // Se o usuário atual não estiver na lista, refaz a requisição
    let userFound = usuariosData.some(u => u.account === nome);

    // Refaz a requisição enquanto a lista estiver vazia ou o usuário não for encontrado
    while (!userFound || usuariosData.length === 0) {
        connectedUids = await fetchAgoraUsers();
        usuariosData = await fetchUserData(connectedUids);
        userFound = usuariosData.some(u => u.account === nome);
    }

    // Buscar usuários atuais no DB
    const dbUsers = await prisma.user.findMany();
    const dbIds = dbUsers.map(u => u.agoraId);

    // Usuários para adicionar
    const toAdd = usuariosData.filter(u => !dbIds.includes(u.uid?.toString()));
    for (const u of toAdd) {
      await prisma.user.create({
        data: {
          nome: u.account,
          skill: 'narrador', // todos iniciam como narrador
          agoraId: u.uid?.toString() || null
        }
      });
    }

    // Usuários para remover (não estão conectados)
    const connectedIds = usuariosData.map(u => u.uid?.toString()).filter(Boolean);
    const toRemove = dbUsers.filter(u => !connectedIds.includes(u.agoraId));
    for (const u of toRemove) {
      await prisma.user.delete({ where: { id: u.id } });
    }

    return NextResponse.json({
      message: 'DB synced successfully',
      added: toAdd.map(u => u.account),
      removed: toRemove.map(u => u.nome)
    });

  } catch (error) {
    return NextResponse.json({ error: error.message, details: error.stack }, { status: 500 });
  }
}
