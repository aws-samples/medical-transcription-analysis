
import { API, Auth } from "aws-amplify";

async function getTranscribeCredentials() {
    const apiName = 'MTADemoAPI';
    const path = 'getCredentials';
    const myInit = { 
      headers: { 
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
      },
    };

    const result =  await API.post(apiName, path, myInit); 
    return result;
}

export default function getCredentials() {
    return getTranscribeCredentials();
}