import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { TrendItem, Domain, searchTrends, fetchDomains, fetchLiveTrends, toggleWatchlist, fetchUserWatchlist } from '../api';
import { TrendCard } from '../components/TrendCard';
import { TrendDetailDrawer } from '../components/TrendDetailDrawer';

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { currentRegion, regions, currentRegionMeta, setCurrentRegion } = useRegion();

  const [query, setQuery] = useState(initialQuery);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [results, setResults] = useState<TrendItem[]>([]);
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchDomains().then(setDomains).catch(console.error);
    fetchUserWatchlist()
      .then((items) => setBookmarkedIds(new Set(items.map((i) => i.trendId))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsSearching(true);

    if (query.trim()) {
      searchTrends(query.trim(), selectedDomain)
        .then((items) => {
          if (isMounted) {
            let filtered = items;
            if (currentRegion !== 'worldwide') {
              filtered = items.filter(
                (t) => !t.region || t.region === currentRegion || t.region === 'worldwide'
              );
            }
            setResults(filtered);
            setIsSearching(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setIsSearching(false);
        });
    } else {
      fetchLiveTrends({
        domain: selectedDomain !== 'all' ? selectedDomain : undefined,
        region: currentRegion,
        limit: 40,
      })
        .then((res) => {
          if (isMounted) {
            setResults(res.trends);
            setIsSearching(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setIsSearching(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [query, selectedDomain, currentRegion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  const handleToggleBookmark = async (trend: TrendItem) => {
    try {
      const res = await toggleWatchlist(trend.id);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (res.action === 'added') next.add(trend.id);
        else next.delete(trend.id);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header and Search Bar Card */}
      <div className="bg-[#F4F7FA]/90 backdrop-blur-md border border-slate-300/90 rounded-2xl p-6 shadow-2xs flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9D00FF]">search</span>
            Search & Explore Multi-Domain Trends
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Discover real-time momentum, entity hashtags, and AI forecasts for any subject across all 10 domains.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-500 text-xl">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any keyword (e.g. OpenAI, Bitcoin, Formula 1, Ransomware, SpaceX, Luka)..."
            className="w-full h-11 pl-11 pr-24 bg-[#E2E7EE] hover:bg-[#D9DFE7] focus:bg-[#F0F3F7] border border-slate-300 focus:border-[#9D00FF] focus:ring-1 focus:ring-[#9D00FF] rounded-xl text-slate-900 placeholder:text-slate-500 text-sm transition shadow-2xs outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </form>

        {/* Domain Filter Pills - Uniform h-8 buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Domain:</span>
          <button
            onClick={() => setSelectedDomain('all')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedDomain === 'all'
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
            }`}
          >
            All Domains
          </button>
          {domains.map((dom) => (
            <button
              key={dom.id}
              onClick={() => setSelectedDomain(dom.id)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedDomain === dom.id
                  ? 'bg-[#9D00FF] text-white font-bold shadow-xs'
                  : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
              }`}
            >
              {dom.name}
            </button>
          ))}
        </div>

        {/* Region Scope Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#9D00FF]">public</span>
            Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setCurrentRegion(reg.id)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                currentRegion === reg.id
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 border border-slate-300'
              }`}
              title={reg.description}
            >
              <span>{reg.flag}</span>
              <span>{reg.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
        <span>
          {query ? `Showing results for "${query}"` : 'Trending Now Across Domains'}
        </span>
        <span className="text-[#9D00FF] font-bold">
          {results.length} matches found
        </span>
      </div>

      {/* Search Results List */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <span className="material-symbols-outlined text-4xl text-[#9D00FF] animate-spin">sync</span>
          <span className="text-xs font-mono text-slate-600">Querying live multi-domain catalog...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-3">
          {results.map((t, idx) => (
            <TrendCard
              key={t.id}
              trend={t}
              rankIndex={idx}
              onSelect={(trend) => setSelectedTrendId(trend.id)}
              isBookmarked={bookmarkedIds.has(t.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#F4F7FA] border border-slate-300 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
          <p className="text-sm font-semibold text-slate-800">No trend matches for "{query}".</p>
          <p className="text-xs text-slate-500">Try searching for broader keywords or selecting 'All Domains'.</p>
        </div>
      )}

      {/* Trend Detail Drawer */}
      <TrendDetailDrawer
        trendId={selectedTrendId}
        onClose={() => setSelectedTrendId(null)}
        isBookmarked={selectedTrendId ? bookmarkedIds.has(selectedTrendId) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
};
