import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, useHistory } from "react-router-dom";
import { API, Auth } from "aws-amplify";
import s from "./preHome.module.css";


export default function PreHome() {
    const [isLoading, setIsLoading] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [sessionName, setSessionName] = useState("");
    const [patientId, setPatientId] = useState("");
    const [healthCareProfessionalId, setHealthCareProfessionalId] = useState("");
    const [showCreateSessionForm, setShowCreateSessionForm] = useState(true);
    const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
    const [showCreateHealthCareProfessionalForm, setShowCreateHealthCareProfessionalFrom] = useState(false);
    const [patientName, setPatientName] = useState("")
    const [healthCareProfessionalName, setHealthCareProfessionalName] = useState("")
    const [Sessions, setSessions] = useState([])

    const history = useHistory();

    const toRecordingPage = () => history.push("/recording");

    const handleSubmit = event => {
      event.preventDefault();
      return listSessions();
    }

    const handleCreateSession = event => {
      event.preventDefault();
    }

    async function listSessions() {
        const apiName = 'MTADemoAPI';
        const path = 'listSessions';
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: {
            PatientId: searchVal,
          },
        };
        const result =  await API.get(apiName, path, myInit);
        setSessions(result.data);
        return result;
    }

    async function listPatients() {
        const apiName = 'MTADemoAPI';
        const path = 'listPatients';
        const parameters = (searchVal === '') ? {} : {PatientId: searchVal} 
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: parameters
        };
        const result =  await API.get(apiName, path, myInit); 
        return result;
    }

    async function listHealthCareProfessionals() {
        const apiName = 'MTADemoAPI';
        const path = 'listHealthCareProfessionals';
        const parameters = (searchVal === '') ? {} : {HealthCareProfessionalId: searchVal} 
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: parameters
        };
    
        const result =  await API.get(apiName, path, myInit); 
        return result;
    }
 
    async function createPatient() {
        const apiName = 'MTADemoAPI';
        const path = 'createPatient';
        const myInit = { 
            //   headers: { 
            //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
            //   },
            response: true,
            queryStringParameters: {
                'PatientName': searchVal,
            },
        };
    
        const result =  await API.post(apiName, path, myInit); 
        return result;
    }

    async function createHealthCareProfessional() {
        const apiName = 'MTADemoAPI';
        const path = 'createHealthCareProfessional';
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: {
            'HealthCareProfessionalName': searchVal,
          },
        };
    
        const result =  await API.post(apiName, path, myInit); 

        return result;
    }

    const patientBack = () => {
      setShowCreatePatientForm(false)
      setShowCreateSessionForm(true)
    }

    const healthCareProfessionalBack = () => {
      setShowCreateHealthCareProfessionalFrom(false)
      setShowCreateSessionForm(true)
    }

    const patientShow = () => {
      setShowCreatePatientForm(true)
      setShowCreateSessionForm(false)
    }

    const healthCareProfessionalShow = () => {
      setShowCreateHealthCareProfessionalFrom(true)
      setShowCreateSessionForm(false)
    }

    const CreateSessionForm = () => (
      <form>
        <input type="text" placeholder="Session Name" name="sessionName" value={sessionName} onChange={e => setSessionName(e.target.value)}/>
        <p></p>
        <input type="text" placeholder="Patient Id" name="patientId" value={patientId} onChange={e => setPatientId(e.target.value)}/>
        <p href="#" onClick={patientShow}>new patient?</p>
        <input type="text" placeholder="Health Care Professional Id" name="healthCareProfessionalId" value={healthCareProfessionalId} onChange={e => setHealthCareProfessionalId(e.target.value)}/>
        <p href="#" onClick={healthCareProfessionalShow}>new health care professional?</p>
        <button type="submit" onClick={()=>setShowCreateSessionForm(!showCreateSessionForm)}>Back</button>
        <button type="submit" onClick={()=>setShowCreateSessionForm(!showCreateSessionForm)}>Submit</button>
      </form> 
    )

    const CreatePatientForm = () => (
      <form>
        <input type="text" placeholder="Patient Name" name="patientName" value={patientName} onChange={e => setPatientName(e.target.value)}/>
        <button type="submit" onClick={patientBack}>Back</button>
        <button type="submit" onClick={()=>setShowCreatePatientForm(!showCreatePatientForm)}>Submit</button>
      </form> 
    )

    const CreateHealthCareProfessionalForm = () => (
      <form>
        <input type="text" placeholder="Health Care Professional Name" name="healthCareProfessionalName" value={healthCareProfessionalName} onChange={e => setHealthCareProfessionalName(e.target.value)}/>
        <button type="submit" onClick={healthCareProfessionalBack}>Back</button>
        <button type="submit" onClick={()=>setShowCreateHealthCareProfessionalFrom(!showCreateHealthCareProfessionalForm)}>Submit</button>
      </form>  
    )

    const SessionsTable = () => (
      <table border="1">
        <tbody>
          {Sessions.map((session) => {
            return (
              <tr>
                {Object.entries(session).map((field, value) => {
                  return typeof(field[1])==='object' ? <td>{field[1][1]}</td> : <td>{field[1]}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    return (
        <div className = {s.preHome}>
            <div className = {s.searchBarContainer}>
                <button type="submit" onClick={toRecordingPage}>Start a record</button>
                <form className = {s.searchBar}>
                    <input type="text" placeholder="Search.." name="search" value={searchVal} onChange={e => setSearchVal(e.target.value)}/>
                    <button type="submit" onClick={handleSubmit}>listSession</button>
                </form> 
            </div>
            <button type="submit" onClick={listPatients}>List Patients</button>
            <button type="submit" onClick={listHealthCareProfessionals}>List Health Care Professionals</button>
            <button type="submit" onClick={createPatient}>Create Patient</button>
            <button type="submit" onClick={createHealthCareProfessional}>Create Health Care Professional</button>  

            {showCreateSessionForm && <CreateSessionForm />}
            {showCreatePatientForm && <CreatePatientForm />}
            {showCreateHealthCareProfessionalForm && <CreateHealthCareProfessionalForm />}
            {Sessions && <SessionsTable />}
        </div>
    )
}