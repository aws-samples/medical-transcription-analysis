import { createPresignedURL } from '../utils/sigv4';

const crypto = require('crypto');
const querystring = require('querystring');

export default function createWebsocketUrl(credential) {
    let endpoint = `transcribestreaming.${credential.region}.amazonaws.com:8443`;
    // get a preauthenticated URL that we can use to establish our WebSocket
    return createPresignedURL(
        'GET',
        endpoint,
        '/medical-stream-transcription-websocket',
        'transcribe',
         crypto.createHash('sha256').update('', 'utf8').digest('hex'),
        {
          'key': credential.accessKeyId,
          'secret': credential.secretAccessKey,
          'sessionToken': credential.sessionToken,
          'protocol': 'wss',
          'expires': 60,
          'region': credential.region,
          'query': querystring.stringify({
            'language-code': 'en-US',
            'media-encoding': 'pcm',
            'sample-rate': 16000,
            specialty: 'PRIMARYCARE',
            type: 'DICTATION'
          })
      }
    );
}
