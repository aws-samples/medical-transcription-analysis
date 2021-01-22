import React from 'react';
import { Route, Redirect, useLocation, RouteProps } from 'react-router-dom';
import { useAppContext } from './libs/contextLib';

const AuthenticatedRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAppContext();
  return <Route {...rest}>{isAuthenticated ? children : <Redirect to={`/?redirect=${pathname}${search}`} />}</Route>;
};
export default AuthenticatedRoute;
