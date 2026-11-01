import React, { createContext, useContext, useState, useEffect } from 'react';

export type BgStyle = 'waves' | 'topographic' | 'constellation' | 'gemstone' | 'minimal';

export interface BgOption {
  id: BgStyle;
  name: string;
  desc: string;
  icon: string;
}

export const BG_OPTIONS: BgOption[] = [
  {
    id: 'waves',
    name: 'Tide Waves',
    desc: 'Flowing 3D telemetry ribbons & topographic contours',
    icon: '🌊',
  },
  {
    id: 'topographic',
    name: 'Topographic Grid',
    desc: 'Elevation contour lines, coordinates & telemetry mesh',
    icon: '🗺️',
  },
  {
    id: 'constellation',
    name: 'Neural Network',
    desc: 'Interconnected nodes & telemetry constellation',
    icon: '🌌',
  },
  {
    id: 'gemstone',
    name: 'Chromatic Gemstone',
    desc: 'Vibrant violet, cyan & lime aurora signal flow',
    icon: '💎',
  },
  {
    id: 'minimal',
    name: 'Minimal Dot Matrix',
    desc: 'Clean executive slate with micro-grid points',
    icon: '🪨',
  },
];

interface BackgroundContextType {
  bgStyle: BgStyle;
  setBgStyle: (style: BgStyle) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
  options: BgOption[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bgStyle, setBgStyleState] = useState<BgStyle>(() => {
    const saved = localStorage.getItem('trendtide_bg_style');
    if (saved && ['waves', 'topographic', 'constellation', 'gemstone', 'minimal'].includes(saved)) {
      return saved as BgStyle;
    }
    return 'waves';
  });

  const [bgOpacity, setBgOpacityState] = useState<number>(() => {
    const saved = localStorage.getItem('trendtide_bg_opacity');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 1.0) {
        return parsed;
      }
    }
    return 0.85;
  });

  const setBgStyle = (style: BgStyle) => {
    setBgStyleState(style);
    localStorage.setItem('trendtide_bg_style', style);
  };

  const setBgOpacity = (opacity: number) => {
    setBgOpacityState(opacity);
    localStorage.setItem('trendtide_bg_opacity', opacity.toString());
  };

  useEffect(() => {
    localStorage.setItem('trendtide_bg_style', bgStyle);
  }, [bgStyle]);

  return (
    <BackgroundContext.Provider
      value={{
        bgStyle,
        setBgStyle,
        bgOpacity,
        setBgOpacity,
        options: BG_OPTIONS,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

