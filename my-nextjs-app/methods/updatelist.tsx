//my-nextjs-app/methods/updatelist.tsx
import { listarUsuariosConectados, getuserinfo } from './userlist';

export default async function atualizarListaUsuarios() {
  try {
    const usuarios = (await listarUsuariosConectados()).data.broadcasters;
    //com a variavel usuarios temos uma array com o uid dos usuarios conectados percorrer ela e usar getuserinfo para criar uma array de objetos com as informaçoes dos usuarios usar foreach
    const listaAtualizada = [];
    for (const usuario of usuarios) {
      const info = await getuserinfo(usuario);
      listaAtualizada.push(info);
    }
    return listaAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar a lista de usuários:', error);
    throw error;
  }
}   