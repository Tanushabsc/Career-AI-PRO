import React from 'react';

const Skeleton = ({ width, height, variant = 'rect', className = '', style = {} }) => {
  const baseStyle = {
    width: width || '100%',
    height: height || '20px',
    ...style
  };

  const variantClass = variant === 'circle' ? 'skeleton-circle' : variant === 'title' ? 'skeleton-title' : variant === 'text' ? 'skeleton-text' : 'skeleton-card';

  return (
    <div 
      className={`skeleton ${variantClass} ${className}`} 
      style={baseStyle}
    />
  );
};

export default Skeleton;
