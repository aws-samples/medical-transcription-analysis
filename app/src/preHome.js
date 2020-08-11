import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, useHistory } from "react-router-dom";
import { API, Auth } from "aws-amplify";
import s from "./preHome.module.css";


export default function PreHome() {
    const [isLoading, setIsLoading] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [patientId, setPatientId] = useState("");
    const [healthCareProfessionalId, setHealthCareProfessionalId] = useState("");
    const [showCreateSessionForm, setShowCreateSessionForm] = useState(true);
    const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
    const [showCreateHealthCareProfessionalForm, setShowCreateHealthCareProfessionalFrom] = useState(false);
    const [patientName, setPatientName] = useState("")
    const [healthCareProfessionalName, setHealthCareProfessionalName] = useState("")
    const [Sessions, setSessions] = useState([])
    const [Patients, setPatients] = useState([])
    const [HealthCareProfessionals, setHealthCareProfessionals] = useState([])


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
          queryStringParameters: handleSearchVal(searchVal)
        };
        const result =  await API.get(apiName, path, myInit);
        setPatients([])
        setHealthCareProfessionals([])
        setSessions(result.data);
        setSearchVal("");
        return result;
    }

    const splitString = (prefix, str) => {
      return prefix+str.split(prefix).pop().split(',')[0]
    }

    const handleSearchVal = (searchVal) => {
      const patientIdPrefix = 'p-'
      const healthCareProfessionalIdPrefix = 'h-'
      const sessionIdPrefix = 's-'

      const includePatientId = searchVal.includes(patientIdPrefix)
      const includeHealthCareProfessionalId = searchVal.includes(healthCareProfessionalIdPrefix)
      const includeSessionId = searchVal.includes(sessionIdPrefix)

      const pid = splitString(patientIdPrefix,searchVal)
      const sid = splitString(sessionIdPrefix,searchVal)
      const hid = splitString(healthCareProfessionalIdPrefix,searchVal)

      return includePatientId&&includeSessionId ? {PatientId: pid, SessionId: sid} :
              includeHealthCareProfessionalId&&includeSessionId ? {HealthCareProfessionalId: hid, SessionId: sid} :
                includePatientId ? {PatientId: pid} :
                  includeHealthCareProfessionalId ? {HealthCareProfessionalId: hid} : 
                   ""
    }

    async function listPatients() {
        const apiName = 'MTADemoAPI';
        const path = 'listPatients';
        const parameters = (searchVal === '') ? {PatientId: ''} : {PatientId: searchVal} 
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: {PatientId: ''}
        };
        const result =  await API.get(apiName, path, myInit); 
        setPatients(result.data)
        setHealthCareProfessionals([])
        setSessions([])
        return result;
    }

    async function listHealthCareProfessionals() {
        const apiName = 'MTADemoAPI';
        const path = 'listHealthCareProfessionals';
        const parameters = (searchVal === '') ? {HealthCareProfessionalId: ''} : {HealthCareProfessionalId: searchVal} 
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: {HealthCareProfessionalId: ''}
        };
    
        const result =  await API.get(apiName, path, myInit); 
        setPatients([])
        setHealthCareProfessionals(result.data)
        setSessions([])
        return result;
    }

    const handleTableCellClick = (sessionId) => {
        alert(sessionId)
        listS3Content(sessionId)
    }

    async function listS3Content(sessionId){
      const apiName = 'MTADemoAPI';
      const path = 'getTranscriptionComprehend';
      const myInit = {
        response: true,
        queryStringParameters: {'sessionId': sessionId }
      }
      const result =  await API.get(apiName, path, myInit);
      console.log(result)
      return result
    }

    const SessionsTable = () => (
      <table border="1">
        <tbody>
          {Sessions.map((session, index) => {
            return index === 0 ? (
              <tr>
                {Object.entries(session).map((field, value) => {
                  return typeof(field[1])==='object' ? <td>{field[1][0]}</td> : <td>{field[0]}</td>
                })}
              </tr>
            ) : null
          })}
          {Sessions.map((session) => {
            return (
              <tr onClick={()=>handleTableCellClick(session.SessionId)}>
                {Object.entries(session).map((field, value) => {
                  return typeof(field[1])==='object' ? <td>{field[1][1]}</td> : <td>{field[1]}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    const PatientsTable = () => (
      <table border="1">
        <tbody>
        {Patients.map((patient,index) => {
            return index === 0 ? (
              <tr>
                {Object.entries(patient).map((field, value) => {
                  return typeof(field[1])==='object' ? <td>{field[1][0]}</td> : <td>{field[0]}</td>
                })}
              </tr>
            ) : null;
          })}
          {Patients.map((patient) => {
            return (
              <tr>
                {Object.entries(patient).map((field, value) => {
                  return typeof(field[1])==='object' ? <td>{field[1][1]}</td> : <td>{field[1]}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    const HealthCareProfessionalsTable = () => (
      <table border="1">
        <tbody>
          {HealthCareProfessionals.map((healthCareProfessional, index) => {
            return index === 0 ? (
              <tr>
                {Object.entries(healthCareProfessional).map((field, value) => {
                  return typeof(field[1])==='object' ? <td>{field[1][0]}</td> : <td>{field[0]}</td>
                })}
              </tr>
            ) : null
          })}
          {HealthCareProfessionals.map((healthCareProfessional) => {
            return (
              <tr>
                {Object.entries(healthCareProfessional).map((field, value) => {
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
                <button type="submit" onClick={listPatients}>List Patients</button>
                <button type="submit" onClick={listHealthCareProfessionals}>List Health Care Professionals</button>
            
                <form className = {s.searchBar}>
                    <input type="text" placeholder="Search.." name="search" value={searchVal} onChange={e => setSearchVal(e.target.value)}/>
                    <button type="submit" onClick={handleSubmit}>List Sessions</button>
                </form> 
            </div>
           
            <div className = {s.tableGroup}>
              {Sessions && <SessionsTable />}
              {Patients && <PatientsTable />}
              {HealthCareProfessionals && <HealthCareProfessionalsTable />}
            </div>
        </div>
    )
}