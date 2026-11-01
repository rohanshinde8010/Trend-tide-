import { Topic, Recommendation } from '../types';

// Helper to generate simulated 30-day historical time series with EMA
function generateTimeSeries(base: number, growthRate: number, noiseFactor: number, spikeDay?: number) {
  const points = [];
  let current = base;
  let currentEma = base;
  const now = new Date('2026-10-26T00:00:00Z');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // compound organic growth
    current = current * (1 + (growthRate / 30) + (Math.sin(i * 0.5) * 0.02));
    // add noise
    const noise = (Math.random() - 0.45) * noiseFactor * current;
    let count = Math.max(10, Math.round(current + noise));

    let isSpike = false;
    if (spikeDay !== undefined && i === (30 - spikeDay)) {
      count = Math.round(count * 2.8);
      isSpike = true;
    }

    // 7-day EMA alpha = 2/(7+1) = 0.25
    currentEma = Math.round(0.25 * count + 0.75 * currentEma);

    points.push({
      date: dateStr,
      count,
      ema7: currentEma,
      isSpike,
    });
  }
  return points;
}

// Helper to generate 14-day forecasts with 80% & 95% confidence intervals
function generateForecast(lastHistorical: number, trendSlope: number) {
  const points = [];
  const baseDate = new Date('2026-10-26T00:00:00Z');
  let current = lastHistorical;

  for (let i = 1; i <= 14; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // baseline simple moving average / naive drift
    const baseline = Math.round(lastHistorical * (1 + 0.005 * i));
    
    // Holt-Winters damped statistical trend
    current = current * (1 + trendSlope * Math.pow(0.96, i));
    const hw = Math.round(current);

    // uncertainty expands with forecast horizon sqrt(h)
    const stdErr = Math.sqrt(i) * (hw * 0.045);
    const upper80 = Math.round(hw + 1.28 * stdErr);
    const lower80 = Math.max(10, Math.round(hw - 1.28 * stdErr));
    const upper95 = Math.round(hw + 1.96 * stdErr);
    const lower95 = Math.max(5, Math.round(hw - 1.96 * stdErr));

    points.push({
      date: dateStr,
      baseline,
      holtWinters: hw,
      upper80,
      lower80,
      upper95,
      lower95,
    });
  }
  return points;
}

