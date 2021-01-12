import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { API, Auth } from 'aws-amplify';
import s from './preHome.module.css';
import { Form, Row, Col, Button, OverlayTrigger, Tooltip, Table } from 'react-bootstrap';
import Header from './components/Header';
import { STAGE_SEARCH } from './consts';

export default function PreHome() {
  const [patientId, setPatientId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [Patients, setPatients] = useState([]);
  const [HealthCareProfessionals, setHealthCareProfessionals] = useState([]);
  const [healthCareProfessionalId, setHealthCareProfessionalId] = useState('');
  const [healthCareProfessionalName] = useState('');
  const [Sessions, setSessions] = useState([]);
  const [Stage, setStage] = useState(1);
  const [show, setShow] = useState(false);
  const target = useRef(null);
  const [setSearchValidated] = useState(false);

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

  const history = useHistory();

  const toRecordingPage = () => history.push('/home');

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
    const result = await API.get(apiName, path, myInit);
    setPatients(result.data);
    return result;
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

  const handleTableCellClick = (sessionId) => {
    window.open('/export/' + sessionId, '_blank');
  };

  const epochToDate = (e) => {
    return new Date(e * 1000).toLocaleString();
  };

  const SessionsTable = () => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Session Name</th>
          <th>Session Id</th>
          <th>Patient Id</th>
          <th>Health Care Professional Id</th>
          <th>Timestamp Start</th>
          <th>Timestamp End</th>
        </tr>
      </thead>
      <tbody>
        {Sessions.map((session) => {
          return (
            <tr>
              <td id='sessionName' class='text-primary' onClick={() => handleTableCellClick(session.SessionId)}>
                {session.SessionName}
              </td>

              <td ref={target} onClick={() => setShow(!show)}>
                {session.SessionId}
              </td>

              <td>{session.PatientId}</td>
              <td>{session.HealthCareProfessionalId}</td>
              <td>{epochToDate(session.TimeStampStart)}</td>
              <td>{epochToDate(session.TimeStampEnd)}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  const handleSearchSessions = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setSearchValidated(true);
    } else {
      searchSessions();
      setSessionId('');
      setPatientId('');
      setHealthCareProfessionalId('');
      setPatients([]);
      setHealthCareProfessionals([]);
    }
  };

  const validatesSessionId = (str) => {
    if (!str || str === '') return false;
    if (str.length < 2) return false;
    if (str.substr(0, 2) !== 's-') return false;
    return true;
  };

  const validatesPatientId = (str) => {
    if (!str || str === '') return false;
    if (str.length < 2) return false;
    if (str.substr(0, 2) !== 'p-') return false;
    return true;
  };

  const validatesHealthCareProfessionalId = (str) => {
    if (!str || str === '') return false;
    if (str.length < 2) return false;
    if (str.substr(0, 2) !== 'h-') return false;
    return true;
  };

  async function searchSessions() {
    const apiName = 'MTADemoAPI';
    const path = 'listSessions';
    var parameters = {};

    if (validatesSessionId(sessionId) && validatesPatientId(patientId)) {
      parameters = { SessionId: sessionId, PatientId: patientId };
    } else if (validatesSessionId(sessionId) && validatesHealthCareProfessionalId(healthCareProfessionalId)) {
      parameters = { SessionId: sessionId, HealthCareProfessionalId: healthCareProfessionalId };
    } else if (validatesHealthCareProfessionalId(healthCareProfessionalId)) {
      parameters = { HealthCareProfessionalId: healthCareProfessionalId };
    } else if (validatesPatientId(patientId)) {
      parameters = { PatientId: patientId };
    } else {
      console.log('error');
      return { status: 'error' };
    }
    const myInit = {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
      response: true,
      queryStringParameters: parameters,
    };
    const result = await API.get(apiName, path, myInit);
    console.log('printing response', result.data);
    setSessions(result.data);
    return result;
  }

  return (
    <div>
      <Header stage={STAGE_SEARCH} onHome={toRecordingPage} />
      <div className={s.preHome}>
        <div className={s.searchBarContainer}>
          <Form onSubmit={handleSearchSessions}>
            <h2>Search Session</h2>
            {/* Patient Id Field */}
            <Form.Row>
              {(Stage === 1 || Stage === 3) && (
                <Form.Group as={Col}>
                  <OverlayTrigger
                    placement='top'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'This is the unique ID tagged to every patient in the system. You can use this id to search or save sessions related to the Patient.',
                    )}
                  >
                    <Form.Label column sm='0'>
                      Patient Id
                      <ToolTipIcon />
                    </Form.Label>
                  </OverlayTrigger>

                  <Col sm='12'>
                    <Form.Control
                      required
                      as='select'
                      label=' '
                      value={patientId}
                      onChange={(e) => {
                        console.log('p', e.target.value);
                        setPatientId(e.target.value);
                      }}
                      onClick={listPatients}
                    >
                      <option value={''}></option>
                      {Patients.map((patient, index) => (
                        <option key={index} value={patient['PatientId']}>
                          {patient['PatientId'] + ' | ' + patient['PatientName']}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Text className='text-white'>Create a new patient?</Form.Text>
                    <Form.Control.Feedback type='invalid'>Patient name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
              )}
              {/* Health Care Professional Id Field */}
              {(Stage === 2 || Stage === 4) && (
                <Form.Group required as={Col}>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'This is the unique ID tagged to every health care professional in the system. You can use this id to search or save sessions related to the Health care professional.',
                    )}
                  >
                    <Form.Label column sm='0'>
                      Health Care Professional Id
                      <ToolTipIcon />
                    </Form.Label>
                  </OverlayTrigger>
                  <Col sm='12'>
                    <Form.Control
                      required
                      as='select'
                      label=' '
                      value={healthCareProfessionalId}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setHealthCareProfessionalId(e.target.value);
                        console.log(healthCareProfessionalName);
                      }}
                      onClick={listHealthCareProfessionals}
                    >
                      <option value={''}></option>
                      {HealthCareProfessionals.map((hcp, index) => (
                        <option key={index} value={hcp['HealthCareProfessionalId']}>
                          {hcp['HealthCareProfessionalId'] + ' | ' + hcp['HealthCareProfessionalName']}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Text className='text-white'>Create a Health Care Professional?</Form.Text>
                    <Form.Control.Feedback type='invalid'>Hcp name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
              )}
              {/* Session Id Field */}
              {(Stage === 3 || Stage === 4) && (
                <Form.Group as={Col} id='formSessionId'>
                  <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(
                      'To create a new patient you need to provide the patient name, then you will get the patient id from this. This field cannot be empty.',
                    )}
                  >
                    <Form.Label column sm='0'>
                      SessionId
                      <ToolTipIcon />
                    </Form.Label>
                  </OverlayTrigger>

                  <Col sm='12'>
                    <Form.Control
                      required
                      type='text'
                      placeholder='Session Id'
                      name='sessionId'
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                    />
                    <Form.Text className='text-white'>patient name no color hint</Form.Text>
                    <Form.Control.Feedback type='invalid'>Patient name cannot be empty.</Form.Control.Feedback>
                  </Col>
                </Form.Group>
              )}
            </Form.Row>
            <fieldset>
              <Form.Group as={Row}>
                <Form.Label id='searchOptions' as='legend' column sm={2}>
                  Search options
                </Form.Label>
                <Col id='searchCol' sm={10}>
                  <Row sm={10}>
                    <Col sm={5}>
                      <Form.Check
                        type='radio'
                        label='By Patient Id'
                        name='By Patient Id'
                        id='1'
                        onClick={() => {
                          setStage(1);
                          setHealthCareProfessionals([]);
                          setSessionId('');
                          setHealthCareProfessionalId('');
                        }}
                        checked={Stage === 1}
                      />
                    </Col>
                    <Col sm={5}>
                      <Form.Check
                        type='radio'
                        label='By Health Care Professional Id'
                        name='By Health Care Professional Id'
                        id='2'
                        onClick={() => {
                          setStage(2);
                          setPatients([]);
                          setSessionId('');
                          setPatientId('');
                        }}
                        checked={Stage === 2}
                      />
                    </Col>
                  </Row>
                  <Row sm={10}>
                    <Col sm={5}>
                      <Form.Check
                        type='radio'
                        label='By Patient Id and Session Id'
                        name='By Patient Id and Session Id'
                        id='3'
                        onClick={() => {
                          setStage(3);
                          setHealthCareProfessionals([]);
                          setHealthCareProfessionalId('');
                        }}
                        checked={Stage === 3}
                      />
                    </Col>
                    <Col sm={7}>
                      <Form.Check
                        type='radio'
                        label='By Health Care Professional Id and Session Id'
                        name='By Health Care Professional Id and Session Id'
                        id='4'
                        onClick={() => {
                          setStage(4);
                          setPatients([]);
                          setPatientId('');
                        }}
                        checked={Stage === 4}
                      />
                    </Col>
                  </Row>
                </Col>
              </Form.Group>
            </fieldset>
            <Form.Group as={Row}>
              <Col sm={12}>
                <Button type='submit'>Search</Button>
              </Col>
            </Form.Group>
          </Form>
        </div>
        <div className={s.tableGroup}>{Sessions.length ? <SessionsTable></SessionsTable> : null}</div>
      </div>
    </div>
  );
}
