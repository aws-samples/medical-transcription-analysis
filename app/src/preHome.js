import React, { useState, useEffect, useCallback } from 'react';
import Button from './components/Button/Button';
import FormInput from "./components/FormInput/FormInput";
import { BrowserRouter as Router, useHistory } from "react-router-dom";
import { API, Auth } from "aws-amplify";
import s from "./preHome.module.css";


export default function PreHome() {
    const [isLoading, setIsLoading] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const history = useHistory();

    const toRecordingPage = () => history.push("/recording");

    const handleSubmit = event => {
        event.preventDefault();
        alert(`Submitting Name ${searchVal}`)
        return listSessions()
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
            PatientId: 'p-3e3477c37d674ecc98e3cdf5487ee07b',
          },
        };
    
        const result =  await API.get(apiName, path, myInit); 
        console.log(result);
        return result;
    }

    async function listPatients() {
        const apiName = 'MTADemoAPI';
        const path = 'listPatients';
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: {
            PatientId: 'p-3e3477c37d674ecc98e3cdf5487ee07b',
          },
        };
    
        const result =  await API.get(apiName, path, myInit); 
        console.log(result);
        return result;
    }

    async function listHealthCareProfessionals() {
        const apiName = 'MTADemoAPI';
        const path = 'listHealthCareProfessionals';
        const myInit = { 
        //   headers: { 
        //     Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
        //   },
          response: true,
          queryStringParameters: {
            HealthCareProfessionalId: 'h-67a2c81c20994ff48b52c1b7416667a5',
          },
        };
    
        const result =  await API.get(apiName, path, myInit); 
        console.log(result);
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
                'PatientName': 'Red',
            },
            body: {
                'PatientName': 'Red',
            },
        };
    
        const result =  await API.post(apiName, path, myInit); 
        console.log(result);
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
            'HealthCareProfessionalName': 'Blue',
          },
          body: {
            'HealthCareProfessionalName': 'Blue',
          },
        };
    
        const result =  await API.post(apiName, path, myInit); 
        console.log(result);
        return result;
    }

    

    // const search = await API.get('MTADemoAPI', '/listSessions', {
    //     headers: { 
    //         Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
    //     },
    //     queryStringParameters: {
    //         patientId: 'p-3e3477c37d674ecc98e3cdf5487ee07b',
    //     },
    // }).then(response => {
    // }).catch(error => {
    //     console.log(error.response);
    // });

    return (
        <div className = {s.preHome}>
            <div className = {s.searchBarContainer}>
                <button type="submit" onClick={toRecordingPage}>Start a record</button>
                <form className = {s.searchBar}>
                    <input type="text" placeholder="Search.." name="search" value={searchVal} onChange={e => setSearchVal(e.target.value)}/>
                    <button type="submit" onClick={listSessions}><i class="fa fa-search"></i></button>
                </form> 

            </div>
            <button type="submit" onClick={listPatients}>List Patients</button>
            <button type="submit" onClick={listHealthCareProfessionals}>List Health Care Professionals</button>
            <button type="submit" onClick={createPatient}>Create Patient</button>
            <button type="submit" onClick={createHealthCareProfessional}>Create Health Care Professional</button>  
        </div>

        /* <form>
            <p>
                <FormInput
                autoComplete="search"
                type="text"
                name="Search"
                label="Search"
                onChange={handleFormChange}
                />
            </p>
            <Button disabled={isLoading} type="submit">Login</Button>
            {error && <p className="error">{error}
        </form> */

    )
}