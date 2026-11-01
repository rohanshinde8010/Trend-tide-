import React, { createContext, useContext, useState, useEffect } from 'react';
import { RegionItem, DEFAULT_REGIONS, fetchRegions } from '../api';

interface RegionContextType {
  currentRegion: string;
  regions: RegionItem[];
  currentRegionMeta: RegionItem;
  setCurrentRegion: (regionId: string) => void;
}

const RegionContext = createContext<RegionContextType>({
  currentRegion: 'worldwide',
  regions: DEFAULT_REGIONS,
  currentRegionMeta: DEFAULT_REGIONS[0],
  setCurrentRegion: () => {},
});

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regions, setRegions] = useState<RegionItem[]>(DEFAULT_REGIONS);
  const [currentRegion, setCurrentRegionState] = useState<string>(() => {
    return localStorage.getItem('trendtide_active_region') || 'worldwide';
  });

  useEffect(() => {
    fetchRegions()
      .then((data) => {
        if (data && data.length > 0) {
          setRegions(data);
        }
      })
      .catch((err) => console.error('Failed to load regions:', err));
  }, []);

  const setCurrentRegion = (regionId: string) => {
    setCurrentRegionState(regionId);
    localStorage.setItem('trendtide_active_region', regionId);
  };

  const currentRegionMeta =
    regions.find((r) => r.id === currentRegion) || regions[0] || DEFAULT_REGIONS[0];

  return (
    <RegionContext.Provider
      value={{
        currentRegion,
        regions,
        currentRegionMeta,
        setCurrentRegion,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);

