import { API, Auth } from 'aws-amplify';
import { ClientParams } from '../types/ClientParams';

const getTranscribeCredentials = async (): Promise<ClientParams> => {
  const apiName = 'MTADemoAPI';
  const path = 'getCredentials';
  const myInit = {
    headers: {
      Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
    },
  };

  const result = await API.post(apiName, path, myInit);

  return result;
};

export default getTranscribeCredentials;
