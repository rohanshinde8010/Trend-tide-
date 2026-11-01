import React from 'react';
import { TrendItem } from '../api';

interface TrendCardProps {
  trend: TrendItem;
  rankIndex?: number;
  onSelect: (trend: TrendItem) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (trend: TrendItem) => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  trend,
  rankIndex,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const displayRank = rankIndex !== undefined ? rankIndex + 1 : trend.rank;

  const getTrajectoryBadge = (trajectory: string) => {
    switch (trajectory) {
      case 'surging':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="material-symbols-outlined text-[13px] text-emerald-600">local_fire_department</span>
            Surging
          </span>
        );
      case 'rising':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="material-symbols-outlined text-[13px] text-sky-600">trending_up</span>
            Rising
          </span>
        );
      case 'peaking':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#9D00FF] border border-purple-200">
            <span className="material-symbols-outlined text-[13px] text-[#9D00FF]">change_circle</span>
            Peaking
          </span>
        );
      case 'steady':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="material-symbols-outlined text-[13px]">drag_handle</span>
            Steady
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#FE1D01] border border-red-200">
            <span className="material-symbols-outlined text-[13px] text-[#FE1D01]">trending_down</span>
            Declining
          </span>
        );
    }
  };

  const getRegionBadge = (region?: string) => {
    switch (region) {
      case 'us': return { flag: '🇺🇸', name: 'US' };
      case 'in': return { flag: '🇮🇳', name: 'India' };
      case 'uk': return { flag: '🇬🇧', name: 'UK' };
      case 'eu': return { flag: '🇪🇺', name: 'Europe' };
      case 'apac': return { flag: '🌏', name: 'APAC' };
      case 'latam': return { flag: '🌎', name: 'LatAm' };
      default: return { flag: '🌐', name: 'Worldwide' };
    }
  };

  return (
    <div
      onClick={() => onSelect(trend)}
      className="group relative bg-[#F4F7FA]/90 hover:bg-[#EEF3F8]/95 backdrop-blur-md border border-slate-300 hover:border-slate-400 rounded-2xl p-4.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md"
    >
      {/* Twitter/X-style Meta Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-slate-800 text-xs">
            #{displayRank}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-semibold text-slate-700 text-xs">
            {trend.domainName || 'General'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-[#E2E7EE] px-1.5 py-0.5 rounded border border-slate-300">
            <span>{getRegionBadge(trend.region).flag}</span>
            <span>{getRegionBadge(trend.region).name}</span>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-500">Trending</span>
          {trend.isBreaking && (
            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-red-50 text-[#FE1D01] border border-red-200 animate-pulse">
              Breaking
            </span>
          )}
        </div>

        {/* Action Controls - Uniform w-8 h-8 buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(trend)}
              title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                isBookmarked
                  ? 'text-[#9D00FF] bg-purple-50 border border-purple-200'
                  : 'text-slate-400 hover:text-[#9D00FF] hover:bg-[#E2E7EE]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isBookmarked ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>
          )}

          {trend.primarySourceUrl && (
            <a
              href={trend.primarySourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open verified source article"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-[#E2E7EE] transition"
            >
              <span className="material-symbols-outlined text-[17px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>

      {/* Prominent Hashtag & Headline */}
      <div className="mb-2.5">
        <h3 className="font-bold text-base text-slate-900 group-hover:text-[#9D00FF] transition-colors tracking-tight flex items-center gap-2">
          <span>{trend.hashtag}</span>
        </h3>
        <p className="text-sm font-semibold text-slate-700 line-clamp-1 mt-0.5">
          {trend.title}
        </p>
        {trend.summary && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {trend.summary}
          </p>
        )}
      </div>

      {/* Bottom Metrics Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-300/70 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Post/mention volume */}
          <span className="text-xs font-mono text-slate-500">
            {trend.volumeDisplay}
          </span>

          {/* Velocity Badge with Green */}
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-600">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +{trend.velocity}% velocity
          </span>

          {/* Trajectory */}
          {getTrajectoryBadge(trend.trajectory)}
        </div>

        {/* Source Attribution & AI Forecast CTA */}
        <div className="flex items-center gap-2.5">
          {trend.sourcePlatform === 'x' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-white bg-slate-900 px-2.5 py-0.5 rounded-lg font-semibold font-mono shadow-2xs">
              <span className="font-serif font-black">𝕏</span> Twitter Trend
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
              {trend.primarySource}
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#9D00FF] group-hover:underline">
            AI Forecast
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
};
