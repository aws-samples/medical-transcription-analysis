import React, { Component, useState, useEffect } from 'react';
import { Navbar, Nav, NavItem, Container } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";

import "./App.css";
import Routes from './Routes';

function App() {
  const history = useHistory();
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    onLoad();
  }, []);
  
  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    }
    catch(e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }
  
    setIsAuthenticating(false);
  }

  async function handleLogout() {
    await Auth.signOut();
    userHasAuthenticated(false);
    history.push("/");
  } 
  return (
    !isAuthenticating &&
      <div className="App">
      <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
      {isAuthenticated? <href class= "logout" onClick={handleLogout}>Logout</href>: null }
        <Routes />
      </AppContext.Provider>
    </div>
  );  
}

export default App;
