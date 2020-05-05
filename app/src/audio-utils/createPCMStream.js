// This function is essentially the guts of the microphone-stream npm package,
// with a few steps of ArrayBuffer -> Float32Array -> ArrayBuffer -> Float32Array conversion removed

export default function createPCMStream(mediaStream, onClose) {
  const ctx = new AudioContext();
  const recorder = ctx.createScriptProcessor(null, 1, 1);
  recorder.connect(ctx.destination);

  const input = ctx.createMediaStreamSource(mediaStream);

  // If we've been told to boost the value, hook up a gain node,
  // otherwise just pipe it straight through to the script processor
  if (mediaStream.__boost) {
    const gain = ctx.createGain();
    gain.gain.value = mediaStream.__boost;
    input.connect(gain);
    gain.connect(recorder);
  } else {
    input.connect(recorder);
  }

  let recording = true, dataCallback, dataQueue = [];

  recorder.onaudioprocess = e => {
    if (recording) {
      const data = e.inputBuffer.getChannelData(0);
      if (dataCallback) {
        dataCallback(data);
      } else {
        dataQueue.push(data)
      }
    }
  }

  return {
    onData: (fn) => {
      dataCallback = fn;
      dataQueue.forEach(x => fn(x));
    },
    stop: () => {
      if (ctx.state === 'closed') return;

      mediaStream.getAudioTracks().forEach(t => t.stop());

      recorder.disconnect();
      input.disconnect();
      ctx.close();
      recording = false;
      onClose();
    }
  }
}
