import React from 'react';
import classNames from 'classnames';

import css from './Button.scss';

export const BUTTON_PALETTES = ['black', 'blue', 'orange'];

interface ButtonProps {
  className?: string;
  disabled?: boolean;
  inverted?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  palette?: 'black' | 'blue' | 'orange';
  simple?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled = false,
  inverted = false,
  onClick,
  palette = 'orange',
  simple = false,
}) => {
  const buttonClassNames = classNames(css.button, css[palette], className, {
    [css.disabled]: disabled,
    [css.inverted]: inverted && !simple,
    [css.simple]: simple,
  });

  return (
    <button className={buttonClassNames} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
