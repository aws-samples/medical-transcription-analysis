import React, { useRef, useEffect, useState, useCallback } from 'react';
import TranscriptLine from './TranscriptLine';
import InProgressTranscriptLine from './InProgressTranscriptLine';
import Toggle from './Toggle';

import cs from 'clsx';
import s from './TranscriptPane.module.css';

import highlightClasses from '../transcriptHighlights';
import displayNames from '../displayNames';

const CATEGORIES = [
  'PROTECTED_HEALTH_INFORMATION',
  'MEDICAL_CONDITION',
  'ANATOMY',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE',
];

export default function TranscriptPane({
  transcriptChunks,
  resultChunks,
  partialTranscript,
  inProgress,
  handleTranscriptChange,
}) {
  const container = useRef();

  // Always scroll down as far as possible when receiving new transcripts
  // This keeps the current in-progress line level with the floating microphone graphic
  useEffect(() => {
    container.current.scrollTop = container.current.scrollHeight;
  }, [transcriptChunks, partialTranscript]);

  const [enabledCategories, setEnabledCategories] = useState(CATEGORIES);

  const toggleCategory = useCallback((on, cat) => {
    if (on) {
      setEnabledCategories((c) => [...c, cat]);
    } else {
      setEnabledCategories((c) => c.filter((x) => x !== cat));
    }
  }, []);

  const [showToggles, setShowToggles] = useState(true);

  return (
    <div className={s.base}>
      <div className={cs(s.toggles, transcriptChunks && s.visible, !showToggles && s.collapse)}>
        <button className={s.hideToggleButton} onClick={() => setShowToggles(false)} aria-label='close' />
        <h4>Highlight on transcript</h4>
        {CATEGORIES.map((c) => (
          <div key={c} align='left'>
            <span className={s.toggleWrapper}>
              <Toggle value={enabledCategories.includes(c)} name={c} onValueChange={toggleCategory} />
            </span>

            <span className={highlightClasses[c]}>{displayNames[c]}</span>
          </div>
        ))}
      </div>

      <div
        className={cs(s.showToggleButton, transcriptChunks && s.visible, !showToggles && s.show)}
        onClick={() => setShowToggles(true)}
      />

      <div className={s.scrollable} ref={container}>
        <div className={cs(s.inner, inProgress && s.inProgress)}>
          {(transcriptChunks || []).map((x, i) => (
            <TranscriptLine
              key={i}
              chunk={x}
              results={resultChunks[i] ?? []}
              enabledCategories={enabledCategories}
              handleTranscriptChange={(value) => handleTranscriptChange(i, value)}
            />
          ))}

          <InProgressTranscriptLine key={transcriptChunks ? transcriptChunks.length : 0} text={partialTranscript} />
        </div>
      </div>
    </div>
  );
}
