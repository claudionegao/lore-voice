// app/api/updateDB/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const AGORA_API_BASE = 'https://api.agora.io/v1/apps';
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AGORA_API_AUTH; // já contém seu token

export async function GET() {
  try {
    if (!APP_ID || !AUTH_TOKEN) {
      return NextResponse.json({ error: 'Missing Agora app ID or auth token' }, { status: 400 });
    }

    // 1 - Buscar lista de usuários conectados no channel "LoreVoice"
    const channelUsersRes = await fetch(`${AGORA_API_BASE}/${APP_ID}/channels/LoreVoice/users`, {
      headers: {
        Authorization: 'Basic ' + AUTH_TOKEN,
      },
    });

    if (!channelUsersRes.ok) {
      const text = await channelUsersRes.text();
      return NextResponse.json({ error: 'Failed to fetch Agora channel users', details: text }, { status: 500 });
    }

    const channelUsersData = await channelUsersRes.json();
    const connectedAgoraIds = channelUsersData.data.map(u => u.uid);

    // 2 - Buscar informações detalhadas de cada usuário via API do Agora
    const detailedUsers = [];
    for (const uid of connectedAgoraIds) {
      const userRes = await fetch(`${AGORA_API_BASE}/${APP_ID}/users/${uid}`, {
        headers: {
          Authorization: 'Basic ' + AUTH_TOKEN,
        },
      });
      if (!userRes.ok) continue;
      const userData = await userRes.json();
      detailedUsers.push(userData.data);
    }

    // 3 - Atualizar o banco de dados com Prisma
    // Buscar usuários já cadastrados
    const existingUsers = await prisma.user.findMany();

    // Adicionar usuários conectados que não estão no banco
    for (const u of detailedUsers) {
      const exists = existingUsers.find(e => e.account === u.account);
      if (!exists) {
        await prisma.user.create({
          data: {
            name: u.name ?? 'Unknown',
            AgoraID: u.uid,
            skill: 'jogador', // default, você pode mudar se quiser
            account: u.account,
          },
        });
      } else {
        // Atualizar AgoraID caso mude
        await prisma.user.update({
          where: { id: exists.id },
          data: { AgoraID: u.uid },
        });
      }
    }

    // Remover usuários que não estão mais conectados
    const connectedAccounts = detailedUsers.map(u => u.account);
    await prisma.user.deleteMany({
      where: {
        account: { notIn: connectedAccounts },
      },
    });

    return NextResponse.json({ success: true, updatedUsers: detailedUsers.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
