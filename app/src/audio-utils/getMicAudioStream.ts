const getMicAudioStream = (): Promise<MediaStream> => navigator.mediaDevices.getUserMedia({ audio: true });

export default getMicAudioStream;
