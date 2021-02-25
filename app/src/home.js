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

import { STAGE_HOME, STAGE_TRANSCRIBED, STAGE_TRANSCRIBING, STAGE_SUMMARIZE, STAGE_EXPORT } from './consts';

import sampleAudio from './sampleAudio';
import getCredentials from './audio-utils/getTranscribeCredentials';

import { API, Storage, Auth } from 'aws-amplify';
import { generate } from 'short-uuid';
import { useHistory } from 'react-router-dom';
import { Form, Button, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

async function getTranscribeCreds() {
  const result = await getCredentials();
  return result;
}
// React hook to take an audio file and return a mediastream of its audio
// The magic value of 0 for `sample` is used to trigger a microphone capture stream
// stopCallback is called when a recorded audio sample finishes
function useAudioStream(sample, stopCallback) {
  const [audioStream, setAudioStream] = useState(null);

  useEffect(() => {
    if (sample) {
      sample.currentTime = 0;
      sample.play().then(() => {
        const stream = sample.captureStream();
        if (sample.__boost) stream.__boost = sample.__boost;
        if (sample.__responses) stream.__responses = sample.__responses;
        setAudioStream(stream);
      });

      function onEnd() {
        stopCallback();
      }

      sample.addEventListener('ended', onEnd);

      return () => {
        sample.pause();
        sample.removeEventListener('ended', onEnd);
      };
    }

    if (sample === 0) {
      let micStream;
      getMicAudioStream().then((stream) => {
        micStream = stream;
        setAudioStream(stream);
      });

      return () => {
        if (micStream) micStream.getTracks().forEach((t) => t.stop());
      };
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
      data.forEach((d) => {
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

    while (i < data.length && data[i].t <= dt) {
      responder(data[i].data);
      i++;
    }
  })();

  return {
    stop: () => {
      stopped = true;
    },
  };
}

export default function Home() {
  const [offlineEnabled, setOfflineEnabled] = useState(false);

  useEffect(() => {
    useComprehension.__offline = offlineEnabled;
  }, [offlineEnabled]);

  const [activeSample, setActiveSample] = useState(null);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const playSample = useCallback((sample) => {
    setActiveSample(sample);
    setTimeStampStart((Date.now() / 1000) | 0);
  }, []);

  const stop = useCallback(() => {
    setActiveSample(null);
  }, []);

  const delayedStop = useCallback(() => {
    if (activeSample) activeSample.pause();
    setTimeout(stop, 5000);
    setTimeStampEnd((Date.now() / 1000) | 0);
  }, [activeSample, stop]);
  const audioStream = useAudioStream(activeSample, delayedStop);

  const [partialTranscript, setPartialTranscript] = useState(' ');
  const [transcripts, setTranscripts] = useState(false);
  const [excludedItems, setExcludedItems] = useState([]);
  const [transcribeCredential, setTranscribeCredential] = useState(null);

  const [timeStampStart, setTimeStampStart] = useState(0);
  const [timeStampEnd, setTimeStampEnd] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [healthCareProfessionalId, setHealthCareProfessionalId] = useState('');
  const [showCreateSessionForm, setShowCreateSessionForm] = useState(false);
  const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
  const [showCreateHealthCareProfessionalForm, setShowCreateHealthCareProfessionalFrom] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [healthCareProfessionalName, setHealthCareProfessionalName] = useState('');
  const [showCreatePatientSuccess, setShowCreatePatientSuccess] = useState(false);
  const [showCreateHealthCareProfessionalSucces, setShowCreateHealthCareProfessionalSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCreateSessionSuccess, setShowCreateSessionSuccess] = useState(false);
  const [sid, setSessionId] = useState('');
  const [sessionValidated, setSessionValidated] = useState(false);
  const [patientValidated, setPatientValidated] = useState(false);
  const [healthCareProfessionalValidated, setHealthCareProfessionalValidated] = useState(false);
  const [Patients, setPatients] = useState([]);
  const [HealthCareProfessionals, setHealthCareProfessionals] = useState([]);
  const [healthCareProfessionalIdDisabled] = useState(false);
  const [patientIdDisabled] = useState(false);

  var sessionId = '';

  const history = useHistory();

  const addTranscriptChunk = useCallback(({ Alternatives, IsPartial, StartTime }) => {
    const [text] = Alternatives[0].Items.reduce(
      ([prevText, prevAddSpeakerLabel], item) => {
        const isSpeakerChange = item.Type === 'speaker-change';
        const shouldAddSpeakerLabel = !isSpeakerChange && prevAddSpeakerLabel && 'Speaker' in item;
        const isPronunciation = item.Type === 'pronunciation';
        const isPunctuation = item.Type === 'punctuation';
        const speakerLabel = shouldAddSpeakerLabel ? `Speaker ${(parseInt(item.Speaker) + 1).toString()}\n` : '';
        const itemContent = isPronunciation || isPunctuation ? item.Content : '';
        const spaceAtEnd = isPronunciation ? ' ' : '';
        const text = `${prevText}${speakerLabel}${itemContent}${spaceAtEnd}`;
        const addSpeakerLabel = isSpeakerChange || (shouldAddSpeakerLabel ? false : prevAddSpeakerLabel);

        return [text, addSpeakerLabel];
      },
      ['', true],
    );
    if (IsPartial) {
      setPartialTranscript(text);
    } else {
      setPartialTranscript(null);
      setTranscripts((t) => [...t, { text, time: StartTime }]);
    }
  }, []);

  useEffect(() => {
    if (!audioStream) return;

    let stopped;

    setTranscripts([]);
    setPartialTranscript('');

    let streamer;

    if (audioStream.__responses && offlineEnabled) {
      streamer = createStreamFromRecordedResponses(audioStream.__responses, (transcript) => {
        if (stopped) return;
        addTranscriptChunk(transcript);
      });
    } else {
      // This logic is for recording the response from a websocket so it can be
      // stored for offline mode. window.__transcription_responses is used in DebugMenu
      const responses = (window.__transcription_responses = []);
      const start = performance.now();
      function recordData(frame) {
        responses.push({
          t: performance.now() - start,
          data: frame,
        });
      }
      getTranscribeCreds().then((result) => {
        setTranscribeCredential(result);
        streamer = streamAudioToWebSocket(
          audioStream,
          (transcript) => {
            if (stopped) return;
            recordData(transcript);
            addTranscriptChunk(transcript);
          },
          (err) => {
            console.log('ERROR', err);
          },
          result,
        );
      });
    }

    return () => {
      stopped = true;
      streamer.stop();
    };
  }, [addTranscriptChunk, audioStream, offlineEnabled]);

  const enableAnanlysis = useCallback(() => {
    setShowAnalysis(true);
  }, []);
  const disableAnalysis = useCallback(() => {
    setShowAnalysis(false);
  }, []);

  console.log({ transcripts });

  const comprehendResults = useComprehension(transcripts || [], transcribeCredential);

  const reset = useCallback(() => {
    setTranscripts(false);
    setPartialTranscript('');
    setActiveSample(null);
    setShowAnalysis(false);
    setShowExport(false);
    setExcludedItems([]);
    setShowForm(false);
  }, []);

  const toHome = useCallback(() => {
    setTranscripts(false);
    setPartialTranscript('');
    setActiveSample(null);
    setShowAnalysis(false);
    setShowExport(false);
    setExcludedItems([]);
    setShowForm(false);
    history.push('/home');
  }, [history]);

  const toSearch = useCallback(() => {
    setTranscripts(false);
    setPartialTranscript('');
    setActiveSample(null);
    setShowAnalysis(false);
    setShowExport(false);
    setExcludedItems([]);
    setShowForm(false);
    history.push('/search');
  }, [history]);

  const toggleResultItemVisibility = useCallback((id) => {
    setExcludedItems((arr) => {
      if (arr.includes(id)) {
        return arr.filter((x) => x !== id);
      }

      return [...arr, id];
    });
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setShowCreateSessionForm(true);
    toggleShowForm();
  };

  const handleSessionSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setSessionValidated(true);
    } else {
      saveSession();
      toggleCreateSessionForm();
      toggleCreateSessionSuccess();
      clearSessionFields();
    }
  };

  async function createPatient() {
    const apiName = 'MTADemoAPI';
    const path = 'createPatient';
    const myInit = {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
      response: true,
      queryStringParameters: {
        PatientName: patientName,
      },
    };

    const result = await API.post(apiName, path, myInit);
    setPatientId(result.data.PatientId);
    return result;
  }

  async function createHealthCareProfessional() {
    const apiName = 'MTADemoAPI';
    const path = 'createHealthCareProfessional';
    const myInit = {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
      response: true,
      queryStringParameters: {
        HealthCareProfessionalName: healthCareProfessionalName,
      },
    };

    const result = await API.post(apiName, path, myInit);
    setHealthCareProfessionalId(result.data.HealthCareProfessionalId);
    return result;
  }

  const patientShow = () => {
    setShowCreatePatientForm(true);
    setShowCreateSessionForm(false);
  };

  const healthCareProfessionalShow = () => {
    setShowCreateHealthCareProfessionalFrom(true);
    setShowCreateSessionForm(false);
  };

  const toggleCreatePatient = () => setShowCreatePatientForm(!showCreatePatientForm);
  const toggleCreateHealthCareProfessional = () =>
    setShowCreateHealthCareProfessionalFrom(!showCreateHealthCareProfessionalForm);
  const togglePatientSuccess = () => setShowCreatePatientSuccess(!showCreatePatientSuccess);
  const toggleHealthCareProfessionalSuccess = () =>
    setShowCreateHealthCareProfessionalSuccess(!showCreateHealthCareProfessionalSucces);
  const toggleCreateSessionForm = () => setShowCreateSessionForm(!showCreateSessionForm);
  const toggleShowForm = () => setShowForm(!showForm);
  const toggleCreateSessionSuccess = () => setShowCreateSessionSuccess(!showCreateSessionSuccess);

  const handleCreatePatient = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setPatientValidated(true);
    } else {
      createPatient();
      toggleCreatePatient();
      togglePatientSuccess();
    }
  };

  const handleCreateHealthCareProfessional = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setHealthCareProfessionalValidated(true);
    } else {
      createHealthCareProfessional();
      toggleCreateHealthCareProfessional();
      toggleHealthCareProfessionalSuccess();
    }
  };

  const clearSessionFields = () => {
    setSessionName('');
    // setPatientId("");
    // setHealthCareProfessionalId("");
  };

  async function createSession(data) {
    const apiName = 'MTADemoAPI';
    const path = 'createSession';
    const myInit = {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
      response: true,
      queryStringParameters: data,
    };

    const result = await API.post(apiName, path, myInit);
    return result;
  }

  const saveSession = () => {
    sessionId = 's-' + timeStampEnd + generate();
    setSessionId(sessionId);
    Storage.configure({
      bucket: process.env.REACT_APP_StorageS3BucketName,
      level: 'public',
      region: process.env.REACT_APP_region,
    });
    const transcribeAddress = `transcribe-medical-output/${sessionId}/${sessionId}-session-transcribe.txt`;
    const comprehendAddress = `comprehend-medical-output/${sessionId}/${sessionId}-session-comprehend.json`;

    var dict = {
      Session: {
        sessionId: sessionId,
        patientId: patientId,
        healthCareProfessionalId: healthCareProfessionalId,
        timeStampStart: timeStampStart,
        timeStampEnd: timeStampEnd,
      },
      Medication: [],
      RxNorm: [],
      MedicationRxNorm: [],
      MedicalCondition: [],
      ICD10CMConcept: [],
      MedicalConditionICD10CMConcept: [],
      TestTreatmentProcedures: [],
    };

    var transcripts_texts = '';
    if (transcripts)
      transcripts.forEach((item) => {
        transcripts_texts += item.text + ' ';
      });

    Storage.put(transcribeAddress, transcripts_texts);

    const allResults = [].concat(...comprehendResults);
    const filteredResultsM = allResults.filter((r) => r.Category === 'MEDICATION');
    filteredResultsM.forEach((r, i) => {
      const medicationId = 'm' + sessionId + i;
      dict.Medication.push({
        medicationId: medicationId,
        sessionId: sessionId,
        medicationText: r.Text,
        medicationType: r.Type,
      });
      if (r.RxNormConcepts)
        r.RxNormConcepts.forEach((r2, i2) => {
          dict.RxNorm.push({ code: r2.Code, description: r2.Description });
          dict.MedicationRxNorm.push({ medicationId: medicationId, code: r2.Code });
        });
    });

    const filteredResultsMC = allResults.filter((r) => r.Category === 'MEDICAL_CONDITION');
    filteredResultsMC.forEach((r, i) => {
      const medicalConditionId = 'mc' + sessionId + i;
      dict.MedicalCondition.push({
        medicalConditionId: medicalConditionId,
        sessionId: sessionId,
        medicalConditionText: r.Text,
      });
      if (r.ICD10CMConcepts)
        r.ICD10CMConcepts.forEach((r2, i2) => {
          dict.ICD10CMConcept.push({ code: r2.Code, description: r2.Description });
          dict.MedicalConditionICD10CMConcept.push({ medicalConditionId: medicalConditionId, code: r2.Code });
        });
    });

    const filteredResultsTTP = allResults.filter((r) => r.Category === 'TEST_TREATMENT_PROCEDURE');
    filteredResultsTTP.forEach((r, i) => {
      const testTreatmentProcedureId = 't' + sessionId + i;
      dict.TestTreatmentProcedures.push({
        testTreatmentProcedureId: testTreatmentProcedureId,
        sessionId: sessionId,
        testTreatmentProcedureText: r.Text,
        testTreatmentProcedureType: r.Type,
      });
    });
    Storage.put(comprehendAddress, JSON.stringify(dict));

    const data = {
      PatientId: patientId,
      HealthCareProfessionalId: healthCareProfessionalId,
      SessionName: sessionName,
      SessionId: sessionId,
      TimeStampStart: timeStampStart,
      TimeStampEnd: timeStampEnd,
      TranscribeS3Path: transcribeAddress,
      ComprehendS3Path: comprehendAddress,
    };
    Storage.configure({
      bucket: process.env.REACT_APP_REACT_APP_WebAppBucketName,
      level: 'public',
      region: process.env.REACT_APP_region,
    });

    createSession(data);

    return sessionId;
  };

  async function listPatients() {
    const apiName = 'MTADemoAPI';
    const path = 'listPatients';
    const myInit = {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
      response: true,
      queryStringParameters: { PatientId: '' },
    };
    await API.get(apiName, path, myInit).then((result) => setPatients(result.data));
  }

  async function listHealthCareProfessionals() {
    const apiName = 'MTADemoAPI';
    const path = 'listHealthCareProfessionals';
    const myInit = {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
      response: true,
      queryStringParameters: { HealthCareProfessionalId: '' },
    };

    const result = await API.get(apiName, path, myInit);
    setHealthCareProfessionals(result.data);
    return result;
  }

  const ToolTipIcon = () => (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 16 16'
      class='bi bi-question-circle-fill'
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fill-rule='evenodd'
        d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.57 6.033H5.25C5.22 4.147 6.68 3.5 8.006 3.5c1.397 0 2.673.73 2.673 2.24 0 1.08-.635 1.594-1.244 2.057-.737.559-1.01.768-1.01 1.486v.355H7.117l-.007-.463c-.038-.927.495-1.498 1.168-1.987.59-.444.965-.736.965-1.371 0-.825-.628-1.168-1.314-1.168-.901 0-1.358.603-1.358 1.384zm1.251 6.443c-.584 0-1.009-.394-1.009-.927 0-.552.425-.94 1.01-.94.609 0 1.028.388 1.028.94 0 .533-.42.927-1.029.927z'
      />
    </svg>
  );

  const renderTooltip = (message, props) => (
    <Tooltip id='button-tooltip' {...props}>
      {message}
    </Tooltip>
  );

  let stage;

  if (!transcripts) {
    stage = STAGE_HOME;
  } else if (audioStream && !showAnalysis) {
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
        onSearch={toSearch}
        onHome={toHome}
        onAnalyze={enableAnanlysis}
        onHideAnalysis={disableAnalysis}
        onShowExport={() => setShowExport(true)}
        onHideExport={() => setShowExport(false)}
        onReset={reset}
      />

      <DebugMenu offlineEnabled={offlineEnabled} onSetOffline={setOfflineEnabled} />

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

        {showForm && (
          <div className={s.CreateSessionFlow}>
            {showCreateSessionForm && (
              <Form noValidate validated={sessionValidated} onSubmit={handleSessionSubmit}>
                <h2>Save Session</h2>
                <p>Save this session to review it at a later time or conduct analysis.</p>
                <p>This data would be available across all users for review.</p>
                {/* Session Name Field */}
                <Form.Group as={Row} id='formSessionName'>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'This is the name you can give to your test session. This field cannot be empty.',
                    )}
                  >
                    <Form.Label column sm='4'>
                      <ToolTipIcon />
                      Session Name
                    </Form.Label>
                  </OverlayTrigger>

                  <Col sm='8'>
                    <Form.Control
                      required
                      type='text'
                      placeholder='Session Name'
                      name='sessionName'
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                    />
                    <Form.Text className='text-white'>session name no color hint</Form.Text>
                    <Form.Control.Feedback type='invalid'>Session name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
                {/* Patient Id Field */}
                <Form.Group as={Row} Id='formPatientId'>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'This is the unique ID tagged to every patient in the system. You can use this id to search or save sessions related to the Patient.',
                    )}
                  >
                    <Form.Label column sm='4'>
                      <ToolTipIcon />
                      Patient Id
                    </Form.Label>
                  </OverlayTrigger>
                  <Col sm='8'>
                    <Form.Control
                      required
                      as='select'
                      disabled={patientIdDisabled}
                      value={patientId}
                      onChange={(e) => {
                        console.log('p', e.target.value);
                        setPatientId(e.target.value);
                      }}
                      onClick={listPatients}
                    >
                      <option value=''></option>
                      {Patients.map((patient, index) => (
                        <option key={index} value={patient['PatientId']}>
                          {patient['PatientId'] + ' | ' + patient['PatientName']}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Text className='text-primary' onClick={patientShow}>
                      Create a new patient?
                    </Form.Text>
                    <Form.Control.Feedback type='invalid'>Patient name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
                {/* Health Care Professional Id Field */}
                <Form.Group required as={Row} Id='formHealthCareProfessionalId'>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'This is the unique ID tagged to every health care professional in the system. You can use this id to search or save sessions related to the Health care professional.',
                    )}
                  >
                    <Form.Label column sm='4'>
                      <ToolTipIcon />
                      Health Care Professional Id
                    </Form.Label>
                  </OverlayTrigger>
                  <Col sm='8'>
                    <Form.Control
                      as='select'
                      required
                      disabled={healthCareProfessionalIdDisabled}
                      value={healthCareProfessionalId}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setHealthCareProfessionalId(e.target.value);
                        console.log(healthCareProfessionalName);
                      }}
                      onClick={listHealthCareProfessionals}
                    >
                      <option value=''></option>
                      {HealthCareProfessionals.map((hcp, index) => (
                        <option key={index} value={hcp['HealthCareProfessionalId']}>
                          {hcp['HealthCareProfessionalId'] + ' | ' + hcp['HealthCareProfessionalName']}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Text className='text-primary' onClick={healthCareProfessionalShow}>
                      Create a Health Care Professional?
                    </Form.Text>
                    <Form.Control.Feedback type='invalid'>Hcp name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <Button
                  variant='primary'
                  onClick={() => {
                    setShowCreateSessionForm(!showCreateSessionForm);
                    toggleShowForm();
                    clearSessionFields();
                    setSessionValidated(false);
                  }}
                >
                  Back
                </Button>
                <Button variant='primary' type='submit'>
                  Submit
                </Button>
              </Form>
            )}

            {showCreatePatientForm && (
              <Form noValidate validated={patientValidated} onSubmit={handleCreatePatient}>
                <h2>Create New Patient</h2>
                <p>Create a new patient and save it into the database.</p>
                <p>This data would be available across all users for review.</p>
                <p>You will get a patient Id in order to save the session.</p>
                {/* Patient Name Field */}
                <Form.Group as={Row} id='formPatientName'>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'To create a new patient you need to provide the patient name, then you will get the patient id from this. This field cannot be empty.',
                    )}
                  >
                    <Form.Label column sm='4'>
                      <ToolTipIcon />
                      Patient Name
                    </Form.Label>
                  </OverlayTrigger>

                  <Col sm='8'>
                    <Form.Control
                      required
                      type='text'
                      placeholder='Patient Name'
                      name='patientName'
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                    <Form.Text className='text-white'>patient name no color hint</Form.Text>
                    <Form.Control.Feedback type='invalid'>Patient name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <Button
                  variant='primary'
                  onClick={() => {
                    toggleCreatePatient();
                    toggleCreateSessionForm();
                    setPatientValidated(false);
                  }}
                >
                  Back
                </Button>
                <Button variant='primary' type='submit'>
                  Submit
                </Button>
              </Form>
            )}

            {showCreateHealthCareProfessionalForm && (
              <Form
                noValidate
                validated={healthCareProfessionalValidated}
                onSubmit={handleCreateHealthCareProfessional}
              >
                <h2>Create New Health Care Professional</h2>
                <p>Create a new health care professional and save it into the database.</p>
                <p>This data would be available across all users for review.</p>
                <p>You will get a patient Id in order to save the session.</p>
                {/* Patient Name Field */}
                <Form.Group as={Row} id='formHealthCareProfessionalName'>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'To create a new health care professional you need to provide the health care professional name, then you will get the health care professional id from this. This field cannot be empty.',
                    )}
                  >
                    <Form.Label column sm='4'>
                      <ToolTipIcon />
                      Health Care Professional Name
                    </Form.Label>
                  </OverlayTrigger>

                  <Col sm='8'>
                    <Form.Control
                      required
                      type='text'
                      placeholder='Health Care Professional Name'
                      name='healthCareProfessionalName'
                      value={healthCareProfessionalName}
                      onChange={(e) => setHealthCareProfessionalName(e.target.value)}
                    />
                    <Form.Text className='text-white'>health care professional name no color hint</Form.Text>
                    <Form.Control.Feedback type='invalid'>
                      Health care professional name cannot be empty.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <Button
                  variant='primary'
                  onClick={() => {
                    toggleCreateHealthCareProfessional();
                    toggleCreateSessionForm();
                    setHealthCareProfessionalValidated(false);
                  }}
                >
                  Back
                </Button>
                <Button variant='primary' type='submit'>
                  Submit
                </Button>
              </Form>
            )}

            {showCreatePatientSuccess && (
              <div>
                <h2>Create Patient Success!</h2>
                <p>The Patient Id is {patientId}.</p>
                <p>Remember to save it :)</p>
                <button
                  onClick={() => {
                    togglePatientSuccess();
                    toggleCreateSessionForm();
                  }}
                >
                  Back
                </button>
              </div>
            )}

            {showCreateHealthCareProfessionalSucces && (
              <div>
                <h2>Create Health Care Professional Success!</h2>
                <p>The Health Care Professional Id is {healthCareProfessionalId}.</p>
                <p>Remember to save it :)</p>
                <button
                  onClick={() => {
                    toggleHealthCareProfessionalSuccess();
                    toggleCreateSessionForm();
                  }}
                >
                  Back
                </button>
              </div>
            )}

            {showCreateSessionSuccess && (
              <div>
                <h2>Create Session Success!</h2>
                <p>The Session Id is {sid}.</p>
                <p>Remember to save it :)</p>
                <button
                  onClick={() => {
                    toggleCreateSessionSuccess();
                    toggleShowForm();
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {(stage === STAGE_TRANSCRIBED || stage === STAGE_SUMMARIZE) && (
        <Button className={s.SaveButton} onClick={handleSave} id={'i' + stage}>
          Save Session
        </Button>
      )}
    </div>
  );
}
