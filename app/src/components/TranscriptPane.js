import React, { useRef, useEffect } from 'react';
import TranscriptLine from './TranscriptLine';
import InProgressTranscriptLine from './InProgressTranscriptLine';

import cs from 'clsx';
import s from './TranscriptPane.module.css';

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
  enableEditing,
  handleTranscriptChange,
  onSpeakerChange,
}) {
  const container = useRef();

  // Always scroll down as far as possible when receiving new transcripts
  // This keeps the current in-progress line level with the floating microphone graphic
  useEffect(() => {
    container.current.scrollTop = container.current.scrollHeight;
  }, [transcriptChunks, partialTranscript]);

  return (
    <div className={s.base}>
      <div className={s.scrollable} ref={container}>
        <div className={cs(s.inner, inProgress && s.inProgress)}>
          {(transcriptChunks || []).map((x, i) => (
            <TranscriptLine
              key={i}
              chunk={x}
              results={resultChunks[i] ?? []}
              enabledCategories={CATEGORIES}
              enableEditing={enableEditing}
              handleTranscriptChange={(value) => handleTranscriptChange(i, value)}
              onSpeakerChange={(value) => onSpeakerChange(i, value)}
            />
          ))}

          <InProgressTranscriptLine key={transcriptChunks ? transcriptChunks.length : 0} text={partialTranscript} />
        </div>
      </div>
    </div>
  );
}
