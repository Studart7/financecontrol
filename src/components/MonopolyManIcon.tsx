import React from 'react';
import botImage from '../assets/monopoly-bw.png';

export const MonopolyManIcon = ({ size = 24, className = '', isBlack = false, ...props }: any) => {
  if (isBlack) {
    return (
      <img
        src={botImage}
        alt="Ícone do Monopólio"
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%', transform: 'scale(1.4)' }}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: '#5C1A1A',
        maskImage: `url(${botImage})`,
        WebkitMaskImage: `url(${botImage})`,
        maskSize: 'cover',
        WebkitMaskSize: 'cover',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        transform: 'scale(1.4)',
        borderRadius: '50%'
      }}
      {...props}
    />
  );
};
