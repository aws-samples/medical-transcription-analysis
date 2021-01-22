import sample1 from './audio/sample-1.mp4';
import sample2 from './audio/sample-2.mp4';
import sample3 from './audio/sample-3.mp4';
import sample4 from './audio/sample-4.mp4';

import responses1 from './recorded-responses/sample-1.json';
import responses2 from './recorded-responses/sample-2.json';
import responses3 from './recorded-responses/sample-3.json';
import responses4 from './recorded-responses/sample-4.json';

const sampleAudio = {
  sample1: new Audio(sample1),
  sample2: new Audio(sample2),
  sample3: new Audio(sample3),
  sample4: new Audio(sample4),
};

// If the levels in the audio file are quite low then use these to multiply the values up
// This applies correction to both what's sent over the WebSocket and the readout in the microphone thing.
sampleAudio.sample1.__boost = 6;
sampleAudio.sample2.__boost = 6;
sampleAudio.sample3.__boost = 6;
sampleAudio.sample4.__boost = 6;

sampleAudio.sample1.__responses = responses1;
sampleAudio.sample2.__responses = responses2;
sampleAudio.sample3.__responses = responses3;
sampleAudio.sample4.__responses = responses4;

export default sampleAudio;
