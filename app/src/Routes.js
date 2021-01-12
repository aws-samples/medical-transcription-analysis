import React from 'react';
import { Switch } from 'react-router-dom';
import Login from './Login';
import Home from './home';
import PreHome from './preHome';
import Export from './export';
import AuthenticatedRoute from './AuthenticatedRoute';
import UnauthenticatedRoute from './UnauthenticatedRoute';

export default function Routes() {
  return (
    <Switch>
      <UnauthenticatedRoute exact path='/'>
        <Login />
      </UnauthenticatedRoute>
      <AuthenticatedRoute exact path='/home'>
        <Home />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path='/search'>
        <PreHome />
      </AuthenticatedRoute>
      <AuthenticatedRoute path='/export/:sid'>
        <Export />
      </AuthenticatedRoute>
    </Switch>
  );
}
