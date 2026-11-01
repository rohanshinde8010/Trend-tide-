export type Category = 'AI & ML' | 'Cloud & DevTools' | 'Web3 & Fintech' | 'BioTech & Health' | 'Climate & Energy';

export interface DataPoint {
  date: string;
  count: number;
  ema7: number;
  isSpike?: boolean;
}

export interface ForecastPoint {
  date: string;
  baseline: number;
  holtWinters: number;
  upper95: number;
  lower95: number;
  upper80: number;
  lower80: number;
}

export interface Topic {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  totalVolume: number;
  velocity: number;        // percentage growth over past 7 days e.g. +48.5%
  acceleration: number;    // 2nd derivative: rate of growth change
  burstinessRatio: number; // std dev / mean: high = spike, low = sustained
  sustainabilityStatus: 'Sustained Trend' | 'Emerging Inflection' | 'High Spike Risk' | 'Plateaued';
  confidenceScore: number; // 0-100%
  description: string;
  historicalSeries: DataPoint[];
  forecastSeries: ForecastPoint[];
  sources: { name: string; url: string; count: number }[];
  isWatchlisted?: boolean;
}

export interface Recommendation {
  id: string;
  topicId: string;
  topicName: string;
  category: Category;
  compositeScore: number; // 0 - 100
  velocityWeight: number;
  momentumWeight: number;
  affinityWeight: number;
  reason: string;
  growthVelocity: number;
}
