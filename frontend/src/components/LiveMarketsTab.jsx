import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { api } from '../api';

export default function LiveMarketsTab({ onOpenOrderModal }) {
  const [marketOverview, setMarketOverview] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('TCS');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartInterval, setChartInterval] = useState('5m');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const fetchOverview = async () => {
    try {
      const data = await api.getLiveMarketOverview();
      setMarketOverview(data);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN') + ' IST');
    } catch (err) {
      console.error('Error fetching market overview:', err);
    }
  };

  const fetchStockDetails = async (symbol) => {
    try {
      setChartLoading(true);
      const [quote, chart] = await Promise.all([
        api.getLiveMarketQuote(symbol),
        api.getLiveMarketChart(symbol, chartInterval)
      ]);
      setSelectedQuote(quote);
      setChartData(chart);
      setSelectedSymbol(symbol);
    } catch (err) {
      console.error('Error fetching stock details:', err);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOverview();
      await fetchStockDetails('TCS');
      setLoading(false);
    };
    init();

    // High-frequency polling interval (every 3 seconds for live ticks)
    const intervalId = setInterval(() => {
      fetchOverview();
      if (selectedSymbol) {
        api.getLiveMarketQuote(selectedSymbol).then(q => setSelectedQuote(q)).catch(() => {});
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [selectedSymbol]);

  const handleIntervalChange = async (interval) => {
    setChartInterval(interval);
    setChartLoading(true);
    try {
      const chart = await api.getLiveMarketChart(selectedSymbol, interval);
      setChartData(chart);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 0) {
      try {
        const results = await api.searchMarketSymbols(q);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSymbol = (sym) => {
    setSearchQuery('');
    setSearchResults([]);
    fetchStockDetails(sym);
  };

  if (loading && !marketOverview) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-stone-600">Connecting to Live NSE / BSE Market Gateway...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* 1. Regulatory & Real Market Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-stone-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Live Indian Markets (NSE / BSE)</span>
            <span className="text-[10px] bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full font-mono">{lastRefreshed}</span>
          </div>
          <h2 className="text-xl font-black mt-1">Real-Time Market Depth & Execution Terminal</h2>
          <p className="text-xs text-stone-400 mt-0.5 max-w-xl">
            Live tick quotes routed via registered broker market data gateway. Direct execution into NSE order book.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchOverview}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold border border-stone-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ticks</span>
          </button>
        </div>
      </div>

      {/* 2. Major Indices Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketOverview?.indices?.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div 
              key={idx.symbol}
              className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition"
            >
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase">{idx.company_name}</span>
                <div className="text-2xl font-black text-stone-900 mt-0.5">
                  ₹{idx.last_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{isUp ? '+' : ''}{idx.change} ({isUp ? '+' : ''}{idx.change_pct}%)</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-stone-400 space-y-0.5">
                <div>H: ₹{idx.day_high.toLocaleString('en-IN')}</div>
                <div>L: ₹{idx.day_low.toLocaleString('en-IN')}</div>
                <span className="inline-block text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold uppercase">{idx.exchange}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Search and Quick Stock Picker */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm">
          <Search className="w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search NSE/BSE stocks (e.g. TCS, INFY, RELIANCE, HDFCBANK, TATAMOTORS)..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full text-xs font-semibold focus:outline-none bg-transparent text-stone-800 placeholder-stone-400"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
            {searchResults.map((item) => (
              <div 
                key={item.symbol}
                onClick={() => handleSelectSymbol(item.symbol)}
                className="px-4 py-3 hover:bg-stone-50 cursor-pointer flex items-center justify-between border-b border-stone-100 last:border-b-0"
              >
                <div>
                  <span className="font-bold text-xs text-stone-900">{item.symbol}</span>
                  <span className="text-[11px] text-stone-500 ml-2">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-stone-900">₹{item.last_price.toFixed(2)}</span>
                  <span className={`text-[10px] ml-2 font-bold ${item.change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.change_pct >= 0 ? '+' : ''}{item.change_pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Stock Live Chart & Market Depth Terminal */}
      {selectedQuote && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Column (2/3) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-stone-900">{selectedQuote.symbol}</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedQuote.exchange} EQ</span>
                  <span className="text-xs text-stone-500 font-semibold">{selectedQuote.company_name}</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-stone-900">₹{selectedQuote.last_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className={`text-sm font-bold flex items-center ${selectedQuote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedQuote.change >= 0 ? '▲ +' : '▼ '}{selectedQuote.change} ({selectedQuote.change >= 0 ? '+' : ''}{selectedQuote.change_pct}%)
                  </span>
                </div>
              </div>

              {/* Intervals & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
                  {['1m', '5m', '1d'].map((iv) => (
                    <button
                      key={iv}
                      onClick={() => handleIntervalChange(iv)}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        chartInterval === iv ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {iv.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onOpenOrderModal({ symbol: selectedQuote.symbol, type: 'BUY', price: selectedQuote.last_price })}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  BUY
                </button>
                <button
                  onClick={() => onOpenOrderModal({ symbol: selectedQuote.symbol, type: 'SELL', price: selectedQuote.last_price })}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/25 transition cursor-pointer"
                >
                  SELL
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full pt-2">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : chartData?.candles ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.candles}>
                    <defs>
                      <linearGradient id="marketColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedQuote.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedQuote.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede9" />
                    <XAxis dataKey="time" stroke="#a8a29e" fontSize={10} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#a8a29e" fontSize={10} tickLine={false} orientation="right" />
                    <Tooltip 
                      formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Price']}
                      contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke={selectedQuote.change >= 0 ? "#059669" : "#e11d48"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#marketColor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100 text-center">
              <div className="p-2 bg-stone-50 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Day High</span>
                <span className="text-xs font-black text-stone-800">₹{selectedQuote.day_high.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Day Low</span>
                <span className="text-xs font-black text-stone-800">₹{selectedQuote.day_low.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Prev Close</span>
                <span className="text-xs font-black text-stone-800">₹{selectedQuote.prev_close.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Volume</span>
                <span className="text-xs font-black text-stone-800">{(selectedQuote.volume / 100000).toFixed(2)} Lakhs</span>
              </div>
            </div>
          </div>

          {/* Market Depth Column (1/3) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-black text-stone-900">Level 2 Market Depth</h4>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">5 Depth</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {/* Bids */}
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase border-b border-emerald-100 pb-1 flex justify-between">
                  <span>Bid Price</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1.5">
                  {selectedQuote.depth?.bids?.map((bid, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-stone-700 hover:bg-emerald-50/50 rounded px-1">
                      <span className="text-emerald-600 font-bold">₹{bid.price.toFixed(2)}</span>
                      <span className="text-stone-500">{bid.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asks */}
              <div>
                <div className="text-[10px] font-bold text-rose-700 uppercase border-b border-rose-100 pb-1 flex justify-between">
                  <span>Ask Price</span>
                  <span>Qty</span>
                </div>
                <div className="space-y-1 mt-1.5">
                  {selectedQuote.depth?.asks?.map((ask, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-stone-700 hover:bg-rose-50/50 rounded px-1">
                      <span className="text-rose-600 font-bold">₹{ask.price.toFixed(2)}</span>
                      <span className="text-stone-500">{ask.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Broker Execution Callout */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Regulated Order Routing</span>
              </div>
              <p className="text-[10px] text-stone-500">
                Orders placed from this terminal route through your connected SEBI registered broker (Zerodha/Upstox/Angel One) directly into exchange settlement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Top Movers (Gainers & Losers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-stone-900">NSE Top Gainers Today</h4>
          </div>
          <div className="divide-y divide-stone-100">
            {marketOverview?.top_gainers?.map((stock) => (
              <div key={stock.symbol} className="py-2.5 flex items-center justify-between">
                <div>
                  <button 
                    onClick={() => handleSelectSymbol(stock.symbol)}
                    className="font-black text-xs text-stone-900 hover:text-emerald-600 transition cursor-pointer text-left block"
                  >
                    {stock.symbol}
                  </button>
                  <span className="text-[10px] text-stone-400">{stock.company_name}</span>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-stone-900">₹{stock.last_price.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-emerald-600">+{stock.change_pct}%</div>
                  </div>
                  <button
                    onClick={() => onOpenOrderModal({ symbol: stock.symbol, type: 'BUY', price: stock.last_price })}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[10px] rounded-lg transition cursor-pointer"
                  >
                    BUY
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-stone-900">NSE Top Losers Today</h4>
          </div>
          <div className="divide-y divide-stone-100">
            {marketOverview?.top_losers?.map((stock) => (
              <div key={stock.symbol} className="py-2.5 flex items-center justify-between">
                <div>
                  <button 
                    onClick={() => handleSelectSymbol(stock.symbol)}
                    className="font-black text-xs text-stone-900 hover:text-rose-600 transition cursor-pointer text-left block"
                  >
                    {stock.symbol}
                  </button>
                  <span className="text-[10px] text-stone-400">{stock.company_name}</span>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-stone-900">₹{stock.last_price.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-rose-600">{stock.change_pct}%</div>
                  </div>
                  <button
                    onClick={() => onOpenOrderModal({ symbol: stock.symbol, type: 'BUY', price: stock.last_price })}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 font-bold text-[10px] rounded-lg transition cursor-pointer"
                  >
                    BUY DIP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
