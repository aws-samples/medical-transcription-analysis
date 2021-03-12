import React from 'react';

import cs from 'clsx';
import s from './Header.module.css';
import { Link, Heading } from '@chakra-ui/react';
import {
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
          <Heading as='h2' size='md'>
            <Link onClick={onHome}>Medical Transcription Analysis</Link>
          </Heading>
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
