import { Message } from '@aws-sdk/eventstream-marshaller';

const getAudioEventMessage = (buffer: Buffer): Message => ({
  headers: {
    ':message-type': {
      type: 'string',
      value: 'event',
    },
    ':event-type': {
      type: 'string',
      value: 'AudioEvent',
    },
  },
  body: buffer,
});

export default getAudioEventMessage;
