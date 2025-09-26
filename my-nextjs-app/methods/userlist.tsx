export async function listarUsuariosConectados() {
  const appId = process.env.AGORA_APP_ID!;
  const channelName = 'LoreVoice';
  const customerId = process.env.AGORA_API_KEY!;
  const customerSecret = process.env.AGORA_API_SECRET!;

  const plainCredential = customerId + ":" + customerSecret
    const encodedCredential = Buffer.from(plainCredential).toString('base64')
    const authorizationField = "Basic " + encodedCredential

  const response = await fetch(`https://api.agora.io/dev/v1/channel/user/${appId}/${channelName}`, {
    method: 'GET',
    headers: {
      'Authorization': authorizationField,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erro ao consultar usuários: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data?.users || [];
}
