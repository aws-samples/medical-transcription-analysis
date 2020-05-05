import React, { useState, useEffect } from 'react';

export default function DebugMenu({
  offlineEnabled,
  onSetOffline
}) {

  const [ shifts, setShifts ] = useState(0);

  useEffect(() => {
    function press(evt) {
      if (evt.keyCode === 16) { // SHIFT
        setShifts(s => s + 1);
      }
    }

    document.addEventListener('keydown', press);

    return () => {
      document.removeEventListener('keydown', press);
    }
  }, []);

  const visible = shifts > 2;

  if (!visible) return null;

  return (
    <div style={{ position: 'absolute', top: 100, left: 10, zIndex: 10000000 }}>
      <p>
        <button onClick={() => setShifts(0)}>Hide</button>
      </p>
      <label>
        <input type="checkbox" onChange={e => onSetOffline(e.target.checked)} checked={offlineEnabled} />
        Offline mode
      </label>

      <p>
        <button onClick={() => {
          copyToClipboard(JSON.stringify(window.__transcription_responses, null, 2));
        }}>Copy Transcription results</button>
      </p>
      <p>
        <button onClick={() => {
          copyToClipboard(JSON.stringify(window.__comprehend_cache, null, 2));
        }}>Copy Comprehend cache</button>
      </p>
    </div>
  )
}





function copyToClipboard(txt) {
  var e = document.createElement('textarea');
  var es = e.style;
  // Prevent zooming on iOS
  es.fontSize = '12pt';
  // Reset box model
  es.border = '0';
  es.padding = '0';
  es.margin = '0';
  // Move element out of screen horizontally
  es.position = 'absolute';
  es.left = '-9999px';
  // Move element to the same position vertically
  es.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
  e.setAttribute('readonly', '');
  e.value = txt;

  document.body.appendChild(e);

  e.focus();
  e.setSelectionRange(0, e.value.length);

  var succeeded = document.execCommand('copy');

  document.body.removeChild(e);
  return succeeded;
}
