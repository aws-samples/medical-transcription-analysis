import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import styles from './Toggle.module.css';
import cs from 'clsx';

const noop = () => {};

const Toggle = forwardRef(function Toggle({
  value = false,
  onChange = noop,
  onValueChange = noop,
  name,
  ...rest
}, ref) {
  const [ v, setV ] = useState(value);

  useEffect(() => {
    setV(value);
  }, [ value ]);

  const cbx = useRef();

  const changed = useCallback(isChecked => {
    if (onChange({ target: { name, value: isChecked } }) === false) return;
    if (onValueChange(isChecked, name) === false) return;
    setV(isChecked);
  }, [ onChange, name, onValueChange ]);

  const nativeChanged = useCallback(e => {
    const isChecked = !!e.target.checked;
    e.target.checked = v;
    changed(isChecked);
  }, [ v, changed ]);

  const id = useMemo(() => Math.random().toString(36).slice(2), []);

  return (
    /*
      NB: this stopPropagation only prevents the react syntheticevent
      from propagating, not the native event. So we need to preventDefault
      in here too to make sure ancestor <label>s don't trigger a change
    */
    <div ref={ref} className={cs(styles.toggle)} onClick={e => {
      e.stopPropagation();
    }}>
      <input
        {...rest}
        ref={cbx}
        type="checkbox"
        id={id}
        checked={v}
        onChange={nativeChanged}
      />
      <label className={styles.target} htmlFor={id}/>
    </div>
  );
});

Toggle.displayName = 'Toggle';

Toggle.propTypes = {
  value: PropTypes.oneOfType([ PropTypes.bool, PropTypes.number, PropTypes.string ]),
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
  name: PropTypes.string
};

export default Toggle;
