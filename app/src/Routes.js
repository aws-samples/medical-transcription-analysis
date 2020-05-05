import React from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./Login";
import Home from "./home";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Login />
      </Route>
      <Route exact path="/home">
        <Home />
      </Route>
    </Switch>
  );
}