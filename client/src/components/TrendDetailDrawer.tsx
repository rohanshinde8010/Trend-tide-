import React, { useState, useEffect } from 'react';
import { TrendItem, TrendForecastResponse, fetchTrendDetail, fetchTrendForecast } from '../api';

interface TrendDetailDrawerProps {
  trendId: string | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (trend: TrendItem) => void;
}

export const TrendDetailDrawer: React.FC<TrendDetailDrawerProps> = ({
  trendId,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [trend, setTrend] = useState<TrendItem | null>(null);
  const [forecastData, setForecastData] = useState<TrendForecastResponse | null>(null);
  const [activeHorizon, setActiveHorizon] = useState<'h24' | 'd3' | 'd7'>('h24');
  const [isLoading, setIsLoading] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(50);

  useEffect(() => {
    if (!trendId) return;

    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchTrendDetail(trendId), fetchTrendForecast(trendId)])
      .then(([trendRes, forecastRes]) => {
        if (isMounted) {
          setTrend(trendRes);
          setForecastData(forecastRes);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load trend detail:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [trendId]);

  if (!trendId) return null;

  const currentHorizonData = forecastData?.forecast?.horizons
    ? forecastData.forecast.horizons[activeHorizon]
    : null;

  // Render SVG Sparkline / Forecast Chart on Light Gray Canvas
  const renderForecastChart = () => {
    if (!currentHorizonData || !currentHorizonData.forecast || currentHorizonData.forecast.length === 0) {
      return (
        <div className="h-44 flex flex-col items-center justify-center bg-[#EAEFF4] rounded-xl border border-slate-300 text-slate-500 text-xs">
          <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">query_stats</span>
          <span>Insufficient historical points to project this horizon.</span>
        </div>
      );
    }

    const histValues = forecastData?.forecast?.observedHistory?.values || [];
    const forecastVals = currentHorizonData.forecast;
    const upperVals = currentHorizonData.upperBound;
    const lowerVals = currentHorizonData.lowerBound;

    const allVals = [...histValues, ...forecastVals, ...upperVals, ...lowerVals];
    const minVal = Math.min(...allVals) * 0.95;
    const maxVal = Math.max(...allVals) * 1.05;
    const range = maxVal - minVal || 1;

    const width = 600;
    const height = 180;
    const padding = 20;

    const totalPoints = histValues.length + forecastVals.length;
    const stepX = (width - padding * 2) / (totalPoints - 1 || 1);

    // Historical Points
    const histPoints = histValues.map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
      return { x, y, val: v };
    });

    // Forecast Points
    const lastHist = histPoints[histPoints.length - 1];
    const fcPoints = [
      lastHist,
      ...forecastVals.map((v, i) => {
        const x = padding + (histValues.length + i) * stepX;
        const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
        return { x, y, val: v };
      }),
    ];

    const upperPoints = [
      lastHist,
      ...upperVals.map((v, i) => {
        const x = padding + (histValues.length + i) * stepX;
        const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
        return { x, y };
      }),
    ];

    const lowerPoints = [
      lastHist,
      ...lowerVals.map((v, i) => {
        const x = padding + (histValues.length + i) * stepX;
        const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
        return { x, y };
      }),
    ];

    const histPath = histPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const fcPath = fcPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

    const conePolygon = [
      ...upperPoints.map((p) => `${p.x},${p.y}`),
      ...lowerPoints.slice().reverse().map((p) => `${p.x},${p.y}`),
    ].join(' ');

    return (
      <div className="relative bg-[#EAEFF4] p-3 rounded-2xl border border-slate-300 shadow-2xs">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="coneGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#CBD5E1" strokeDasharray="3,3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#CBD5E1" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94A3B8" />

          {/* Vertical boundary */}
          {lastHist && (
            <line
              x1={lastHist.x}
              y1={padding}
              x2={lastHist.x}
              y2={height - padding}
              stroke="#94A3B8"
              strokeDasharray="4,4"
              strokeWidth="1.5"
            />
          )}

          {/* Uncertainty Cone (95% Interval) */}
          <polygon points={conePolygon} fill="url(#coneGradLight)" />

          {/* Historical Observed Series (Sky Blue) */}
          <path d={histPath} fill="none" stroke="#0284C7" strokeWidth="2.5" />

          {/* Forecast Series (Emerald Dashed) */}
          <path d={fcPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="5,4" />

          {/* Observed Points */}
          {histPoints.map((p, idx) => (
            <circle key={`hp-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
          ))}

          {/* Forecast Points */}
          {fcPoints.slice(1).map((p, idx) => (
            <circle key={`fp-${idx}`} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#0284C7] rounded"></span> Observed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#10B981] rounded border-b border-dashed"></span> AI Forecast
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xs"></span> 95% Confidence Cone
            </span>
          </div>
          <span className="font-mono text-emerald-600 font-bold text-xs">
            {currentHorizonData.projectedChangePct >= 0 ? '+' : ''}
            {currentHorizonData.projectedChangePct}% shift
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#F4F7FA] border-l border-slate-300 h-full flex flex-col shadow-2xl overflow-y-auto animate-slideInRight text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-[#EBF0F5]/95 backdrop-blur-xl border-b border-slate-300 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E2E7EE] text-slate-700 border border-slate-300">
              {trend?.domainName || 'Domain Feed'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#E2E7EE] text-slate-800 border border-slate-300 flex items-center gap-1">
              <span>{trend?.region === 'us' ? '🇺🇸' : trend?.region === 'in' ? '🇮🇳' : trend?.region === 'uk' ? '🇬🇧' : trend?.region === 'eu' ? '🇪🇺' : trend?.region === 'apac' ? '🌏' : trend?.region === 'latam' ? '🌎' : '🌐'}</span>
              <span>{trend?.region === 'us' ? 'United States' : trend?.region === 'in' ? 'India' : trend?.region === 'uk' ? 'United Kingdom' : trend?.region === 'eu' ? 'Europe' : trend?.region === 'apac' ? 'Asia-Pacific' : trend?.region === 'latam' ? 'Latin America' : 'Worldwide'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              Rank #{trend?.rank || 1}
            </span>
            {trend?.isBreaking && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-50 text-[#FE1D01] border border-red-200 animate-pulse">
                Breaking News
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {trend && onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(trend)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  isBookmarked
                    ? 'text-[#9D00FF] bg-purple-50 border border-purple-200'
                    : 'text-slate-500 hover:text-slate-900 bg-[#E2E7EE] hover:bg-[#D9DFE7] border border-slate-300'
                }`}
                title="Bookmark to Watchlist"
              >
                <span className="material-symbols-outlined text-[19px]">
                  {isBookmarked ? 'bookmark_added' : 'bookmark_add'}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 bg-[#E2E7EE] hover:bg-[#D9DFE7] border border-slate-300 transition"
              title="Close drawer"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-4xl text-[#9D00FF] animate-spin">sync</span>
            <span className="text-xs font-mono text-slate-600">Running Holt-Winters Mathematical Forecaster...</span>
          </div>
        ) : trend ? (
          <div className="p-6 flex flex-col gap-6">
            {/* Title & Primary Attribution */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {trend.hashtag}
              </h2>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {trend.title}
              </p>
              {trend.summary && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {trend.summary}
                </p>
              )}

              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>Primary Source:</span>
                <span className="font-semibold text-slate-800">{trend.primarySource}</span>
                {trend.primarySourceUrl && (
                  <a
                    href={trend.primarySourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-[#9D00FF] hover:underline text-xs font-semibold"
                  >
                    Open Source
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>

            {/* Analytics Metric Cards - Uniform heights and styling */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Estimated Volume</span>
                <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  {trend.volumeDisplay}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Velocity Surge</span>
                <p className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                  +{trend.velocity}% / hr
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Acceleration</span>
                <p className="text-sm font-bold text-sky-600 font-mono mt-0.5">
                  {trend.acceleration > 0 ? '+' : ''}
                  {trend.acceleration} d²Y/dt²
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Sentiment Score</span>
                <p className="text-sm font-bold text-[#9D00FF] font-mono mt-0.5">
                  {trend.sentimentScore > 0 ? '+' : ''}
                  {trend.sentimentScore}
                </p>
              </div>
            </div>

            {/* AI Trend Forecasting Section */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4.5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9D00FF] text-xl">insights</span>
                  <h3 className="text-sm font-bold text-slate-900">AI Trend Forecasting</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-[#9D00FF] border border-purple-200">
                    Holt-Winters Linear
                  </span>
                </div>

                {/* Horizon Toggle - Uniform h-7.5 buttons */}
                <div className="flex items-center bg-[#E2E7EE] p-0.5 rounded-xl border border-slate-300">
                  <button
                    onClick={() => setActiveHorizon('h24')}
                    className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition ${
                      activeHorizon === 'h24'
                        ? 'bg-[#F4F7FA] text-slate-900 shadow-2xs font-bold border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    24 Hours
                  </button>
                  <button
                    onClick={() => setActiveHorizon('d3')}
                    className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition ${
                      activeHorizon === 'd3'
                        ? 'bg-[#F4F7FA] text-slate-900 shadow-2xs font-bold border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3 Days
                  </button>
                  <button
                    onClick={() => setActiveHorizon('d7')}
                    className={`h-7.5 px-3 rounded-lg text-xs font-semibold transition ${
                      activeHorizon === 'd7'
                        ? 'bg-[#F4F7FA] text-slate-900 shadow-2xs font-bold border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    7 Days
                  </button>
                </div>
              </div>

              {/* Status and Confidence */}
              {forecastData?.forecast && (
                <div className="flex items-center justify-between text-xs text-slate-700 bg-[#EAEFF4] p-2.5 rounded-xl border border-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Trajectory:</span>
                    <span className="font-bold text-emerald-700">
                      {forecastData.forecast.analysis?.trajectoryLabel || trend.trajectory}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="text-[#9D00FF] font-bold">
                      {Math.round((forecastData.forecast.confidenceScore || 0.9) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Visual Forecast Chart */}
              {renderForecastChart()}

              {/* AI Narrative Analysis */}
              {forecastData?.forecast?.analysis?.aiRationale && (
                <p className="text-xs text-slate-600 leading-relaxed bg-[#EAEFF4] p-3 rounded-xl border border-slate-300">
                  <span className="font-bold text-[#9D00FF] mr-1">AI Rationale:</span>
                  {forecastData.forecast.analysis.aiRationale}
                </p>
              )}
            </div>

            {/* Related News & Discussions */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-lg">newspaper</span>
                  <h3 className="text-sm font-bold text-slate-900">Related News & Discussions</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {trend.articles?.length || 0} citations
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {trend.articles && trend.articles.length > 0 ? (
                  trend.articles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-[#EAEFF4] hover:bg-[#E2E7EE] border border-slate-300 p-3.5 rounded-xl transition flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-[#9D00FF]">{art.sourceName}</span>
                        <span>{art.publishedAt}</span>
                      </div>
                      <a
                        href={art.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-900 hover:text-[#9D00FF] transition line-clamp-2 mt-0.5 flex items-center justify-between gap-2"
                      >
                        <span>{art.title}</span>
                        <span className="material-symbols-outlined text-[15px] shrink-0 text-slate-400">
                          open_in_new
                        </span>
                      </a>
                      {art.snippet && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {art.snippet}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No additional news articles linked.</p>
                )}
              </div>
            </div>

            {/* Alert Threshold Setting */}
            <div className="p-4 bg-[#EAEFF4] border border-slate-300 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">notifications_active</span>
                  Surge Alert Trigger
                </span>
                <span className="font-mono text-[#FE1D01] font-bold">+{alertThreshold}% Velocity</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full accent-[#9D00FF] cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                Receive proactive surge alerts when hourly trend velocity increases beyond this threshold.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
