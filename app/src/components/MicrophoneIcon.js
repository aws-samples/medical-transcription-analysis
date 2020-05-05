import React, { useEffect, useRef, useMemo, useState } from 'react';
import cs from 'clsx';

import s from './MicrophoneIcon.module.css';

export default function MicrophoneIcon({
  stream,
  big,
  visible,
  onStop
}) {
  const [ vu, setVu ] = useState(0);

  const ctx = useRef(null);
  const analyser = useRef(null);
  if (!ctx.current) {
    ctx.current = new AudioContext();

    // If for whatever reason the context is suspended (usually because the browser is waiting
    // for a user interaction before allowing audio) - wait for a click then try to reenable it
    if (ctx.current.state === 'suspended') {
      function resumeIt() {
        ctx.current.resume();
        document.removeEventListener('click', resumeIt);
      }
      document.addEventListener('click', resumeIt);
    }

    analyser.current = ctx.current.createAnalyser();
  }

  const source = useMemo(() => stream && ctx.current.createMediaStreamSource(stream), [ stream ]);

  useEffect(() => {
    if (!source) return;
    source.connect(analyser.current);

    return () => {
      source.disconnect();
    };
  }, [ source ]);


  useEffect(() => {
    const int = setInterval(() => {
      // Use just a single frequency bucket to get a rough volume level
      const fd = new Uint8Array(1);
      analyser.current.getByteFrequencyData(fd);
      setVu(fd[0])
    }, 50);

    return () => {
      clearInterval(int);
    }
  }, []);

  const boost = (stream && stream.__boost) || 1;

  return (
    <>
      <div className={cs(s.base, big && s.big, visible && s.visible)} onClick={onStop}>
        <div className={s.levels}>
          <div className={s.meter} style={{ height: Math.min(100, vu / 256 * 100 * boost) + '%' }} />
        </div>
      </div>

      <div className={cs(s.stopButton, visible && !big && s.visible)} onClick={onStop} />
    </>
  )
}
