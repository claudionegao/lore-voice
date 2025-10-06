// app/api/updateSkill/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { nome, skill } = body;

    if (!nome || !skill) {
      return NextResponse.json({ error: 'nome and skill are required' }, { status: 400 });
    }

    // Busca o usuário pelo nome
    const user = await prisma.user.findFirst({
      where: { nome }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado no DB' }, { status: 404 });
    }

    // Atualiza a skill usando o id do usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { skill }
    });

    return NextResponse.json({ message: 'User skill updated', user: updatedUser });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
