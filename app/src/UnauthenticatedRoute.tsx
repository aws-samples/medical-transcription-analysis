import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAppContext } from './libs/contextLib';

const UnauthenticatedRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const { isAuthenticated } = useAppContext();
  return <Route {...rest}>{!isAuthenticated ? children : <Redirect to='/' />}</Route>;
};

export default UnauthenticatedRoute;
