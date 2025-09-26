// my-nextjs-app/pages/api/token.js
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export default function handler(req, res) {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: 'UID é obrigatório' });
  }

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const channelName = 'LoreVoice'; // mesmo nome usado no join
  const role = RtcRole.PUBLISHER; // ou SUBSCRIBER, dependendo do tipo
  const expireTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expireTimeInSeconds;


  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTs
  );

  return res.status(200).json({ token });
}