export const MOCK_TOPICS: Topic[] = [
  {
    id: 'agentic-state-machines',
    name: 'Hierarchical Agentic State Machines',
    tagline: 'Deterministic orchestration patterns for multi-turn autonomous AI agents',
    category: 'AI & ML',
    totalVolume: 42890,
    velocity: 84.6,
    acceleration: 22.4,
    burstinessRatio: 0.18,
    sustainabilityStatus: 'Emerging Inflection',
    confidenceScore: 92,
    description: 'A breakthrough architectural pattern bridging formal finite state automatons with non-deterministic LLM tool calls. Mentions in GitHub repositories and arXiv preprints have expanded 84% over 7 days.',
    historicalSeries: generateTimeSeries(800, 0.95, 0.08),
    forecastSeries: generateForecast(2200, 0.038),
    sources: [
      { name: 'arXiv cs.AI', url: 'https://arxiv.org/abs/example', count: 184 },
      { name: 'GitHub Repositories', url: 'https://github.com/search?q=agentic+state', count: 2840 },
      { name: 'Hacker News Discussions', url: 'https://news.ycombinator.com', count: 940 },
    ],
    isWatchlisted: true,
  },
  {
    id: 'post-quantum-tls',
    name: 'Hybrid Post-Quantum TLS 1.3',
    tagline: 'ML-KEM and X25519 hybrid key encapsulation in web infrastructure',
    category: 'Cloud & DevTools',
    totalVolume: 67320,
    velocity: 43.2,
    acceleration: 11.5,
    burstinessRatio: 0.12,
    sustainabilityStatus: 'Sustained Trend',
    confidenceScore: 89,
    description: 'Adoption of NIST-standardized quantum-resistant cryptographic key encapsulation across modern reverse proxies, browsers, and edge CDNs.',
    historicalSeries: generateTimeSeries(1500, 0.45, 0.05),
    forecastSeries: generateForecast(2600, 0.022),
    sources: [
      { name: 'IETF Standards Track', url: 'https://datatracker.ietf.org', count: 42 },
      { name: 'Cloudflare / AWS Devlogs', url: 'https://blog.cloudflare.com', count: 320 },
      { name: 'GitHub Commits', url: 'https://github.com', count: 4120 },
    ],
    isWatchlisted: true,
  },
  {
    id: 'ephemeral-model-leaks',
    name: 'Model Weights Leak Gossip',
    tagline: 'Unverified social media rumor regarding proprietary frontier model checkpoint',
    category: 'AI & ML',
    totalVolume: 89100,
    velocity: 310.5,
    acceleration: -45.0,
    burstinessRatio: 0.94,
    sustainabilityStatus: 'High Spike Risk',
    confidenceScore: 54,
    description: 'A classic viral spike driven by speculative social media threads. High volume concentrated within a 48-hour window followed by sharp negative acceleration.',
    historicalSeries: generateTimeSeries(400, 0.1, 0.15, 27),
    forecastSeries: generateForecast(3800, -0.06),
    sources: [
      { name: 'Social Aggregators', url: 'https://reddit.com/r/LocalLLaMA', count: 12400 },
      { name: 'Tech Blogs', url: 'https://techcrunch.com', count: 18 },
    ],
    isWatchlisted: false,
  },
  {
    id: 'zero-knowledge-rollups',
    name: 'Recursive ZK-Rollup Proof Verifiers',
    tagline: 'Ultra-low overhead validity proofs for distributed transaction settlement',
    category: 'Web3 & Fintech',
    totalVolume: 51200,
    velocity: 28.4,
    acceleration: 4.1,
    burstinessRatio: 0.15,
    sustainabilityStatus: 'Sustained Trend',
    confidenceScore: 85,
    description: 'Recursive SNARK and STARK circuits scaling EVM-compatible networks with deterministic verification costs.',
    historicalSeries: generateTimeSeries(1200, 0.3, 0.06),
    forecastSeries: generateForecast(1950, 0.015),
    sources: [
      { name: 'Ethereum Research', url: 'https://ethresear.ch', count: 85 },
      { name: 'GitHub Protocol Repos', url: 'https://github.com', count: 1890 },
    ],
    isWatchlisted: false,
  },
  {
    id: 'perovskite-tandem-cells',
    name: 'Perovskite-Silicon Tandem Photovoltaics',
    tagline: 'Laboratory certified commercial solar cells surpassing 33% power conversion efficiency',
    category: 'Climate & Energy',
    totalVolume: 34100,
    velocity: 52.8,
    acceleration: 18.2,
    burstinessRatio: 0.14,
    sustainabilityStatus: 'Emerging Inflection',
    confidenceScore: 91,
    description: 'Material science breakthrough resolving moisture degradation in commercial-scale tandem solar modules, with rapid academic citations and pilot plant deployments.',
    historicalSeries: generateTimeSeries(600, 0.6, 0.07),
    forecastSeries: generateForecast(1450, 0.028),
    sources: [
      { name: 'Nature Energy / Science', url: 'https://nature.com', count: 32 },
      { name: 'CleanTech Wire', url: 'https://cleantechwire.com', count: 410 },
    ],
    isWatchlisted: false,
  },
  {
    id: 'spatial-audio-codecs',
    name: 'Neural Real-Time Binaural Codecs',
    tagline: 'Sub-10ms spatial audio synthesis on edge mobile hardware',
    category: 'Cloud & DevTools',
    totalVolume: 21500,
    velocity: 14.2,
    acceleration: -2.1,
    burstinessRatio: 0.22,
    sustainabilityStatus: 'Plateaued',
    confidenceScore: 78,
    description: 'Edge-rendered spatial acoustics models experiencing stabilized adoption after initial developer SDK announcements.',
    historicalSeries: generateTimeSeries(700, 0.15, 0.09),
    forecastSeries: generateForecast(980, 0.005),
    sources: [
      { name: 'AES Audio Engineering Society', url: 'https://aes.org', count: 19 },
      { name: 'Developer Forums', url: 'https://forum.unity.com', count: 380 },
    ],
    isWatchlisted: false,
  },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    topicId: 'agentic-state-machines',
    topicName: 'Hierarchical Agentic State Machines',
    category: 'AI & ML',
    compositeScore: 94.2,
    velocityWeight: 0.40,
    momentumWeight: 0.25,
    affinityWeight: 0.35,
    reason: 'Exceptional 84.6% 7-day velocity combined with positive acceleration (+22.4) in your selected interest "AI & ML".',
    growthVelocity: 84.6,
  },
  {
    id: 'rec-2',
    topicId: 'perovskite-tandem-cells',
    topicName: 'Perovskite-Silicon Tandem Photovoltaics',
    category: 'Climate & Energy',
    compositeScore: 88.5,
    velocityWeight: 0.40,
    momentumWeight: 0.25,
    affinityWeight: 0.35,
    reason: 'Early inflection point detected with low noise ratio (0.14) and strong peer-reviewed citation momentum.',
    growthVelocity: 52.8,
  },
  {
    id: 'rec-3',
    topicId: 'post-quantum-tls',
    topicName: 'Hybrid Post-Quantum TLS 1.3',
    category: 'Cloud & DevTools',
    compositeScore: 82.1,
    velocityWeight: 0.40,
    momentumWeight: 0.25,
    affinityWeight: 0.35,
    reason: 'Sustained institutional adoption curve across global network infrastructure; low risk of ephemeral collapse.',
    growthVelocity: 43.2,
  },
];
