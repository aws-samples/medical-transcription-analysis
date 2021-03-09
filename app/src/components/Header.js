import React from 'react';

import cs from 'clsx';
import s from './Header.module.css';
import awsmllogo from '../img/logo_awsml_01.svg';
import { Link } from '@chakra-ui/react';
import {
  STAGE_HOME,
  STAGE_TRANSCRIBING,
  STAGE_TRANSCRIBED,
  STAGE_EXPORT,
  STAGE_SOAP_REVIEW,
  STAGE_SEARCH_EXPORT,
  STAGE_SEARCH,
} from '../consts';
import { useHistory } from 'react-router-dom';
import { Auth } from 'aws-amplify';

export default function Header({
  stage,
  onHome = () => {},
  onSearch = () => {},
  onShowSOAPReview = () => {},
  onHideSOAPReview = () => {},
  onShowExport = () => {},
  onHideExport = () => {},
  onReset = () => {},
}) {
  const history = useHistory();
  async function handleLogout() {
    await Auth.signOut();
    history.push('/');
    window.location.reload(false);
  }
  return (
    <>
      <header className={cs(s.base, s.visible)}>
        <div className={s.left}>
          {stage !== STAGE_HOME && stage !== STAGE_EXPORT && stage !== STAGE_SEARCH_EXPORT && stage !== STAGE_SEARCH && (
            <button onClick={onHome}>
              <span />
              Home
            </button>
          )}

          <a href='https://aws.amazon.com/machine-learning/ '>
            <img className={s.logo} src={awsmllogo} alt='AWS machine learning' />
          </a>
        </div>
        <div className={s.headings}>
          <h1>Medical Transcription Analysis</h1>
        </div>
        <div className={s.right}>
          {stage !== STAGE_SEARCH_EXPORT && stage !== STAGE_SEARCH && (
            <button className={s.search} onClick={onSearch}>
              Search
            </button>
          )}
          {stage === STAGE_SEARCH && (
            <button onClick={onHome}>
              <span />
              Home
            </button>
          )}
          {stage === STAGE_SOAP_REVIEW && (
            <button onClick={onHideSOAPReview}>
              <span />
              Back
            </button>
          )}
          {stage === STAGE_EXPORT && (
            <button onClick={onHideExport}>
              <span />
              Back
            </button>
          )}
          {(stage === STAGE_TRANSCRIBED || stage === STAGE_TRANSCRIBING) && (
            <button disabled={stage === STAGE_TRANSCRIBING} onClick={onShowSOAPReview}>
              Review Notes
            </button>
          )}
          {stage === STAGE_SOAP_REVIEW && <button onClick={onShowExport}>Summarize</button>}
          {stage === STAGE_EXPORT && <button onClick={onReset}>Start over</button>}
          {stage !== STAGE_SEARCH_EXPORT && (
            <Link onClick={handleLogout} m={4}>
              Logout
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
