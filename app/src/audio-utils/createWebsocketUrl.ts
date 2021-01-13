import { createPresignedURL } from '../utils/sigv4';
import { ClientParams } from '../types/ClientParams';
import crypto from 'crypto';
import querystring from 'querystring';

export default function createWebsocketUrl(clientParams: ClientParams): string {
  let endpoint = `transcribestreaming.${clientParams.region}.amazonaws.com:8443`;
  // get a preauthenticated URL that we can use to establish our WebSocket
  return createPresignedURL(
    'GET',
    endpoint,
    '/medical-stream-transcription-websocket',
    'transcribe',
    crypto.createHash('sha256').update('', 'utf8').digest('hex'),
    {
      key: clientParams.accessKeyId,
      secret: clientParams.secretAccessKey,
      sessionToken: clientParams.sessionToken,
      protocol: 'wss',
      expires: 60,
      region: clientParams.region,
      query: querystring.stringify({
        'language-code': 'en-US',
        'media-encoding': 'pcm',
        'sample-rate': 16000,
        specialty: 'PRIMARYCARE',
        type: 'DICTATION',
      }),
    },
  );
}
