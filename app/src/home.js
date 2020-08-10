import React, { useState, useEffect, useCallback } from 'react';
import s from './home.module.css';

import Header from './components/Header';
import DebugMenu from './components/DebugMenu';
import MicrophoneIcon from './components/MicrophoneIcon';

import getMicAudioStream from './audio-utils/getMicAudioStream';
import streamAudioToWebSocket from './audio-utils/streamAudioToWebsocket';
import useComprehension from './useComprehension';
import TranscriptPane from './components/TranscriptPane';
import SampleSelector from './components/SampleSelector';
import AnalysisPane from './components/AnalysisPane';
import ExportPane from './components/ExportPane';
import { useAppContext } from "./libs/contextLib";

import { STAGE_HOME, STAGE_TRANSCRIBED, STAGE_TRANSCRIBING, STAGE_SUMMARIZE, STAGE_EXPORT } from './consts';

import sampleAudio from './sampleAudio';
import getCredentials from './audio-utils/getTranscribeCredentials';

import { API, Storage, Auth } from "aws-amplify";
import { generate } from "short-uuid";

async function getTranscribeCreds() {
  const result = await getCredentials();
  return result;
}
// React hook to take an audio file and return a mediastream of its audio
// The magic value of 0 for `sample` is used to trigger a microphone capture stream
// stopCallback is called when a recorded audio sample finishes
function useAudioStream(sample, stopCallback) {
  const [ audioStream, setAudioStream ] = useState(null);

  useEffect(() => {
    if (sample) {
      sample.currentTime = 0;
      sample.play()
        .then(() => {
          const stream = sample.captureStream();
          if (sample.__boost) stream.__boost = sample.__boost;
          if (sample.__responses) stream.__responses = sample.__responses;
          setAudioStream(stream);
        });

      function onEnd() {
        stopCallback()
      }

      sample.addEventListener('ended', onEnd);

      return () => {
        sample.pause();
        sample.removeEventListener('ended', onEnd);
      };
    }

    if (sample === 0) {
      let micStream;
      getMicAudioStream().then(stream => {
        micStream = stream;
        setAudioStream(stream);
      });

      return () => {
        if (micStream) micStream.getTracks().forEach(t => t.stop());
      }
    }

    if (sample === null) {
      setAudioStream(null);
    }
  }, [sample, stopCallback]);

  return audioStream;
}


// Helper function to replay a previously-recorded version of data
// sent back from transcribe. `data` is the recorded json including
// timestamps and responses, and `responder` is the callback function
// to use when returning data
function createStreamFromRecordedResponses(data, responder) {
  const start = performance.now();
  let i = 0;
  let stopped;

// Useful flag for debugging, sends all the data immediately
// so you don't have to wait for everything to come through
const FAST = false;

  if (FAST) {
    setTimeout(() => {
      data.forEach(d => {
        responder(d.data);
      });
    });
    return { stop() {} };
  }

  // Run in a rAF loop rather than doing a bunch of setTimeout,
  // since it makes cleaning up easier
  (function frame() {
    if (!stopped) requestAnimationFrame(frame);
    const dt = performance.now() - start;

    while(i < data.length && data[i].t <= dt) {
      responder(data[i].data);
      i++;
    }
  })();


  return {
    stop: () => {
      stopped = true;
    }
  }
}



