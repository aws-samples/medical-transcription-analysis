import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router } from "react-router-dom";
import Login from './Login';
import Amplify from 'aws-amplify';
import * as serviceWorker from './serviceWorker';
import App from './App';

require("dotenv").config();

const region = process.env.REACT_APP_region;
console.log(region);
Amplify.configure({
  Auth: {
    identityPoolId: process.env.REACT_APP_IdentityPoolId,
    region: region,
    userPoolId: process.env.REACT_APP_UserPoolId,
    userPoolWebClientId: process.env.REACT_APP_UserPoolClientId,
    mandatorySignIn: true
  },
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_WebAppBucketName,
      level: "public",
      region: region
    }
  },
});


ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  );

serviceWorker.register();
