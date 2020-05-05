import React, { useState, useLayoutEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import cs from 'clsx';
import s from './HeightSlider.module.css';

export default function HeightSlider({ children }) {
  const [ oldChildren, setOldChidren ] = useState(null);
  const [ transitioningChildren, setTransitioningChildren ] = useState(children);
  const [ transitioning, setTransitioning ] = useState(false);
  const [ targetHeight, setTargetHeight ] = useState('');
  const container = useRef();
  const inner = useRef();

  const transitionEnd = useCallback(() => {
    setTransitioningChildren(null);
    setTransitioning(false);
  }, []);

  useLayoutEffect(() => {
    if (children) {
      setOldChidren(children);
    }
  }, [ children ]);

  useLayoutEffect(() => {
    function transitionToHeight(x) {
      if (targetHeight === x) return;
      setTransitioningChildren(children || oldChildren);
      setTransitioning(true);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        setTargetHeight(x);
      }));
    }

    if (!children) {
      transitionToHeight(0);
    } else {
      transitionToHeight(inner.current.getBoundingClientRect().height);
    }
  }, [ children, oldChildren, targetHeight ]);

  return (
    <div
      ref={container}
      className={cs(s.base, transitioning && s.transitioning)}
      style={{ height: transitioning ? targetHeight : '' }}
      onTransitionEnd={transitionEnd}
    >
      <div ref={inner} className={s.inner}>
        {children}
      </div>
      <div className={s.transitioningInner}>
        {transitioningChildren}
      </div>
    </div>
  );
}


HeightSlider.propTypes = {
  children: PropTypes.node
};
