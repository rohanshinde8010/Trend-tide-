import React from 'react';
import { useBackground } from '../context/BackgroundContext';

export const BackgroundCanvas: React.FC = () => {
  const { bgStyle, bgOpacity } = useBackground();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Underlying Soft Gray Base */}
      <div className="absolute inset-0 bg-[#EAEFF4]" />

      {/* 2. Topographic & Telemetry Vector Wave Base (Always active for grid & contour continuity) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-out"
        style={{
          backgroundImage: `url('/bg-telemetry-waves.svg')`,
          opacity: bgStyle === 'topographic' ? bgOpacity * 1.0 : bgOpacity * 0.75,
        }}
      />

      {/* 3. Style-Specific Layer Overlays */}
      {bgStyle === 'waves' && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-multiply transition-opacity duration-500 ease-out"
          style={{
            backgroundImage: `url('/bg-wave-slate.png')`,
            opacity: bgOpacity * 0.7,
          }}
        />
      )}

      {bgStyle === 'constellation' && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-multiply transition-opacity duration-500 ease-out"
          style={{
            backgroundImage: `url('/bg-constellation-slate.png')`,
            opacity: bgOpacity * 0.75,
          }}
        />
      )}

      {bgStyle === 'gemstone' && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-multiply transition-opacity duration-500 ease-out"
          style={{
            backgroundImage: `url('/bg-wave-glow.png')`,
            opacity: bgOpacity * 0.8,
          }}
        />
      )}

      {bgStyle === 'minimal' && (
        <div
          className="absolute inset-0 bg-repeat transition-opacity duration-500 ease-out"
          style={{
            backgroundImage: `radial-gradient(#94A3B8 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
            opacity: bgOpacity * 0.5,
          }}
        />
      )}

      {/* 4. Fine Ambient Gemstone Aura Corner Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#9D00FF]/5 blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00E1FF]/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-[36rem] h-64 rounded-full bg-[#62FF00]/4 blur-3xl" />
    </div>
  );
};

