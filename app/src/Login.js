import React, { useState, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { useHistory } from 'react-router-dom';
import './Login.module.css';
import Loading from './components/Loading/Loading';
import FormInput from './components/FormInput/FormInput';
import Button from './components/Button/Button';
import { useAppContext } from './libs/contextLib';

export default function Login() {
  const history = useHistory();
  const { userHasAuthenticated } = useAppContext();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    passwordChangeRequired: false,
    newPassword: '',
    userInit: undefined,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { username, password, passwordChangeRequired, newPassword, userInit } = credentials;

  let userInputForm;

  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const userInit = await Auth.signIn(username, password);
        if (userInit && userInit.challengeName === 'NEW_PASSWORD_REQUIRED') {
          setCredentials({
            passwordChangeRequired: true,
            userInit: userInit,
          });
          setIsLoading(false);
        } else {
          userHasAuthenticated(true);
          userInit.signInUserSession && history.push('/home');
        }
      } catch ({ message }) {
        setError(message);
        setIsLoading(false);
        console.log(message);
      }
    },
    [username, password, history, userHasAuthenticated],
  );

  const handlePasswordResetSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const user = await Auth.completeNewPassword(userInit, newPassword);
        userHasAuthenticated(true);
        user.signInUserSession && history.push('/home');
      } catch ({ message }) {
        setError(message);
        setIsLoading(false);
      }
    },
    [userInit, newPassword, history, userHasAuthenticated],
  );

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((credentials) => ({ ...credentials, [name]: value }));
  }, []);

  const loginForm = () => {
    return (
      <form onSubmit={handleLoginSubmit}>
        <p>
          <FormInput
            autoComplete='username'
            type='text'
            name='username'
            label='Username'
            value={username}
            onChange={handleFormChange}
          />
        </p>
        <p>
          <FormInput
            autoComplete='current-password'
            type='password'
            name='password'
            label='Password'
            value={password}
            onChange={handleFormChange}
          />
        </p>
        <Button disabled={isLoading} type='submit'>
          Login
        </Button>
        {error && <p className='error'>{error}</p>}
      </form>
    );
  };

  const passwordResetForm = () => {
    return (
      <form onSubmit={handlePasswordResetSubmit}>
        <p>
          <FormInput
            autoComplete='new-password'
            type='password'
            name='newPassword'
            label='New Password'
            value={newPassword}
            onChange={handleFormChange}
          />
        </p>
        <Button disabled={isLoading} type='submit'>
          Login
        </Button>
        {error && <p className='error'>{error}</p>}
      </form>
    );
  };

  userInputForm = passwordChangeRequired ? passwordResetForm() : loginForm();

  return (
    <article>
      <div className='Login'>
        <h2>Medical Transcription Analysis</h2>
        {userInputForm}
        {isLoading && <Loading />}
      </div>
    </article>
  );
}
