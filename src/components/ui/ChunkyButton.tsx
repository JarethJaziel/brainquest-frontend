import React from 'react';

interface ChunkyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'white';
  children: React.ReactNode;
  className?: string;
}

export const ChunkyButton: React.FC<ChunkyButtonProps> = ({
  color = 'primary',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const colorMap = {
    primary: 'bg-primary text-white border-primary-container',
    secondary: 'bg-secondary text-white border-secondary-container',
    tertiary: 'bg-tertiary text-white border-tertiary-container',
    error: 'bg-error text-white border-error-container',
    success: 'bg-emerald-600 text-white border-emerald-400',
    white: 'bg-white text-on-surface border-outline-variant hover:bg-surface-container-low',
  };

  const activeStyles = disabled
    ? 'opacity-50 cursor-not-allowed border-solid'
    : 'chunky-button active:chunky-button-active hover:brightness-105 active:brightness-95';

  return (
    <button
      disabled={disabled}
      className={`
        px-6 py-3 font-bold rounded-2xl border-2 border-solid text-center inline-flex items-center justify-center gap-2 select-none
        ${colorMap[color]} ${activeStyles} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default ChunkyButton;
