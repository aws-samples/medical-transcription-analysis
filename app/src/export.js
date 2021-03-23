import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API, Auth } from 'aws-amplify';
import s from './export.module.css';
import { Table } from 'react-bootstrap';
import Header from './components/Header';
import ExportPaneHeader from './components/ExportPaneHeader/ExportPaneHeader';

import { STAGE_SEARCH_EXPORT } from './consts';

export default function Export() {
  let params = useParams();
  const [transcribeText, setTranscribeText] = useState([]);
  const [comprehendDict, setComprehendDict] = useState({});
  const [soapNotes, setSoapNotes] = useState([]);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    async function loadS3Content(sessionId) {
      const apiName = 'MTADemoAPI';
      const path = 'getTranscriptionComprehend';
      const myInit = {
        headers: {
          Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        },
        response: true,
        queryStringParameters: { SessionId: sessionId },
      };
      const result = await API.get(apiName, path, myInit);
      const transcribe = result['data']['transcribe'];
      const comprehend = result['data']['comprehend'];
      const soapNotes = result['data']['soapNotes'];

      setTranscribeText(transcribe.split('.'));
      setComprehendDict(JSON.parse(comprehend));
      setSoapNotes(soapNotes.split('\n'));
      setUpdated(true);
    }
    loadS3Content(params.sid);
  }, [params.sid]);

  const epochToDate = (e) => {
    return new Date(e * 1000).toLocaleString();
  };

  const SessionSection = () => {
    const Session = comprehendDict.Session;

    return (
      <div>
        <main>
          <Table className={s.ses} bordered striped small>
            <thead>
              <tr>
                <td colSpan='5'>
                  <h3>Session Overview</h3>
                </td>
              </tr>
              <tr>
                <th>Session Id</th>
                <td className={s.spec}>{Session.sessionId}</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Patient Id </th>
                <td>{Session.patientId}</td>
              </tr>
              <tr>
                <th>Health Care Professional Id</th>
                <td>{Session.healthCareProfessionalId}</td>
              </tr>
              <tr>
                <th>Timestamp Start </th>
                <td>{epochToDate(Session.timeStampStart)}</td>
              </tr>
              <tr>
                <th>Timestamp End</th>
                <td>{epochToDate(Session.timeStampEnd)}</td>
              </tr>
            </tbody>
          </Table>
        </main>
      </div>
    );
  };

  const TranscribeSection = () => (
    <div>
      <ExportPaneHeader content='Transcription' type='SUB_SECTION' />
      {transcribeText.map((text) => {
        return text ? <p>{text + '.'}</p> : null;
      })}
    </div>
  );

  const SOAPNotesSection = () => (
    <div>
      <ExportPaneHeader content='SOAP Notes' type='SUB_SECTION' />
      {soapNotes.map((text) => {
        return text ? <p>{text}</p> : null;
      })}
    </div>
  );

  const ComprehendSection = () => {
    const Medication = comprehendDict.Medication;
    const RxNorm = comprehendDict.RxNorm;
    const MedicationRxNorm = comprehendDict.MedicationRxNorm;
    const MedicalCondition = comprehendDict.MedicalCondition;
    const ICD10CMConcept = comprehendDict.ICD10CMConcept;
    const MedicalConditionICD10CMConcept = comprehendDict.MedicalConditionICD10CMConcept;
    const TestTreatmentProcedures = comprehendDict.TestTreatmentProcedures;

    return (
      <div className={s.comprehend}>
        <main>
          <Table className={s.tests} bordered striped>
            <thead>
              <tr>
                <td colSpan='3'>
                  <h3>Tests, Treatments, Procedures </h3>
                </td>
              </tr>
              <tr>
                <th>#</th>
                <th>Text of Treatment</th>
                <th>Type of Treatment</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(TestTreatmentProcedures).map((tDict, idx) => (
                <tr>
                  <td>{idx + 1}</td>
                  <td>{tDict.testTreatmentProcedureText}</td>
                  <td>{tDict.testTreatmentProcedureType}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Table className={s.meds} bordered striped>
            <thead>
              <tr>
                <td colSpan='5'>
                  <h3>Medications</h3>
                </td>
              </tr>
              <tr>
                <th>#</th>
                <th>Medication</th>
                <th>Medication Type</th>
                <th>RxNorm Code</th>
                <th>RxNorm Concept Text</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(Medication).map((mDict, idx) => (
                <tr>
                  <td>{idx + 1}</td>
                  <td>{mDict.medicationText}</td>
                  <td>{mDict.medicationType}</td>
                  <td>
                    {Object.values(MedicationRxNorm)
                      .filter((d) => d.medicationId === mDict.medicationId)
                      .map((mrnDict) => (
                        <div>{mrnDict.code}</div>
                      ))}
                  </td>
                  <td>
                    {Object.values(MedicationRxNorm)
                      .filter((d) => d.medicationId === mDict.medicationId)
                      .map((mrnDict) => (
                        <div>{Object.values(RxNorm).filter((d) => d.code === mrnDict.code)[0].description}</div>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Table className={s.conds} bordered striped>
            <thead>
              <tr>
                <td colSpan='4'>
                  <h3>Medical Conditions</h3>
                </td>
              </tr>
              <tr>
                <th>#</th>
                <th>Medical Condition</th>
                <th>ICD-10-CM Concept Code</th>
                <th>ICD-10-CM Concept Text</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(MedicalCondition).map((mcDict, idx) => (
                <tr>
                  <td>{idx + 1}</td>
                  <td>{mcDict.medicalConditionText}</td>
                  <td>
                    {Object.values(MedicalConditionICD10CMConcept)
                      .filter((d) => d.medicalConditionId === mcDict.medicalConditionId)
                      .map((mciDict) => (
                        <div>{mciDict.code}</div>
                      ))}
                  </td>
                  <td>
                    {Object.values(MedicalConditionICD10CMConcept)
                      .filter((d) => d.medicalConditionId === mcDict.medicalConditionId)
                      .map((mciDict) => (
                        <div>{Object.values(ICD10CMConcept).filter((d) => d.code === mciDict.code)[0].description}</div>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </main>
      </div>
    );
  };

  return (
    <div className={s.body}>
      <Header stage={STAGE_SEARCH_EXPORT} />
      {updated && (
        <div className={s.container}>
          <SessionSection></SessionSection>
          <SOAPNotesSection></SOAPNotesSection>
          <ComprehendSection></ComprehendSection>
          <TranscribeSection></TranscribeSection>
        </div>
      )}
    </div>
  );
}
