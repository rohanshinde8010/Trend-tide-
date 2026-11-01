/**
 * TrendTide REST API Client & Multi-Domain Live Trends Data Models
 */
const API_BASE = '/api';

export interface Domain {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  orderIndex: number;
  trendCount: number;
}

export interface TrendArticle {
  id: number;
  trendId: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  snippet: string;
  platform: string;
}

export interface TrendHistoryPoint {
  id: number;
  trendId: string;
  timestamp: string;
  volume: number;
  velocity: number;
  popularityScore: number;
}

export interface TrendItem {
  id: string;
  domainId: string;
  domainName: string;
  hashtag: string;
  title: string;
  summary: string;
  rank: number;
  globalRank: number;
  volumeCount: number;
  volumeDisplay: string;
  velocity: number;
  acceleration: number;
  trajectory: 'surging' | 'rising' | 'peaking' | 'steady' | 'declining';
  sentimentScore: number;
  primarySource: string;
  primarySourceUrl?: string;
  sourcePlatform: 'news' | 'hackernews' | 'google_trends' | 'x' | 'reddit';
  region?: string;
  isBreaking: boolean;
  createdAt?: string;
  lastUpdated?: string;
  articleCount?: number;
  articles?: TrendArticle[];
  history?: TrendHistoryPoint[];
}

export interface RegionItem {
  id: string;
  name: string;
  flag: string;
  description: string;
}

export const DEFAULT_REGIONS: RegionItem[] = [
  { id: 'worldwide', name: 'Worldwide', flag: '🌐', description: 'Global Telemetry Aggregate' },
  { id: 'us', name: 'United States', flag: '🇺🇸', description: 'North America & Silicon Valley' },
  { id: 'eu', name: 'Europe', flag: '🇪🇺', description: 'European Union & Tech Hubs' },
  { id: 'in', name: 'India', flag: '🇮🇳', description: 'South Asia & Tech Ecosystem' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', description: 'London & British Innovation' },
  { id: 'apac', name: 'Asia-Pacific', flag: '🌏', description: 'East Asia, Japan & Oceania' },
  { id: 'latam', name: 'Latin America', flag: '🌎', description: 'Brazil, Mexico & LatAm Tech' },
];

export interface HorizonForecast {
  horizon: string;
  trajectory: string;
  trajectoryLabel: string;
  projectedChangePct: number;
  labels: string[];
  forecast: number[];
  upperBound: number[];
  lowerBound: number[];
}

export interface TrendForecastResponse {
  success: boolean;
  trendId: string;
  forecast: {
    status: 'success' | 'insufficient_data';
    message?: string;
    canForecast: boolean;
    hashtag: string;
    trendTitle: string;
    domain: string;
    confidenceScore: number;
    confidenceInterval: string;
    observedHistory?: {
      labels: string[];
      values: number[];
      velocities: number[];
    };
    horizons?: {
      h24: HorizonForecast;
      d3: HorizonForecast;
      d7: HorizonForecast;
    };
    analysis?: {
      trajectory: string;
      trajectoryLabel: string;
      sentimentTone: string;
      latestVelocity: number;
      latestAcceleration: number;
      aiRationale: string;
    };
  };
}

export interface DataSourceStatus {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'standby' | 'error';
  latencyMs: number;
  lastSynced?: string;
  active: boolean;
  authRequired: boolean;
  description: string;
  note?: string;
  domainsCovered: number;
}

export interface WatchlistItem {
  id: number;
  trendId: string;
  alertThreshold: number;
  hasSurgeAlert: boolean;
  createdAt: string;
  trend: TrendItem;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
}

// ----------------- DOMAIN & TREND API CALLS ----------------- //

export async function fetchDomains(): Promise<Domain[]> {
  const res = await fetch(`${API_BASE}/domains`);
  if (!res.ok) throw new Error('Failed to fetch domains');
  const data = await res.json();
  return data.domains || [];
}

export async function fetchRegions(): Promise<RegionItem[]> {
  try {
    const res = await fetch(`${API_BASE}/regions`);
    if (!res.ok) return DEFAULT_REGIONS;
    const data = await res.json();
    return data.regions || DEFAULT_REGIONS;
  } catch {
    return DEFAULT_REGIONS;
  }
}

export async function fetchLiveTrends(params?: {
  sort?: 'ranked' | 'velocity' | 'volume' | 'breaking';
  domain?: string;
  platform?: 'x' | 'news' | 'hackernews' | 'all';
  region?: string;
  limit?: number;
}): Promise<{ total: number; region?: string; spotlight: TrendItem | null; trends: TrendItem[]; lastUpdated: string }> {
  const searchParams = new URLSearchParams();
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.domain) searchParams.set('domain', params.domain);
  if (params?.platform && params.platform !== 'all') searchParams.set('platform', params.platform);
  if (params?.region && params.region !== 'all') searchParams.set('region', params.region);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/trends/live?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch live trends');
  return await res.json();
}

