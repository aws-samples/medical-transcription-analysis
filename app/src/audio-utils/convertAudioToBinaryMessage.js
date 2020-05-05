import downsampleBuffer from './downsampleBuffer';
import pcmEncode from './pcmEncode';
import eventStreamMarshaller from './eventStreamMarshaller';
import getAudioEventMessage from './getAudioeventMessage';

export default function convertAudioToBinaryMessage(raw) {
    if (raw == null)
        return;

    // downsample and convert the raw audio bytes to PCM
    let downsampledBuffer = downsampleBuffer(raw);
    let pcmEncodedBuffer = pcmEncode(downsampledBuffer);

    // add the right JSON headers and structure to the message
    let audioEventMessage = getAudioEventMessage(Buffer.from(pcmEncodedBuffer));

    //convert the JSON object + headers into a binary event stream message
    let binary = eventStreamMarshaller.marshall(audioEventMessage);

    return binary;
}
