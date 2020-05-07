import { createPresignedURL } from '../utils/sigv4';

// const crypto = require('crypto');
const querystring = require('querystring');

export default function createWebsocketUrl(credential) {
    let endpoint = `transcribestreaming.${credential.region}.amazonaws.com:8443`;
    console.log(credential.accessKeyId);

    // get a preauthenticated URL that we can use to establish our WebSocket
    return createPresignedURL(
        'GET',
        endpoint,
        '/medical-stream-transcription-websocket',
        'transcribe',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // crypto.createHash('sha256').update('', 'utf8').digest('hex'),
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
