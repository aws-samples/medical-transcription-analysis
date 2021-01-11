import convertAudioToBinaryMessage from './convertAudioToBinaryMessage'; // collect microphone input as a stream of raw bytes

import eventStreamMarshaller from './eventStreamMarshaller';
import createWebsocketUrl from './createWebsocketUrl';
import createPCMStream from './createPCMStream';

export default function streamAudioToWebSocket(userMediaStream, onChunk, onError, clientParams) {

  let stopped;

  // A bit of debouncing on closing the websocket - wait until we've had at least 5 seconds without
  // receiving a message before closing it off completely
  let closeTimeout;
  function delayedStop() {
    stopped = true;
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      websocket.close();
    }, 5000);
  }

  const pcmStream = createPCMStream(userMediaStream, () => {
    delayedStop();
  });

  // Pre-signed URLs are a way to authenticate a request (or WebSocket connection, in this case)
  // via Query Parameters. Learn more: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
  
  let url = createWebsocketUrl(clientParams);

  let socketError, transcribeException;

    let websocket = new WebSocket(url);
    websocket.binaryType = "arraybuffer";

    let manuallyStopped;

    // Stop function we expose for manually closing the transcription
    // This will be called when the audio file ends or the microphone stream
    // is stopped, so give it a whort while before cutting off the PCM stream
    function stop() {
      manuallyStopped = true;
      setTimeout(() => {
        pcmStream.stop();
      }, 1000);
    }

    // when we get audio data from the mic, send it to the WebSocket if possible
    websocket.onopen = function () {
      pcmStream.onData(audio => {
        // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
        let binary = convertAudioToBinaryMessage(audio);

        if (websocket.readyState === websocket.OPEN)
          websocket.send(binary);
      })
    };

    // handle messages, errors, and close events
    // handle inbound messages from Amazon Transcribe
    websocket.onmessage = function (message) {
      //convert the binary event stream message to JSON
      let messageWrapper = eventStreamMarshaller.unmarshall(Buffer(message.data));
      let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));
      if (messageWrapper.headers[":message-type"].value === "event") {
        let results = messageBody.Transcript.Results;

        if (results.length > 0) {
          onChunk(results[0]);
        }
      }
      else {
        transcribeException = true;
        onError(messageBody.Message);
        // toggleStartStop();
      }

      if (stopped) {
        delayedStop();
      }
    };

    websocket.onerror = function () {
      socketError = true;
      console.log("Websocket connection error");
      onError('WebSocket connection error. Try again.');
      // toggleStartStop();
    };

    window.ws = websocket

    websocket.onclose = function (closeEvent) {
      if (manuallyStopped) return;
      // micStream.stop();

      // the close event immediately follows the error event; only handle one.
      if (!socketError && !transcribeException) {
        if (closeEvent.code !== 1000) {
          onError('</i><strong>Streaming Exception</strong><br>' + closeEvent.reason);
        }
      }
    };
  return { stop }
}
