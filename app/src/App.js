import React, { Component, useState } from 'react';
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { Link } from "react-router-dom";

import "./App.css";
import Routes from './Routes';


function App() {

  return (
      <div className="App">
      <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
          <Navbar.Brand>
            <Link to="/" className="link"> Medical Transcription Analysis </Link>  
          </Navbar.Brand>
          <Navbar.Toggle />
      </Navbar> 
        <Routes />
    </div>
  );  
}

export default App;
