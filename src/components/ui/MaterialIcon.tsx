import React from 'react';

interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ name, className = '', filled = false, style }) => {
  return (
    <span
      className={`material-symbols-outlined select-none align-middle ${className}`}
      style={{
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