export default function Home() {
  const [ offlineEnabled, setOfflineEnabled ] = useState(false);

  useEffect(() => {
    useComprehension.__offline = offlineEnabled;
  }, [ offlineEnabled ]);

  const [ activeSample, setActiveSample ] = useState(null);

  const [ showAnalysis, setShowAnalysis ] = useState(false);
  const [ showExport, setShowExport ] = useState(false);

  const playSample = useCallback(sample => {
    setActiveSample(sample);
  }, []);

  const stop = useCallback(() => {
    setActiveSample(null);
  }, []);

  const delayedStop = useCallback(() => {
    if (activeSample) activeSample.pause()
    setTimeout(stop, 5000);
  }, [activeSample, stop]);
  const audioStream = useAudioStream(activeSample, delayedStop);


  const [ partialTranscript, setPartialTranscript ] = useState(' ');
  const [ transcripts, setTranscripts ] = useState(false);
  const [ excludedItems, setExcludedItems ] = useState([]);
  const [ transcribeCredential, setTranscribeCredential] = useState(null);

  const [ patientId, setPatientId ] = useState('');
  const [ healthCareProfessionalId, setHealthCareProfessionId ] = useState('');
  const [ timeStampStart, setTimeStampStart ] = useState(0);
  const [ timeStampEnd, setTimeStampEnd ] = useState(0);

  const addTranscriptChunk = useCallback(({ Alternatives, IsPartial, StartTime }) => {
    const text = Alternatives[0].Transcript;
    if (IsPartial) {
      setPartialTranscript(text);
    } else {
      setPartialTranscript(null);
      setTranscripts(t => [ ...t, { text, time: StartTime } ]);
    }
  }, []);

  useEffect(() => {
    if (!audioStream) return;

    let stopped;

    setTranscripts([]);
    setPartialTranscript('');

    let streamer;

    if (audioStream.__responses && offlineEnabled) {
      streamer = createStreamFromRecordedResponses(
        audioStream.__responses,
        transcript => {
          if (stopped) return;
          addTranscriptChunk(transcript)
        }
      );
    } else {
      // This logic is for recording the response from a websocket so it can be
      // stored for offline mode. window.__transcription_responses is used in DebugMenu
      const responses = window.__transcription_responses = [];
      const start = performance.now();
      function recordData(frame) {
        responses.push({
          t: performance.now() - start,
          data: frame
        });
      }
      const res = getTranscribeCreds().then (
        result =>{
          setTranscribeCredential(result);
          streamer = streamAudioToWebSocket(
            audioStream,
            transcript => {
              if (stopped) return;
              recordData(transcript);
              addTranscriptChunk(transcript);
            },
            err => {
              console.log('ERROR', err);
            },
            result
          );
      });
    }

    return () => {
      stopped = true;
      streamer.stop();
    }
  }, [addTranscriptChunk, audioStream, offlineEnabled]);

  const enableAnanlysis = useCallback(() => {
    setShowAnalysis(true);
  }, []);
  const disableAnalysis = useCallback(() => {
    setShowAnalysis(false);
  }, []);

  const comprehendResults = useComprehension(transcripts || [], transcribeCredential);

  const reset = useCallback(() => {
    setTranscripts(false);
    setPartialTranscript('');
    setActiveSample(null);
    setShowAnalysis(false);
    setShowExport(false);
    setExcludedItems([]);
  }, []);

  const toggleResultItemVisibility = useCallback(id => {
    setExcludedItems(arr => {
      if (arr.includes(id)) {
        return arr.filter(x => x !== id);
      }

      return [ ...arr, id ];
    });
  }, [ ])

  const handleSave = (e) => {
    e.preventDefault()
    saveSession()
  }

  async function createSession(data) {
    const apiName = 'MTADemoAPI';
    const path = 'createSession';
    const myInit = { 
    //   headers: { 
    //     Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
    //   },
      response: true,
      queryStringParameters: data
    };

    const result =  await API.post(apiName, path, myInit); 

    return result;
  }

  const saveSession = () => {
    const sessionId = generate();
    Storage.configure({
      bucket: process.env.REACT_APP_StorageS3BucketName,
      level: 'public',
      region: process.env.REACT_APP_region,
    });
    const transcribeAddress = `transrcibe-medical-output/${sessionId}/${sessionId}-session-transcribe.txt`
    const comprehendAddress = `comprehend-medical-output/${sessionId}/${sessionId}-session-comprehend.txt`

    var dict = {
      'Session':{
        'sessionId':sessionId,
        'patientId':patientId,
        'healthCareProfessionalId':healthCareProfessionalId,
        'timeStampStart':timeStampStart,
        'timeStampEnd':timeStampEnd
      },
      'Medication':[],
      'RxNorm':[],
      'MedicationRxNorm':[],
      'MedicalCondition':[],
      'ICD10CMConcept':[],
      'MedicalConditionICD10CMConcept':[],
      'TestTreatmentProcedures':[]
    }

    var transcripts_texts = "";
    transcripts.forEach((item) => { transcripts_texts += item.text + " "});
    Storage.put(transcribeAddress, transcripts_texts);

    const allResults = [].concat(...comprehendResults);
    const filteredResultsM =  allResults.filter(r => r.Category === 'MEDICATION');
    filteredResultsM.map((r,i) => {
      const medicationId = 'm'+sessionId+i
      dict.Medication.push({'medicationId': medicationId, 'sessiondId': sessionId, 'medicationText': r.Text, 'medicationType': r.Type})
      if(r.RxNormConcepts)
        (r.RxNormConcepts).forEach((r2,i2) => {
          dict.RxNorm.push({'code':r2.Code, 'description':r2.Description})
          dict.MedicationRxNorm.push({'medicationId':medicationId, 'code':r2.Code})
        })
    });

    const filteredResultsMC =  allResults.filter(r => r.Category === 'MEDICAL_CONDITION');   
    filteredResultsMC.map((r,i) => {
      const medicalConditionId = 'mc'+sessionId+i
      dict.MedicalCondition.push({'medicalConditionId':medicalConditionId, 'sessionId':sessionId, 'medicalConditionText':r.Text})
      if(r.ICD10CMConcepts)
        (r.ICD10CMConcepts).forEach((r2,i2) => {
          dict.ICD10CMConcept.push({'code':r2.Code, 'description':r2.Description})
          dict.MedicalConditionICD10CMConcept.push({'medicalConditionId':medicalConditionId, 'code':r2.Code})
        })
    });
    
    const filteredResultsTTP =  allResults.filter(r => r.Category === 
      'TEST_TREATMENT_PROCEDURE');
    filteredResultsTTP.map((r,i) => {
      const testTreatmentProcedureId = 't'+sessionId+i
      dict.TestTreatmentProcedures.push({'testTreatmentProcedureId':testTreatmentProcedureId, 'testTreatmentProcedureText':r.Text, 'testTreatmentProcedureType':r.Type})
    });
    Storage.put(comprehendAddress, JSON.stringify(dict));


    
    const data = {
      'PatientId': 'p-1',
      'HealthCareProfessionalId': 'h-1',
      'SessionName': 'session2',
      'SessionId': sessionId,
      'TimeStampStart': 1,
      'TimeStampEnd': 1,
      'TranscribeS3Path': transcribeAddress,
      'ComprehendS3Path': comprehendAddress,
    }
    Storage.configure({
      bucket: process.env.REACT_APP_REACT_APP_WebAppBucketName,
      level: 'public',
      region: process.env.REACT_APP_region,
    });
    // createSession(data);
    return sessionId;
  }

  let stage;

  if (!transcripts) {
    stage = STAGE_HOME;
  } else if(audioStream && !showAnalysis) {
    stage = STAGE_TRANSCRIBING;
  } else if (!showAnalysis) {
    stage = STAGE_TRANSCRIBED;
  } else if (!showExport) {
    stage = STAGE_SUMMARIZE;
  } else {
    stage = STAGE_EXPORT;
  }

  return (
    <div className={s.base}>
      <Header
        stage={stage}
        onHome={reset}
        onAnalyze={enableAnanlysis}
        onHideAnalysis={disableAnalysis}
        onShowExport={() => setShowExport(true)}
        onHideExport={() => setShowExport(false)}
        onReset={reset}
      />

      <DebugMenu
        offlineEnabled={offlineEnabled}
        onSetOffline={setOfflineEnabled}
      />


      <div className={s.rest}>
        <SampleSelector
          samples={sampleAudio}
          activeSample={activeSample}
          onSelect={playSample}
          onStop={delayedStop}
          hidden={!!transcripts}
        />

        <MicrophoneIcon
          stream={audioStream}
          big={!transcripts}
          visible={!transcripts || audioStream}
          onStop={delayedStop}
        />

        <TranscriptPane
          transcriptChunks={transcripts}
          resultChunks={comprehendResults}
          partialTranscript={partialTranscript}
          inProgress={audioStream}
        />

        <AnalysisPane
          resultChunks={comprehendResults}
          excludedItems={excludedItems}
          onToggleItem={toggleResultItemVisibility}
          visible={stage === STAGE_SUMMARIZE || stage === STAGE_EXPORT}
        />

        <ExportPane
          transcriptChunks={transcripts}
          resultChunks={comprehendResults}
          excludedItems={excludedItems}
          visible={stage === STAGE_EXPORT}
        />
 
      </div>
      
    <button onClick={handleSave}>Save Session</button>
    </div>
  );
}
