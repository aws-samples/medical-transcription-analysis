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
        return search()
    }

    async function search() {
        const apiName = 'MTADemoAPI';
        const path = 'listSessions';
        // console.log((await Auth.currentSession()).getAccessToken().getJwtToken())
        const myInit = { 
          headers: { 
            Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
          },
          response: true,
        //   queryStringParameters: {
        //     patientId: 'p-3e3477c37d674ecc98e3cdf5487ee07b',
        //   },
        };
    
        const result =  await API.get(apiName, path, myInit); 
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
                    <button type="submit" onClick={handleSubmit}><i class="fa fa-search"></i></button>
                </form>   
            </div>
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