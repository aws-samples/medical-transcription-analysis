import React from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./Login";
import Home from "./home";
import PreHome from "./preHome"
import AuthenticatedRoute from "./AuthenticatedRoute";
import UnauthenticatedRoute from "./UnauthenticatedRoute";

export default function Routes() {
  return (
    <Switch>
      <UnauthenticatedRoute exact path="/">
        <Login />
      </UnauthenticatedRoute>
      <AuthenticatedRoute exact path="/home">
        <PreHome/>
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/recording">
        <Home/>
      </AuthenticatedRoute>
    </Switch>
  );
}