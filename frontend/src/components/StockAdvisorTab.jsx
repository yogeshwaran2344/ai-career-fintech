import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Target,
  Zap,
  RefreshCw,
  Sliders,
  DollarSign,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  BarChart3
} from 'lucide-react';
import { api } from '../api';

const SECTOR_FILTERS = [
  'ALL',
  'Technology & AI',
  'Banking & Finance',
  'Renewable Energy & Power',
  'Automotive & EV',
  'FMCG & Consumer',
  'Healthcare & Pharma',
  'Infrastructure & Logistics',
  'Aerospace & Defense',
  'New-Age Fintech & Tech'
];

export default function StockAdvisorTab({ onOpenOrderModal, brokerStatus, clearanceState, clearanceReason }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL', 'TOP_PICKS', 'HIGH_GROWTH', 'DEFENSIVE'
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchRecommendations = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await api.getAiStockRecommendations();
      setData(res);
    } catch (err) {
      console.error('Error fetching AI stock recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // Auto-refresh quotes every 4 seconds for live ticks
    const intervalId = setInterval(() => {
      fetchRecommendations(false);
    }, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const allRecommendations = data?.all_recommendations || [];

  const filteredStocks = allRecommendations.filter(stock => {
    const query = searchQuery.trim().toLowerCase();
    const symbol = (stock.symbol || '').toLowerCase();
    const name = (stock.company_name || stock.name || '').toLowerCase();
    const sector = (stock.sector || '').toLowerCase();

    const matchesSearch = !query || symbol.includes(query) || name.includes(query) || sector.includes(query);

    const matchesSector = 
      selectedSector === 'ALL' || 
      stock.sector.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(stock.sector.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'TOP_PICKS') {
      matchesCategory = stock.is_top_pick || (data?.top_student_picks || []).some(tp => tp.symbol === stock.symbol);
    } else if (selectedCategory === 'HIGH_GROWTH') {
      matchesCategory = (data?.high_growth_picks || []).some(hg => hg.symbol === stock.symbol) || stock.risk_level === 'HIGH GROWTH' || (stock.potential_upside_pct || 0) >= 20;
    } else if (selectedCategory === 'DEFENSIVE') {
      matchesCategory = (data?.defensive_picks || []).some(df => df.symbol === stock.symbol) || stock.risk_level === 'LOW' || stock.risk_level === 'MODERATE';
    }

    return matchesSearch && matchesSector && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* Hero AI Thesis Header */}
      <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white p-6 md:p-8 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Stock Recommendation Engine</span>
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live NSE Execution</span>
              </span>
            </div>

            <button
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Live Ratings</span>
            </button>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Which Company to Invest In & Why</span>
              <span className="text-sm font-semibold text-indigo-300 px-3 py-1 bg-indigo-900/50 rounded-xl border border-indigo-700/50">
                {allRecommendations.length} Listed Companies Analyzed
              </span>
            </h2>
            <p className="text-xs md:text-sm text-stone-300 mt-2 max-w-3xl leading-relaxed">
              {data?.advisor_summary || 
                'Institutional-grade equity analysis for students. Each recommendation evaluates earnings momentum, competitive moats, valuation multiples, and suitability for student portfolios.'}
            </p>
          </div>

          {/* Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-indigo-200 uppercase font-black tracking-wider block">Market Outlook</span>
              <span className="text-sm font-black text-white mt-0.5 block">
                {data?.market_sentiment || 'BULLISH COMPOUNDING (NSE NIFTY 50)'}
              </span>
              <span className="text-[10px] text-stone-400">Institutional FII/DII Inflows</span>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-emerald-200 uppercase font-black tracking-wider block">Connected Broker OMS</span>
              <span className="text-sm font-black text-white mt-0.5 block">
                {brokerStatus?.broker_name || 'Groww Direct'} ({brokerStatus?.account_id || 'GROWW-9421'})
              </span>
              <span className="text-[10px] text-emerald-400">Direct Live Routing • Zero Demo</span>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-amber-200 uppercase font-black tracking-wider block">Investment Safety Status</span>
              <span className={`text-sm font-black mt-0.5 block ${clearanceState === 'BLOCKED' ? 'text-amber-300' : 'text-emerald-400'}`}>
                {data?.investment_clearance_status || (clearanceState === 'BLOCKED' ? '⚠️ Emergency Gate Recommended' : '✅ Clear for Live Equity Allocation')}
              </span>
              <span className="text-[10px] text-stone-400 truncate block">
                {clearanceReason ? clearanceReason.slice(0, 50) + '...' : 'SEBI-aligned 5-gate financial health check'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 AI Picks Highlight Reel */}
      {data?.top_student_picks && data.top_student_picks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-stone-900">Top High-Conviction Picks for Student Portfolios</h3>
              <span className="text-xs text-stone-500">Curated by AI for multi-year capital compounding</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.top_student_picks.slice(0, 3).map((pick, idx) => (
              <div 
                key={pick.symbol}
                className="bg-white rounded-3xl border-2 border-indigo-100 hover:border-indigo-400 shadow-md p-5 transition-all relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          #{idx + 1} Conviction
                        </span>
                        <span className="text-[10px] font-bold text-stone-400">
                          {pick.confidence_score ? `${pick.confidence_score}% Confidence` : ''}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-stone-900 mt-1">{pick.symbol}</h4>
                      <p className="text-xs text-stone-600 font-semibold truncate max-w-[200px]">{pick.company_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-stone-900 block">₹{pick.current_price?.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Target: ₹{pick.target_price?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Upside Badge */}
                  <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">Target Upside:</span>
                    <span className="font-black text-emerald-900">+{pick.potential_upside_pct}% Upside</span>
                  </div>

                  {/* Why Invest Excerpt */}
                  <div className="text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl border border-stone-200/80 leading-relaxed space-y-1">
                    <strong className="text-stone-900 block text-[11px] uppercase tracking-wider">💡 Why Invest:</strong>
                    <p className="line-clamp-3">{pick.why_invest}</p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100">
                  <button
                    onClick={() => onOpenOrderModal({
                      symbol: pick.symbol,
                      company: pick.company_name,
                      price: pick.current_price,
                      type: 'BUY'
                    })}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Invest in {pick.symbol} Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search all companies by ticker (e.g., TCS, INFY, TATAMOTORS, ZOMATO, HDFCBANK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl focus:outline-indigo-500 text-stone-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: `All Companies (${allRecommendations.length})` },
              { id: 'TOP_PICKS', label: '🌟 AI Top Picks' },
              { id: 'HIGH_GROWTH', label: '🚀 High Growth (>20%)' },
              { id: 'DEFENSIVE', label: '🛡️ Defensive Compounders' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mr-1 shrink-0">Sectors:</span>
          {SECTOR_FILTERS.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedSector === sec
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Main Companies Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-stone-500 font-bold">
            Showing <strong className="text-stone-900">{filteredStocks.length}</strong> of {allRecommendations.length} companies to invest in
          </div>
        </div>

        {filteredStocks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
            <Search className="w-8 h-8 text-stone-300 mx-auto" />
            <h4 className="text-base font-black text-stone-700">No companies found matching "{searchQuery}"</h4>
            <p className="text-xs text-stone-500">Try clearing your search filter or selecting another sector.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredStocks.map(stock => {
              const isExpanded = expandedCard === stock.symbol;

              return (
                <div 
                  key={stock.symbol}
                  className="bg-white rounded-3xl border border-stone-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all p-5 space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-stone-900">{stock.symbol}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          {stock.sector}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          stock.recommendation === 'STRONG BUY' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : stock.recommendation === 'MODERATE BUY'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {stock.recommendation}
                        </span>
                        {stock.is_top_pick && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            ★ Top Student Pick
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-stone-700 mt-1">{stock.company_name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-stone-900 block">₹{stock.current_price?.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-600 block">
                        Target: ₹{stock.target_price?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Target & Financial Snapshot */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">Potential Upside</span>
                      <span className="font-black text-emerald-600">+{stock.potential_upside_pct}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">Risk / Style</span>
                      <span className="font-bold text-stone-800">{stock.risk_level || stock.market_cap_category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">Valuation (P/E)</span>
                      <span className="font-bold text-stone-700">
                        {stock.key_metrics?.pe ? `${stock.key_metrics.pe}x` : 'Fair Value'}
                      </span>
                    </div>
                  </div>

                  {/* WHY INVEST: THE MAIN REASONING */}
                  <div className="space-y-2">
                    <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-stone-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-black">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Why Invest in {stock.symbol}:</span>
                      </div>
                      <p className="text-xs leading-relaxed text-stone-700">
                        {stock.why_invest}
                      </p>
                    </div>

                    {/* Student Suitability */}
                    <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/70 text-xs text-stone-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px]">
                        <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                        <span>Why This Fits Your Profile:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-stone-700">
                        {stock.student_suitability}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Fundamental Catalysts */}
                  {isExpanded && (
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2 animate-fade-in">
                      <span className="font-black text-stone-900 block text-[11px] uppercase tracking-wider">
                        🚀 Key Catalysts & Fundamental Growth Drivers:
                      </span>
                      <ul className="space-y-1.5 text-stone-600">
                        {(stock.fundamental_catalysts || []).map((cat, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold mt-0.5">•</span>
                            <span className="leading-snug">{cat}</span>
                          </li>
                        ))}
                      </ul>

                      {stock.key_metrics && (
                        <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-200 flex flex-wrap gap-x-4 gap-y-1">
                          {stock.key_metrics.roe_pct && <span>ROE: <strong className="text-stone-700">{stock.key_metrics.roe_pct}%</strong></span>}
                          {stock.key_metrics.roce_pct && <span>ROCE: <strong className="text-stone-700">{stock.key_metrics.roce_pct}%</strong></span>}
                          {stock.key_metrics['3yr_cagr'] && <span>3Yr CAGR: <strong className="text-emerald-700">{stock.key_metrics['3yr_cagr']}%</strong></span>}
                          {stock.key_metrics.div_yield !== undefined && <span>Div Yield: <strong className="text-stone-700">{stock.key_metrics.div_yield}%</strong></span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedCard(isExpanded ? null : stock.symbol)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Less Details</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>View Catalysts & Metrics</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenOrderModal({
                        symbol: stock.symbol,
                        company: stock.company_name,
                        price: stock.current_price,
                        type: 'BUY'
                      })}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm shadow-emerald-600/25 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Invest in {stock.symbol}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
