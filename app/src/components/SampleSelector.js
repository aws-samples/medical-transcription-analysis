import React, { useCallback } from 'react';

import FilePicker from './FilePicker';

import cs from 'clsx';
import s from './SampleSelector.module.css';

function SampleButton({
  sample,
  active,
  onSelect,
  onStop,
  idx
}) {
  const click = useCallback(() => {
    onSelect(sample)
  }, [ onSelect, sample ]);

  return (
    <div>
      <button
        className={cs(s.sampleButton, active && s.playing)}
        onClick={active ? onStop : click}
      />
      <span>Sample {idx}</span>
    </div>
  )
}


export default function SampleSelector({
  samples,
  activeSample,
  onSelect,
  onStop,
  hidden
}) {

  const startMic = useCallback(() => {
    onSelect(0);
  }, [ onSelect ]);

  const filesSubmitted = useCallback(files => {
    const first = files[0];
    const url = URL.createObjectURL(first);
    const audio = new Audio(url);
    onSelect(audio);
  }, [ onSelect ]);

  return (
    <div className={cs(s.base, hidden && s.hidden)}>
<<<<<<< HEAD
      <button onClick={startMic}>Dictate Audio</button>

      <FilePicker onSubmit={filesSubmitted} />

=======
      <button className={cs(s.dictateAudio)} onClick={startMic}>Dictate Audio</button>
      <FilePicker onSubmit={filesSubmitted} />
>>>>>>> dbce1ff8db98c3ff65173730b263f67926930d6e
      <div className={s.presets}>
        {Object.keys(samples).map((s, i) => (
          <SampleButton idx={i + 1} sample={samples[s]} active={activeSample === samples[s]} onSelect={onSelect} onStop={onStop} />
        ))}
      </div>
<<<<<<< HEAD
=======
      <div class={s.credit}>
        <small>Note: Samples were synthesized using data from <a href="https://www.mtsamples.com">MTSamples.com</a></small>
      </div>
>>>>>>> dbce1ff8db98c3ff65173730b263f67926930d6e
    </div>
  )
}