export async function fetchXTrends(limit?: number): Promise<{
  count: number;
  platform: string;
  trends: TrendItem[];
  lastUpdated: string;
}> {
  const res = await fetch(`${API_BASE}/trends/x?limit=${limit || 50}`);
  if (!res.ok) throw new Error('Failed to fetch Twitter/X trends');
  return await res.json();
}

export async function fetchDomainTrends(domainId: string): Promise<{
  domain: Domain;
  trends: TrendItem[];
  lastUpdated: string;
}> {
  const res = await fetch(`${API_BASE}/trends/domain/${domainId}`);
  if (!res.ok) throw new Error(`Failed to fetch trends for domain: ${domainId}`);
  return await res.json();
}

export async function fetchTrendDetail(trendId: string): Promise<TrendItem> {
  const res = await fetch(`${API_BASE}/trends/${trendId}`);
  if (!res.ok) throw new Error(`Failed to fetch trend details for: ${trendId}`);
  const data = await res.json();
  return data.trend;
}

export async function fetchTrendForecast(trendId: string): Promise<TrendForecastResponse> {
  const res = await fetch(`${API_BASE}/trends/${trendId}/forecast`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for: ${trendId}`);
  return await res.json();
}

export async function searchTrends(query: string, domain?: string): Promise<TrendItem[]> {
  const searchParams = new URLSearchParams({ q: query });
  if (domain && domain !== 'all') searchParams.set('domain', domain);

  const res = await fetch(`${API_BASE}/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.results || [];
}

// ----------------- WATCHLIST & ALERTS API CALLS ----------------- //

export async function fetchUserWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch(`${API_BASE}/watchlist`, {
    credentials: 'include'
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to fetch watchlist');
  }
  const data = await res.json();
  return data.watchlist || [];
}

export async function toggleWatchlist(trendId: string, alertThreshold: number = 50.0): Promise<{ action: 'added' | 'removed'; following: boolean }> {
  const res = await fetch(`${API_BASE}/watchlist/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ trendId, alertThreshold })
  });
  if (!res.ok) throw new Error('Failed to toggle watchlist');
  return await res.json();
}

// ----------------- SOURCES & REFRESH CALLS ----------------- //

export async function fetchSourcesStatus(): Promise<{
  sources: DataSourceStatus[];
  activeCount: number;
  totalCount: number;
  timestamp: string;
}> {
  const res = await fetch(`${API_BASE}/sources/status`);
  if (!res.ok) throw new Error('Failed to fetch sources status');
  return await res.json();
}

export async function refreshLiveTrends(): Promise<{ success: boolean; data: any; message: string }> {
  const res = await fetch(`${API_BASE}/trends/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to trigger live refresh');
  return await res.json();
}

// ----------------- AUTHENTICATION API CALLS ----------------- //

export async function loginUser(
  emailOrObj: string | { email: string; password: string },
  maybePassword?: string
): Promise<AuthResponse> {
  const credentials =
    typeof emailOrObj === 'string'
      ? { email: emailOrObj, password: maybePassword || '' }
      : emailOrObj;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  return await res.json();
}

export async function registerUser(
  nameOrObj: string | { name: string; email: string; password: string; confirmPassword: string },
  maybeEmail?: string,
  maybePassword?: string,
  maybeConfirmPassword?: string
): Promise<AuthResponse> {
  const userData =
    typeof nameOrObj === 'string'
      ? {
          name: nameOrObj,
          email: maybeEmail || '',
          password: maybePassword || '',
          confirmPassword: maybeConfirmPassword || '',
        }
      : nameOrObj;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return await res.json();
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Unauthorized');
  const data = await res.json();
  return data.user;
}

export async function verifyEmail(
  tokenOrPayload: string | { token?: string; code?: string; email?: string }
): Promise<AuthResponse> {
  const payload = typeof tokenOrPayload === 'string'
    ? { token: tokenOrPayload }
    : tokenOrPayload;

  const res = await fetch(`${API_BASE}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function resendVerificationEmail(email: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  return await res.json();
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Could not end the session.');
}
