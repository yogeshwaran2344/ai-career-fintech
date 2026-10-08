import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  DollarSign, 
  Compass, 
  Search, 
  Filter, 
  Info, 
  Play, 
  Pause, 
  RefreshCw,
  BarChart3,
  HelpCircle,
  Shield,
  Layers,
  Award,
  ChevronRight,
  ExternalLink,
  Target,
  Sliders,
  QrCode,
  Smartphone,
  CreditCard,
  Check,
  Building,
  Cpu,
  ArrowRight,
  Download,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import confetti from 'canvas-confetti';
import { api } from '../api';
import LiveMarketsTab from './LiveMarketsTab';
import BrokerConnectModal from './BrokerConnectModal';
import BrokerOrderModal from './BrokerOrderModal';
import SafeUpiMandateModal from './SafeUpiMandateModal';
import RealAiWealthAuditTab from './RealAiWealthAuditTab';
import OrdersLedgerTab from './OrdersLedgerTab';
import CareerVsInvestmentTab from './CareerVsInvestmentTab';
import FinancialSafetyTab from './FinancialSafetyTab';
import StockAdvisorTab from './StockAdvisorTab';

const TrendingUpIcon = TrendingUp;
const WalletIcon = Wallet;
const PiggyBankIcon = PiggyBank;
const ShieldCheckIcon = ShieldCheck;
const ZapIcon = Zap;
const AlertTriangleIcon = AlertTriangle;
const SparklesIcon = Sparkles;
const CheckCircle2Icon = CheckCircle2;
const QrCodeIcon = QrCode;
const SmartphoneIcon = Smartphone;
const CreditCardIcon = CreditCard;
const CheckIcon = Check;
const BuildingIcon = Building;
const CpuIcon = Cpu;
const InfoIcon = Info;
const LayersIcon = Layers;

export default function InvestmentView({ profile }) {
  const [activeSubTab, setActiveSubTab] = useState('stockadvisor'); // 'stockadvisor', 'livemarket', 'broker', 'portfolio', 'realai', 'invest', 'goals', 'rules', 'safety', 'digitaltwin', 'scam', 'guide', 'orders', 'careervsinvest'
  const [executionEnvironment, setExecutionEnvironment] = useState('LIVE'); // Live Broker OMS
  const [investMode, setInvestMode] = useState('individual'); // 'individual' (Mode 1) or 'baskets' (Mode 2)
  const [individualFilter, setIndividualFilter] = useState('ALL');
  const [assetAmounts, setAssetAmounts] = useState({});
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Regulated Broker & Market Integration State
  const [brokerStatus, setBrokerStatus] = useState(null);
  const [brokerPortfolio, setBrokerPortfolio] = useState(null);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalParams, setOrderModalParams] = useState(null);
  const [isSafeUpiModalOpen, setIsSafeUpiModalOpen] = useState(false);
  const [safetyData, setSafetyData] = useState(null);

  // Multi-Company Basket Plans State
  const [basketAmount, setBasketAmount] = useState(2000);
  const [basketsData, setBasketsData] = useState(null);
  const [selectedBasketIndex, setSelectedBasketIndex] = useState(0);
  const [basketsLoading, setBasketsLoading] = useState(false);

  // Interactive Company Chart & GMP State
  const [selectedChartAsset, setSelectedChartAsset] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('6M'); // '1W', '1M', '3M', '6M', '1Y'
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  // UPI Payment Gateway State
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiTargetBasket, setUpiTargetBasket] = useState(null);
  const [upiTargetAsset, setUpiTargetAsset] = useState(null);
  const [upiMethod, setUpiMethod] = useState('GPAY'); // 'GPAY', 'PHONEPE', 'PAYTM', 'BHIM_UPI', 'QR_CODE'
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [upiStep, setUpiStep] = useState('METHOD_SELECT'); // 'METHOD_SELECT', 'PIN_CONFIRM', 'PROCESSING', 'SUCCESS'
  const [upiReceiptData, setUpiReceiptData] = useState(null);
  const [upiProcessing, setUpiProcessing] = useState(false);

  // Modals & Action States for single asset trading
  const [selectedAssetForTrade, setSelectedAssetForTrade] = useState(null);
  const [tradeAction, setTradeAction] = useState('BUY_LUMPSUM'); // 'BUY_LUMPSUM', 'START_SIP', 'SELL_ALL'
  const [tradeAmount, setTradeAmount] = useState(1000);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeNotification, setTradeNotification] = useState(null);

  // Goal Modals
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('TECH_HARDWARE');
  const [newGoalTarget, setNewGoalTarget] = useState(15000);
  const [newGoalDate, setNewGoalDate] = useState('2027-03-31');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState(null);
  const [depositAmount, setDepositAmount] = useState(1000);

  // Risk Quiz State
  const [riskAnswers, setRiskAnswers] = useState({
    market_drop_reaction: 'WAIT_AND_SEE',
    investment_horizon: 'LONG_5PLUS_YRS',
    primary_goal: 'BALANCED_GROWTH',
    emergency_fund_status: 'PARTIAL_1_2M'
  });
  const [riskResult, setRiskResult] = useState(null);

  // Opportunity Cost State
  const [oppAmount, setOppAmount] = useState(2000);
  const [oppResult, setOppResult] = useState(null);
  const [oppLoading, setOppLoading] = useState(false);

  // Scam Detector State
  const [scamPitch, setScamPitch] = useState('Guaranteed 30% monthly returns with zero risk! Join our VIP crypto and forex trading group.');
  const [scamResult, setScamResult] = useState(null);
  const [scamLoading, setScamLoading] = useState(false);

  // Digital Twin State
  const [digitalTwinData, setDigitalTwinData] = useState(null);

  // Global Escape Key Listener for Modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUpiModalOpen(false);
        setSelectedAssetForTrade(null);
        setIsCreateGoalOpen(false);
        setSelectedGoalForDeposit(null);
        setSelectedChartAsset(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCompanyChart = async (assetOrTicker, timeframe = '6M') => {
    try {
      const ticker = typeof assetOrTicker === 'string' ? assetOrTicker : (assetOrTicker.ticker || assetOrTicker.id);
      setSelectedChartAsset(typeof assetOrTicker === 'object' ? assetOrTicker : { ticker, name: ticker });
      setChartTimeframe(timeframe);
      setChartLoading(true);
      const data = await api.getCompanyChart(ticker, timeframe);
      setChartData(data);
    } catch (err) {
      console.error('Error loading company chart:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleTimeframeChange = async (tf) => {
    if (!selectedChartAsset) return;
    setChartTimeframe(tf);
    try {
      setChartLoading(true);
      const ticker = selectedChartAsset.ticker || selectedChartAsset.id;
      const data = await api.getCompanyChart(ticker, tf);
      setChartData(data);
    } catch (err) {
      console.error('Error changing timeframe:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchBrokerDetails = async () => {
    try {
      const [status, port] = await Promise.all([
        api.getBrokerStatus(),
        api.getBrokerPortfolio()
      ]);
      setBrokerStatus(status);
      setBrokerPortfolio(port);
    } catch (err) {
      console.error('Error loading broker data:', err);
    }
  };

  useEffect(() => {
    fetchHubData();
    fetchBaskets(basketAmount);
    fetchBrokerDetails();
    fetchSafetyData();
  }, [profile]);

  const fetchSafetyData = async () => {
    try {
      const data = await api.getFinancialSafety();
      setSafetyData(data);
    } catch (err) {
      console.error('Error loading financial safety:', err);
    }
  };

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const data = await api.getWealthHub();
      setHubData(data);
    } catch (err) {
      console.error('Error loading wealth hub:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBaskets = async (amt = basketAmount) => {
    try {
      setBasketsLoading(true);
      const data = await api.getMultiCompanyBaskets(amt);
      setBasketsData(data);
    } catch (err) {
      console.error('Error loading multi-company baskets:', err);
    } finally {
      setBasketsLoading(false);
    }
  };

  const handleBasketAmountChange = (newAmt) => {
    setBasketAmount(newAmt);
    fetchBaskets(newAmt);
  };

  const handleSetAssetAmount = (assetId, amt) => {
    setAssetAmounts(prev => ({
      ...prev,
      [assetId]: amt
    }));
  };

  // Open UPI Gateway for Multi-Company Basket
  const handleOpenUpiForBasket = (basket) => {
    setUpiTargetBasket(basket);
    setUpiTargetAsset(null);
    setUpiStep('METHOD_SELECT');
    setUpiMethod('GPAY');
    setUpiPin('');
    setIsUpiModalOpen(true);
  };

  // Open UPI Gateway for Single Asset
  const handleOpenUpiForAsset = (asset, amt) => {
    const chosenAmt = amt || assetAmounts[asset.id] || 1000;
    setUpiTargetAsset({ ...asset, chosenAmount: chosenAmt });
    setUpiTargetBasket(null);
    setUpiStep('METHOD_SELECT');
    setUpiMethod('GPAY');
    setUpiPin('');
    setIsUpiModalOpen(true);
  };

  // Execute UPI Payment
  const handleConfirmUpiPayment = async () => {
    try {
      setUpiProcessing(true);
      setUpiStep('PROCESSING');

      const payload = {
        basket_id: upiTargetBasket ? upiTargetBasket.basket_id : null,
        asset_id: upiTargetAsset ? upiTargetAsset.id : null,
        payment_method: upiMethod,
        upi_id: upiIdInput.trim() || `${profile?.name?.toLowerCase()?.replace(/\s+/g, '') || 'student'}@okaxis`,
        amount_inr: upiTargetBasket ? upiTargetBasket.total_basket_cost_inr : (upiTargetAsset?.chosenAmount || 1000),
        investment_type: upiTargetBasket ? 'MULTI_COMPANY_BASKET' : 'INDIVIDUAL_ASSET'
      };

      // Simulate network latency for authentic bank handshake
      await new Promise(resolve => setTimeout(resolve, 1400));

      const res = await api.executeUpiPayment(payload);
      if (res.success) {
        setUpiReceiptData(res);
        setHubData(prev => ({ ...prev, portfolio: res.updated_portfolio }));
        setUpiStep('SUCCESS');
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        fetchHubData();
      }
    } catch (err) {
      console.error('UPI payment error:', err);
      alert('Payment execution failed: ' + (err.message || 'Network error'));
      setUpiStep('METHOD_SELECT');
    } finally {
      setUpiProcessing(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSavingsGoal({
        title: newGoalTitle,
        category: newGoalCategory,
        icon: newGoalIcon,
        target_amount_inr: parseFloat(newGoalTarget),
        target_date: newGoalDate,
        current_amount_inr: 0.0
      });
      if (res.success) {
        setHubData(prev => ({ ...prev, savings_goals: res.goals }));
        setIsCreateGoalOpen(false);
        setNewGoalTitle('');
        confetti({ particleCount: 40 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepositGoal = async () => {
    if (!selectedGoalForDeposit) return;
    try {
      const res = await api.depositSavingsGoal(selectedGoalForDeposit.id, parseFloat(depositAmount));
      if (res.success) {
        setHubData(prev => ({ ...prev, savings_goals: res.goals }));
        setSelectedGoalForDeposit(null);
        confetti({ particleCount: 40 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRule = async (ruleKey, currentActive) => {
    try {
      const res = await api.toggleSavingRule(ruleKey, !currentActive);
      if (res.success) {
        setHubData(prev => ({ ...prev, saving_rules: res.rules }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluateOpportunityCost = async (amt = oppAmount) => {
    try {
      setOppLoading(true);
      const res = await api.evaluateOpportunityCost(amt);
      setOppResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setOppLoading(false);
    }
  };

  const handleScanScam = async () => {
    try {
      setScamLoading(true);
      const res = await api.detectInvestmentScam(scamPitch);
      setScamResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setScamLoading(false);
    }
  };

  const loadDigitalTwin = async () => {
    try {
      const res = await api.get5YearDigitalTwin();
      setDigitalTwinData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'digitaltwin' && !digitalTwinData) {
      loadDigitalTwin();
    }
    if (activeSubTab === 'safety' && !oppResult) {
      handleEvaluateOpportunityCost(2000);
    }
  }, [activeSubTab]);

  const p = hubData?.portfolio;
  const readiness = hubData?.investment_readiness;
  const activeBasket = basketsData?.baskets?.[selectedBasketIndex] || basketsData?.baskets?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Main Banner with UPI Integration Highlight */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>NSE/BSE Telemetry (Educational Feed)</span>
              </span>
              <button 
                onClick={() => setIsBrokerModalOpen(true)}
                className="text-emerald-100 hover:text-white text-xs font-bold underline cursor-pointer"
              >
                {brokerStatus?.connected ? `🟢 Linked: ${brokerStatus.broker_name}` : '⚡ Connect Broker / Demat'}
              </button>
              
              {/* Live Broker Execution Badge */}
              <div className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-white/25 text-[10px] font-black text-white gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🔴 LIVE TRADING ENABLED • SEBI REGULATED BROKER OMS</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>Live Indian Markets & Regulated Wealth Execution</span>
              <SparklesIcon className="w-6 h-6 text-amber-300" />
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
              Real-time NSE/BSE ticks, pluggable broker custody (Groww, Zerodha, Upstox, Angel One, Dhan, Kotak Neo, ICICI Direct, HDFC Sky), safe NPCI UPI mandates, statutory tax breakdown, and AI Stock Advisor.
            </p>
          </div>

          {/* Quick Metrics Header Card */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <div className="text-right">
              <span className="text-[10px] text-emerald-200 font-bold uppercase block">
                {brokerPortfolio ? 'Live Broker Holdings' : 'Portfolio Value'}
              </span>
              <span className="text-2xl font-black text-white">
                ₹{(brokerPortfolio ? brokerPortfolio.total_portfolio_value : (p ? p.current_portfolio_value_inr : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-bold text-emerald-200 block">
                {brokerPortfolio 
                  ? `${brokerPortfolio.total_unrealized_pnl >= 0 ? '+' : ''}₹${brokerPortfolio.total_unrealized_pnl.toLocaleString('en-IN')} (${brokerPortfolio.total_pnl_pct}%)`
                  : `+₹${p ? p.total_returns_inr.toLocaleString('en-IN') : '0'} (+${p ? p.total_returns_pct : '0'}%)`}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-bold shadow-md">
              <TrendingUpIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Clearance: Limited State Banner */}
      {(safetyData?.investment_clearance_state === 'LIMITED' || safetyData?.investment_clearance_state === 'BLOCKED') && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 mt-0.5 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-amber-950 text-xs md:text-sm">
                  {safetyData.clearance_badge || '🔒 Investment Clearance: Limited'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Emergency reserve: ₹{safetyData.emergency_fund_current_inr?.toLocaleString('en-IN') || '2,000'} / ₹{(safetyData.emergency_recommended_target_inr || 12000).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Micro-Investing: Permitted up to ₹{safetyData.monthly_investment_cap || 500}/mo
                </span>
              </div>
              <p className="text-xs text-amber-900/90 font-medium mt-0.5 leading-relaxed max-w-3xl">
                Build at least ₹{(safetyData.emergency_recommended_target_inr || 12000).toLocaleString('en-IN')} before increasing equity exposure. 
                ₹{(safetyData.emergency_remaining_to_recommended || 10000).toLocaleString('en-IN')} remaining. 
                Your current reserve covers approximately {safetyData.runway_months || '0.33'} months of essential expenses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubTab('safety')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition shadow-xs whitespace-nowrap"
          >
            5-Gate Safety Audit →
          </button>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200 text-xs font-bold">
        {[
          { id: 'stockadvisor', label: '🧠 AI Stock Advisor (Which Company & Why)', icon: SparklesIcon },
          { id: 'livemarket', label: '📊 Live Markets (NSE/BSE)', icon: BarChart3 },
          { id: 'broker', label: '🏦 Connect Demat & Broker', icon: BuildingIcon },
          { id: 'portfolio', label: '💼 Live Broker Portfolio', icon: WalletIcon },
          { id: 'orders', label: '📋 Order History & Taxes', icon: Clock },
          { id: 'careervsinvest', label: '⚖️ Career ROI vs Investment', icon: SparklesIcon },
          { id: 'safety', label: '🛡️ Financial Safety Center', icon: ShieldCheckIcon },
          { id: 'realai', label: '🧠 Real AI Wealth Audit', icon: SparklesIcon },
          { id: 'invest', label: '🚀 Curated Baskets & SIPs', icon: SparklesIcon },
          { id: 'goals', label: '🎯 Smart Savings Goals', icon: PiggyBankIcon },
          { id: 'rules', label: '⚡ Auto-Saving Rules', icon: ZapIcon },
          { id: 'digitaltwin', label: '🔮 Career Digital Twin', icon: LayersIcon },
          { id: 'scam', label: '🚨 AI Scam Detector', icon: AlertTriangleIcon },
          { id: 'guide', label: '📖 Student Demat Guide', icon: InfoIcon },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB: AI STOCK ADVISOR (WHICH COMPANY TO INVEST IN & WHY) */}
      {/* ======================================================== */}
      {activeSubTab === 'stockadvisor' && (
        <StockAdvisorTab
          onOpenOrderModal={(params) => {
            setOrderModalParams(params);
            setIsOrderModalOpen(true);
          }}
          brokerStatus={brokerStatus}
          clearanceState={safetyData?.investment_clearance_state}
          clearanceReason={safetyData?.clearance_reason}
        />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: LIVE NSE / BSE MARKETS TERMINAL */}
      {/* ======================================================== */}
      {activeSubTab === 'livemarket' && (
        <LiveMarketsTab
          onOpenOrderModal={(params) => {
            setOrderModalParams(params);
            setIsOrderModalOpen(true);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: REGULATED BROKER GATEWAY */}
      {/* ======================================================== */}
      {activeSubTab === 'broker' && (
        <div className="space-y-6 animate-fade-in text-stone-800">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm border-l-4 border-l-blue-600 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-stone-900">SEBI Regulated Broker & Demat Integration</h3>
                </div>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  Connect your regulated Indian broker account for custodial clearing, live holdings sync, and direct order execution into the NSE orderbook.
                </p>
              </div>
              <button
                onClick={() => setIsBrokerModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition"
              >
                {brokerStatus?.connected ? 'Manage / Switch Demat' : '⚡ Connect Demat Account'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Broker Name</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">{brokerStatus?.broker_name || 'Groww Direct (Nextbillion Technology)'}</span>
                <span className="text-[10px] text-emerald-600 font-bold">● Active Protocol</span>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Client Account ID</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">{brokerStatus?.account_id || 'GROWW-CLIENT-9421'}</span>
                <span className="text-[10px] text-stone-500">Zero-Credential Tokenized</span>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Execution Mode</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">Live NSE / BSE OMS Execution</span>
                <span className="text-[10px] text-stone-500">Direct Custody Routing</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Zero-Credential Security Architecture:</span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Elevare complies strictly with SEBI circulars on third-party trading software. We never request, capture, or store your Demat passwords, MPINs, or bank authorization details. Execution is processed via encrypted broker session tokens.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: REAL AI WEALTH COPILOT AUDIT */}
      {/* ======================================================== */}
      {activeSubTab === 'realai' && (
        <RealAiWealthAuditTab profile={profile} />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 0: SMART INVEST WITH UPI (INDIVIDUAL & BASKETS) */}
      {/* ======================================================== */}
      {activeSubTab === 'invest' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Option Selector Toggle Banner: Individual vs Multi-Company */}
          <div className="advisor-card p-6 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/70 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Investment Mode Preference
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">6 Months – 1 Year Target Horizon</span>
                </div>
                <h2 className="text-xl font-black text-stone-900 mt-1">
                  How would you prefer to invest today?
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Choose between handpicking individual market leaders or letting AI assemble an optimal multi-company basket with instant GPay / PhonePe execution.
                </p>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 gap-1 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setInvestMode('individual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    investMode === 'individual'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BuildingIcon className="w-4 h-4" />
                  <span>Option 1: Individual Company</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvestMode('baskets')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    investMode === 'baskets'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Option 2: Multi-Company Baskets</span>
                </button>
              </div>
            </div>

            {/* Sub-mode Explanatory Ribbon */}
            <div className="mt-4 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <InfoIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {investMode === 'individual' 
                    ? '🎯 Individual Mode: Invest directly in TCS, Infosys, Tata Elxsi, Persistent, Reliance, HDFC Bank, BEL or Gold with custom allocations.'
                    : '⚡ Multi-Company Mode: AI automatically balances 4–5 companies based on your exact budget and near-term market catalysts.'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline-block">
                Zero Commission • Fractional Units Allowed
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* OPTION 1: INDIVIDUAL COMPANY INVESTMENT */}
          {/* ======================================================== */}
          {investMode === 'individual' && (
            <div className="space-y-6">
              
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'ALL', label: 'All 11 Companies & Funds', icon: '🌐' },
                  { id: 'AI_TECH', label: '🤖 AI, R&D & High-Tech', icon: '⚡' },
                  { id: 'IT_SERVICES', label: '🏢 IT Services Titans', icon: '💼' },
                  { id: 'BLUECHIP', label: '🏛️ Large Cap Bluechips & Defense', icon: '🏆' },
                  { id: 'INDEX_GOLD', label: '🛡️ Nifty Index & Gold Defense', icon: '💎' },
                ].map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setIndividualFilter(chip.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      individualFilter === chip.id
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Individual Company Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(hubData?.curated_assets || [])
                  .filter(asset => {
                    if (individualFilter === 'ALL') return true;
                    if (individualFilter === 'AI_TECH') {
                      return ['TATAELXSI', 'PERSISTENT', 'KPITTECH'].includes(asset.ticker) || asset.category_label?.includes('AI');
                    }
                    if (individualFilter === 'IT_SERVICES') {
                      return ['TCS', 'INFY'].includes(asset.ticker);
                    }
                    if (individualFilter === 'BLUECHIP') {
                      return ['RELIANCE', 'HDFCBANK', 'TATAMOTORS', 'BEL'].includes(asset.ticker);
                    }
                    if (individualFilter === 'INDEX_GOLD') {
                      return ['NIFTYBEES', 'GOLDBEES'].includes(asset.ticker) || asset.category?.includes('INDEX') || asset.category?.includes('GOLD');
                    }
                    return true;
                  })
                  .map(asset => {
                    const chosenAmt = assetAmounts[asset.id] || 1000;
                    const price = asset.current_nav_or_price || asset.current_nav_price_inr || 1000;
                    const units = (chosenAmt / price).toFixed(2);
                    const ret6m = asset.expected_6m_return_pct || 7.5;
                    const ret1y = asset.expected_1yr_return_pct || asset.cagr_3y_pct || 14.0;
                    const gmpInr = asset.gmp_inr || Math.round(price * 0.05);
                    const gmpPct = asset.gmp_pct || 5.0;

                    return (
                      <div
                        key={asset.id}
                        className="advisor-card p-5 flex flex-col justify-between border border-stone-200 hover:border-emerald-400 hover:shadow-lg transition-all relative overflow-hidden"
                      >
                        <div>
                          {/* Header & Badges */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                              {asset.ticker} • {asset.category_label || asset.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              ★ {asset.ai_growth_score || 9.0}/10 Conviction
                            </span>
                          </div>

                          <h4 className="font-black text-base text-stone-900">{asset.name}</h4>
                          <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
                            {asset.market_cap_tier} {asset.pe_ratio > 0 ? `• P/E: ${asset.pe_ratio}` : '• Direct ETF'}
                          </span>

                          {/* Price & Target Returns */}
                          <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-200/70 grid grid-cols-2 gap-2 text-center text-xs">
                            <div>
                              <span className="text-[9px] text-stone-500 uppercase font-bold block">Current Price / NAV</span>
                              <span className="font-black text-stone-900 text-sm">₹{price.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-stone-500 uppercase font-bold block">6M / 1-Yr Target</span>
                              <span className="font-black text-emerald-600 text-xs">+{ret6m}% (6M) • +{ret1y}% (1Y)</span>
                            </div>
                          </div>

                          {/* LIVE GMP (Grey Market / Growth Momentum Premium) Highlight */}
                          <div className="mb-2.5 p-2.5 bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/80 rounded-xl text-xs flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-orange-900 block flex items-center gap-1">
                                <span>🔥 LIVE GMP / Premium:</span>
                              </span>
                              <span className="text-xs font-black text-emerald-800">
                                +₹{gmpInr.toLocaleString('en-IN')} (+{gmpPct}%)
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-orange-950 bg-white/80 px-2 py-1 rounded-lg border border-orange-200 shadow-2xs">
                              {asset.gmp_demand_rating || 'High Demand'}
                            </span>
                          </div>

                          {/* Why Suggested to You */}
                          <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-stone-800 font-medium leading-relaxed mb-2.5">
                            <strong className="text-amber-950 font-bold block mb-0.5">💡 Why Suggested to You (6M – 1Yr):</strong>
                            {asset.why_suggested_for_you || asset.student_fit_reason}
                          </div>

                          {/* Near-term Catalysts */}
                          {asset.near_term_catalysts && (
                            <div className="p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg text-[10px] text-emerald-950 font-semibold mb-3">
                              ⚡ <strong className="text-emerald-950">6M Catalyst:</strong> {asset.near_term_catalysts}
                            </div>
                          )}

                          {/* Amount Selector for This Stock */}
                          <div className="space-y-1.5 pt-1 border-t border-stone-100">
                            <div className="flex items-center justify-between text-[11px] text-stone-600">
                              <span className="font-bold">Invest Capital:</span>
                              <span className="font-bold text-emerald-700">~{units} Units allotted</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {[500, 1000, 2000, 5000].map(amt => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => handleSetAssetAmount(asset.id, amt)}
                                  className={`flex-1 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                    chosenAmt === amt
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                  }`}
                                >
                                  ₹{amt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Chart + Direct UPI Invest Buttons */}
                        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                          <button
                            type="button"
                            onClick={() => openCompanyChart(asset, '6M')}
                            className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-stone-300/70"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>📈 View Interactive Chart & GMP (1W–1Y)</span>
                          </button>
                          <button
                            onClick={() => handleOpenUpiForAsset(asset, chosenAmt)}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            <SmartphoneIcon className="w-3.5 h-3.5" />
                            <span>Invest ₹{chosenAmt.toLocaleString('en-IN')} via GPay / PhonePe</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* OPTION 2: MULTI-COMPANY BASKET PLANS */}
          {/* ======================================================== */}
          {investMode === 'baskets' && (
            <div className="space-y-6">
              
              {/* Basket Amount Input & Strategy */}
              <div className="advisor-card p-5 bg-stone-50 border border-stone-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-base font-black text-stone-900">
                      Step 1: Set Total Basket Investment Amount
                    </h3>
                    <p className="text-xs text-stone-600">
                      Our engine automatically computes fractional unit weights across 4 to 5 diversified companies for a <strong className="text-emerald-700">6 Months – 1 Year Horizon</strong>.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {[500, 1000, 2000, 5000, 10000, 25000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => handleBasketAmountChange(amt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            basketAmount === amt
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          ₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-stone-200 min-w-[240px]">
                    <label className="text-[11px] font-bold text-stone-500 block mb-1">Custom Amount (₹):</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-base font-black text-stone-400">₹</span>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={basketAmount}
                        onChange={(e) => handleBasketAmountChange(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-base font-black text-stone-900 focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Synthesis */}
                {basketsData && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-200 text-xs text-stone-700 flex items-start gap-2">
                    <SparklesIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-950">AI Basket Synthesis (6M – 1Yr Target): </span>
                      <span>{basketsData.ai_overall_strategy}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Basket Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {basketsData?.baskets?.map((b, idx) => {
                  const isSelected = selectedBasketIndex === idx;
                  const realistic1Yr = b.realistic_1yr_value_inr || b.realistic_3yr_value_inr || (b.total_basket_cost_inr * 1.15);
                  const ret1Yr = b.expected_1yr_return_pct || b.expected_annual_cagr_pct || 14.5;
                  const ret6M = b.expected_6m_return_pct || 7.5;
                  return (
                    <div
                      key={b.basket_id}
                      onClick={() => setSelectedBasketIndex(idx)}
                      className={`advisor-card p-5 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? 'border-2 border-emerald-600 bg-emerald-50/20 shadow-lg ring-2 ring-emerald-500/20 scale-[1.01]'
                          : 'border border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      {b.basket_id === basketsData.recommended_basket_id && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                          ⭐ AI Top Pick
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{b.icon}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            b.risk_profile === 'AGGRESSIVE_GROWTH'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {b.risk_profile.replace('_', ' ')}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-stone-900 mt-1">{b.basket_name}</h4>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{b.tagline}</p>

                        <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-bold block">6M / 1-Yr Target</span>
                            <span className="text-sm font-black text-emerald-600">+{ret6M}% (6M) • +{ret1Yr}% (1Yr)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-500 uppercase font-bold block">Est. 1-Yr Value</span>
                            <span className="text-sm font-black text-stone-900">₹{Math.round(realistic1Yr).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Constituents ({b.companies_count} Companies):</span>
                          <div className="flex flex-wrap gap-1">
                            {b.allocations.map(a => (
                              <span key={a.ticker} className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {a.ticker} ({a.allocation_percentage}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">
                          {isSelected ? '✓ Selected Plan' : 'Click to Inspect'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUpiForBasket(b);
                          }}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-emerald-600/20"
                        >
                          <SmartphoneIcon className="w-3.5 h-3.5" />
                          <span>Invest via GPay</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown Table for Selected Basket */}
              {activeBasket && (
                <div className="advisor-card p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-black text-stone-900">
                          Company Allocation & 6M–1Y Rationales: {activeBasket.basket_name}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Investment: <strong className="text-stone-800">₹{activeBasket.total_basket_cost_inr.toLocaleString('en-IN')}</strong> • Target Horizon: <strong className="text-emerald-700">6 Months – 1 Year</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenUpiForBasket(activeBasket)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <SmartphoneIcon className="w-4 h-4" />
                      <span>One-Click Invest ₹{activeBasket.total_basket_cost_inr.toLocaleString('en-IN')} via GPay / PhonePe</span>
                    </button>
                  </div>

                  {/* AI Deep Analysis Narrative */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5 leading-relaxed text-stone-800 font-sans">
                    <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                      <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
                      AI Portfolio Architect Analysis (6M – 1Yr Horizon)
                    </span>
                    <p>{activeBasket.ai_deep_analysis}</p>
                  </div>

                  {/* Company Breakdown Table with WHY SUGGESTED TO YOU & LIVE GMP */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Company / Ticker</th>
                          <th className="p-3.5">Allocation & Units</th>
                          <th className="p-3.5">Current Price & P/E</th>
                          <th className="p-3.5">Target 6M & 1-Yr</th>
                          <th className="p-3.5">🔥 Live GMP & Premium</th>
                          <th className="p-3.5">🎯 Why Suggested (6M – 1Y)</th>
                          <th className="p-3.5">⚡ Catalysts & Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {activeBasket.allocations.map((item, i) => (
                          <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                            <td className="p-3.5">
                              <div className="font-black text-stone-900">{item.company_name}</div>
                              <div className="text-[11px] font-bold text-emerald-700">{item.ticker} • {item.category}</div>
                              <span className="text-[10px] text-stone-500 block mt-0.5">{item.market_cap_tier}</span>
                            </td>
                            <td className="p-3.5">
                              <div className="font-extrabold text-stone-900 text-sm">₹{item.allocated_amount_inr.toLocaleString('en-IN')}</div>
                              <div className="text-[10px] text-stone-500 font-semibold">{item.allocation_percentage}% ({item.units_allotted} Units)</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-stone-900 block">₹{item.current_price_inr.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-stone-500 block">{item.pe_ratio > 0 ? `P/E: ${item.pe_ratio}` : 'ETF'}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                                ★ {item.ai_growth_score}/10
                              </span>
                              <span className="text-[10px] text-stone-700 font-bold block mt-1">6M: ~{item.expected_6m_return_pct || 7.5}%</span>
                              <span className="text-[10px] text-emerald-700 font-black block">1Yr: ~{item.expected_1yr_return_pct || item.expected_3yr_cagr_pct}%</span>
                            </td>
                            <td className="p-3.5">
                              <div className="p-2 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-1">
                                <span className="font-black text-emerald-800 block text-xs">
                                  +₹{(item.gmp_inr || Math.round(item.current_price_inr * 0.05)).toLocaleString('en-IN')} (+{item.gmp_pct || 5.0}%)
                                </span>
                                <span className="text-[9px] font-bold text-orange-950 block">
                                  {item.gmp_demand_rating || '🔥 High Accumulation'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 max-w-sm space-y-1">
                              <div className="p-2.5 bg-amber-50/60 border border-amber-200/70 rounded-xl text-[11px] text-stone-800 font-medium leading-relaxed">
                                <strong className="text-amber-900 block font-bold mb-0.5">💡 Why for your profile:</strong>
                                {item.why_suggested_for_you || item.ai_investment_rationale}
                              </div>
                            </td>
                            <td className="p-3.5 max-w-xs space-y-2">
                              {item.near_term_catalysts && (
                                <div className="text-[10px] text-emerald-900 font-semibold leading-tight bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                                  ⚡ <strong className="text-emerald-950">6M Catalyst:</strong> {item.near_term_catalysts}
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => openCompanyChart(item, '6M')}
                                className="w-full py-1.5 px-2.5 bg-white hover:bg-stone-100 text-stone-800 rounded-lg text-[10px] font-black border border-stone-300 shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <BarChart3 className="w-3 h-3 text-emerald-600" />
                                <span>📈 View Chart (1W-1Y)</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 6M - 1Y Scenario Projected Return Horizon */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                      <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">Conservative (Bear) 6M–1Y</span>
                      <span className="text-lg font-black text-stone-800 mt-1 block">₹{(activeBasket.conservative_1yr_value_inr || activeBasket.conservative_3yr_value_inr).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-stone-500">Defensive floor with dividend reinvestment</span>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center shadow-xs">
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">Realistic (Target) 6M–1Y</span>
                      <span className="text-xl font-black text-emerald-700 mt-1 block">₹{(activeBasket.realistic_1yr_value_inr || activeBasket.realistic_3yr_value_inr).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-emerald-800 font-semibold">At ~{activeBasket.expected_1yr_return_pct || activeBasket.expected_annual_cagr_pct}% Expected 1-Yr Return</span>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                      <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">Bullish (Boom) 6M–1Y</span>
                      <span className="text-lg font-black text-purple-700 mt-1 block">₹{(activeBasket.bullish_1yr_value_inr || activeBasket.bullish_3yr_value_inr).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-purple-700">Near-term earnings rerating surge</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: VIRTUAL PORTFOLIO & LIVE HOLDINGS */}
      {/* ======================================================== */}
      {activeSubTab === 'portfolio' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Regulated Broker Demat Status & Margin Control Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BuildingIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-stone-900">
                    {brokerPortfolio?.broker_name || brokerStatus?.broker_name || 'Groww Direct'}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Direct Depository Custody</span>
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 block">
                  Account: <strong className="text-stone-700">{brokerPortfolio?.broker_account_id || brokerStatus?.account_id || 'DEMO-GUEST'}</strong> • Available Cash Margin: <strong className="text-emerald-700 font-black">₹{(brokerPortfolio?.available_cash_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsSafeUpiModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition"
              >
                <SmartphoneIcon className="w-3.5 h-3.5" />
                <span>+ Add Funds via UPI</span>
              </button>
              <button
                type="button"
                onClick={() => fetchBrokerDetails()}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                title="Sync live holdings with broker"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBrokerModalOpen(true)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Switch Broker
              </button>
            </div>
          </div>

          {/* Conditional Display: If user has broker holdings or simulated investments, show full portfolio dashboard; otherwise show motivating quote */}
          {(brokerPortfolio?.holdings?.length > 0 || (p?.holdings && p.holdings.length > 0)) ? (
            <>
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="advisor-card p-5 border-l-4 border-l-emerald-500">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Total Portfolio Value</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-stone-900">
                      ₹{(brokerPortfolio ? brokerPortfolio.total_portfolio_value : (p?.current_portfolio_value_inr || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-bold ${(brokerPortfolio ? brokerPortfolio.total_unrealized_pnl : (p?.total_returns_inr || 0)) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {(brokerPortfolio ? brokerPortfolio.total_unrealized_pnl : (p?.total_returns_inr || 0)) >= 0 ? '▲' : '▼'} {brokerPortfolio ? brokerPortfolio.total_pnl_pct : (p?.total_returns_pct || 0)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Live NSE / BSE Mark-to-Market</span>
                </div>

                <div className="advisor-card p-5 border-l-4 border-l-blue-500">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Total Invested Capital</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">
                    ₹{(brokerPortfolio ? brokerPortfolio.total_invested_capital : (p?.total_invested_inr || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Depository Cleared Equity</span>
                </div>

                <div className="advisor-card p-5 border-l-4 border-l-amber-500">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Available Cash Margin</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">
                    ₹{(brokerPortfolio ? brokerPortfolio.available_cash_balance : (p?.cash_balance_inr || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Liquid order buying power</span>
                </div>

                <div className="advisor-card p-5 border-l-4 border-l-purple-500">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Net Unrealized P&L</span>
                  <div className={`text-2xl font-black mt-1 ${(brokerPortfolio ? brokerPortfolio.total_unrealized_pnl : (p?.total_returns_inr || 0)) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {(brokerPortfolio ? brokerPortfolio.total_unrealized_pnl : (p?.total_returns_inr || 0)) >= 0 ? '+' : ''}₹{(brokerPortfolio ? brokerPortfolio.total_unrealized_pnl : (p?.total_returns_inr || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    {brokerPortfolio?.last_synced_at ? `Synced: ${new Date(brokerPortfolio.last_synced_at).toLocaleTimeString()}` : 'Live MTM P&L'}
                  </span>
                </div>
              </div>

              {/* Live Broker Demat Holdings Table */}
              {brokerPortfolio?.holdings?.length > 0 && (
                <div className="advisor-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        Live Broker Equity Holdings ({brokerPortfolio.broker_name})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('livemarket')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore Live NSE Ticks</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Instrument / Symbol</th>
                          <th className="p-3.5">Qty</th>
                          <th className="p-3.5">Avg Buy Price</th>
                          <th className="p-3.5">LTP (Live Price)</th>
                          <th className="p-3.5">Current Value</th>
                          <th className="p-3.5">Unrealized P&L</th>
                          <th className="p-3.5 text-right">Regulated Order Ticket</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {brokerPortfolio.holdings.map((h, idx) => (
                          <tr key={h.symbol || idx} className="hover:bg-stone-50/50">
                            <td className="p-3.5">
                              <span className="font-black text-stone-900 block">{h.company_name || h.symbol}</span>
                              <span className="text-[10px] text-stone-500 font-mono">{h.symbol} • {h.exchange || 'NSE'}</span>
                            </td>
                            <td className="p-3.5 font-bold text-stone-700">{h.quantity}</td>
                            <td className="p-3.5 font-mono text-stone-700">₹{h.average_buy_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3.5">
                              <span className="font-black text-stone-900 font-mono block">
                                ₹{h.current_market_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-[10px] font-bold ${h.day_change_percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {h.day_change_percentage >= 0 ? '▲ +' : '▼ '}{h.day_change_percentage}% Today
                              </span>
                            </td>
                            <td className="p-3.5 font-black text-stone-900 font-mono">
                              ₹{h.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3.5">
                              <span className={`font-bold font-mono ${h.unrealized_pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {h.unrealized_pnl >= 0 ? '+' : ''}₹{h.unrealized_pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({h.pnl_percentage}%)
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrderModalParams({
                                      symbol: h.symbol,
                                      company: h.company_name || h.symbol,
                                      price: h.current_market_price,
                                      type: 'BUY'
                                    });
                                    setIsOrderModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px] cursor-pointer"
                                >
                                  Buy More
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrderModalParams({
                                      symbol: h.symbol,
                                      company: h.company_name || h.symbol,
                                      price: h.current_market_price,
                                      type: 'SELL'
                                    });
                                    setIsOrderModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-[11px] cursor-pointer"
                                >
                                  Sell
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Goal Asset Holdings Table */}
              {p?.holdings && p.holdings.length > 0 && (
                <div className="advisor-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Goal & Basket Holdings</h3>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('invest')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Make New Investment</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Asset / Company</th>
                          <th className="p-3.5">Units Owned</th>
                          <th className="p-3.5">Invested Amount</th>
                          <th className="p-3.5">Current Value</th>
                          <th className="p-3.5">Returns (P&L)</th>
                          <th className="p-3.5">SIP Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {p.holdings.map((h, idx) => (
                          <tr key={h.asset_id || idx} className="hover:bg-stone-50/50">
                            <td className="p-3.5">
                              <span className="font-black text-stone-900 block">{h.asset_name}</span>
                              <span className="text-[10px] text-stone-500">{h.ticker} • {h.category}</span>
                            </td>
                            <td className="p-3.5 font-bold text-stone-700">{h.units}</td>
                            <td className="p-3.5 font-bold text-stone-900">₹{h.total_invested_inr.toLocaleString('en-IN')}</td>
                            <td className="p-3.5 font-black text-stone-900">₹{h.current_value_inr.toLocaleString('en-IN')}</td>
                            <td className="p-3.5">
                              <span className={`font-bold ${h.absolute_return_inr >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {h.absolute_return_inr >= 0 ? '+' : ''}₹{h.absolute_return_inr.toLocaleString('en-IN')} ({h.absolute_return_pct}%)
                              </span>
                            </td>
                            <td className="p-3.5">
                              {h.sip_active ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  ₹{h.sip_amount_monthly}/mo Active
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[10px]">Lumpsum</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Official Verified Demat & UPI Transactions Ledger */}
              <div className="advisor-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Official Demat & UPI Transaction Ledger</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    SEBI/AMFI Verified • Realtime Settled
                  </span>
                </div>

                {hubData?.recent_transactions && hubData.recent_transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Timestamp</th>
                          <th className="p-3.5">Asset / Basket</th>
                          <th className="p-3.5">Payment Method</th>
                          <th className="p-3.5">UTR / Txn ID</th>
                          <th className="p-3.5">Amount Paid</th>
                          <th className="p-3.5">Settlement Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {hubData.recent_transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-stone-50/50">
                            <td className="p-3.5 text-stone-500 font-medium text-[11px]">
                              {tx.created_at || 'Just Now'}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-stone-900 block">{tx.target_name}</span>
                              <span className="text-[10px] text-stone-500 font-semibold">{tx.ticker} {tx.units > 0 ? `• ${tx.units} Units` : ''}</span>
                            </td>
                            <td className="p-3.5 font-bold text-stone-700">
                              <span className="inline-flex items-center gap-1">
                                <span>{tx.payment_method === 'GPAY' ? '🟢 GPay' : tx.payment_method === 'PHONEPE' ? '🟣 PhonePe' : '⚡ UPI'}</span>
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-stone-600">
                              {tx.utr_number}
                            </td>
                            <td className="p-3.5 font-black text-stone-900">
                              ₹{Number(tx.amount_inr).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <span>✓</span>
                                <span>{tx.status || 'COMPLETED'}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-stone-50 rounded-xl border border-stone-200/70 text-xs text-stone-500">
                    No past transactions found. When you invest via GPay or PhonePe, verified bank UTRs and order receipts will be logged here.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ZERO STATE: Inspiring Quote & Immediate Call to Action */
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-8 md:p-10 text-white border border-stone-800 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>The Power of Early Compounding</span>
                  </span>

                  <blockquote className="text-xl md:text-2xl font-black leading-snug tracking-tight text-white">
                    "Do not save what is left after spending, but spend what is left after investing."
                  </blockquote>
                  
                  <p className="text-xs md:text-sm text-stone-300 font-medium leading-relaxed">
                    As a student, your most valuable superpower is <strong className="text-emerald-400 font-bold">TIME</strong>. A modest ₹500/month invested during college at 14% CAGR grows larger than ₹5,000/month started in your 30s. Start building your financial fortress today.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveSubTab('invest')}
                      className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Start Your First Investment via GPay / PhonePe →</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab('guide')}
                      className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl border border-white/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Learn 4-Step Demat Guide</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-center min-w-[260px] space-y-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                    🌱
                  </div>
                  <h4 className="text-sm font-black text-white">Zero Active Holdings</h4>
                  <p className="text-[11px] text-stone-300 leading-normal">
                    You have not executed any investment transactions yet. Once you complete a purchase via GPay/PhonePe, your live portfolio, P&L, and verified UTR receipts will instantly appear here.
                  </p>
                  <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                    Direct Bluechips & Nifty Index from ₹100
                  </div>
                </div>
              </div>

              {/* Quick Investment Category Teaser Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => { setActiveSubTab('invest'); setInvestMode('individual'); }}
                  className="advisor-card p-5 cursor-pointer hover:border-emerald-500 transition-all group"
                >
                  <span className="text-2xl block mb-2">🏛️</span>
                  <h4 className="text-xs font-black text-stone-900 group-hover:text-emerald-700">Option 1: Direct Bluechips & ETFs</h4>
                  <p className="text-[11px] text-stone-500 mt-1">Invest directly in TCS, Infosys, Reliance, HDFC Bank or Gold BeES.</p>
                  <span className="text-[11px] font-bold text-emerald-600 mt-3 inline-block">Explore Individual Stocks →</span>
                </div>

                <div 
                  onClick={() => { setActiveSubTab('invest'); setInvestMode('baskets'); }}
                  className="advisor-card p-5 cursor-pointer hover:border-emerald-500 transition-all group"
                >
                  <span className="text-2xl block mb-2">🚀</span>
                  <h4 className="text-xs font-black text-stone-900 group-hover:text-emerald-700">Option 2: Multi-Company Growth Baskets</h4>
                  <p className="text-[11px] text-stone-500 mt-1">AI-diversified portfolios across 4–5 companies tailored for 6M–1Y horizons.</p>
                  <span className="text-[11px] font-bold text-emerald-600 mt-3 inline-block">Explore Baskets →</span>
                </div>

                <div 
                  onClick={() => setActiveSubTab('goals')}
                  className="advisor-card p-5 cursor-pointer hover:border-emerald-500 transition-all group"
                >
                  <span className="text-2xl block mb-2">🎯</span>
                  <h4 className="text-xs font-black text-stone-900 group-hover:text-emerald-700">Smart Student Savings Jars</h4>
                  <p className="text-[11px] text-stone-500 mt-1">Targeted sinking funds for emergency reserves, certifications, and laptops.</p>
                  <span className="text-[11px] font-bold text-emerald-600 mt-3 inline-block">View Savings Goals →</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: SMART SAVINGS GOALS */}
      {/* ======================================================== */}
      {activeSubTab === 'goals' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-stone-900">Smart Student Savings Jars</h3>
              <p className="text-xs text-stone-500">Dedicated sinking funds for laptops, cloud compute, certifications & emergencies</p>
            </div>
            <button
              onClick={() => setIsCreateGoalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Jar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hubData?.savings_goals?.map(g => (
              <div key={g.id} className="advisor-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{g.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-stone-900 mt-2">{g.title}</h4>
                  <div className="flex items-baseline justify-between text-xs mt-1">
                    <span className="text-stone-500">Saved: <strong className="text-stone-900">₹{g.current_amount_inr.toLocaleString('en-IN')}</strong></span>
                    <span className="text-stone-500">Target: <strong>₹{g.target_amount_inr.toLocaleString('en-IN')}</strong></span>
                  </div>

                  <div className="w-full bg-stone-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, g.progress_pct)}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-stone-500 mt-2 flex items-center justify-between">
                    <span>{g.progress_pct}% Completed</span>
                    <span>Target: {g.target_date}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGoalForDeposit(g)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Deposit Money →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: AUTOMATED SAVING RULES */}
      {/* ======================================================== */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6 animate-fade-in">
          <div className="advisor-card p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-900">Behavioral Micro-Saving Triggers</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Gamified rules that effortlessly stack savings into your student investment fund.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Total Monthly Save Potential</span>
                <span className="text-xl font-black text-amber-600">₹{hubData?.total_monthly_savings_potential_inr?.toLocaleString('en-IN') || '2,400'} / mo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hubData?.saving_rules?.map(r => (
              <div key={r.rule_key} className="advisor-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{r.icon}</span>
                    <button
                      onClick={() => handleToggleRule(r.rule_key, r.active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        r.active ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {r.active ? '✓ Active' : 'Enable'}
                    </button>
                  </div>

                  <h4 className="font-extrabold text-sm text-stone-900">{r.name}</h4>
                  <p className="text-xs text-stone-500 mt-1">{r.description}</p>

                  <div className="my-3 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between">
                    <span className="text-stone-600 font-medium">Est. Monthly Save:</span>
                    <span className="font-black text-emerald-700">₹{r.estimated_monthly_save_inr}/mo</span>
                  </div>

                  <p className="text-[11px] text-stone-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                    💡 {r.gamified_tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: ORDERS & REGULATORY CHARGES LEDGER */}
      {/* ======================================================== */}
      {activeSubTab === 'orders' && (
        <OrdersLedgerTab
          onNewOrder={() => {
            setOrderModalParams({ symbol: 'RELIANCE', price: 2950, type: 'BUY' });
            setIsOrderModalOpen(true);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: CAREER ROI VS INVESTMENT COMPARATOR */}
      {/* ======================================================== */}
      {activeSubTab === 'careervsinvest' && (
        <CareerVsInvestmentTab />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: FINANCIAL SAFETY CENTER & 5-GATE PREREQUISITES */}
      {/* ======================================================== */}
      {activeSubTab === 'safety' && (
        <FinancialSafetyTab />
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 6: 5-YEAR DIGITAL TWIN SIMULATOR */}
      {/* ======================================================== */}
      {activeSubTab === 'digitaltwin' && (
        <div className="space-y-6 animate-fade-in">
          {digitalTwinData ? (
            <div className="advisor-card p-6 space-y-6">
              <div>
                <h3 className="text-base font-black text-stone-900">Career + Wealth 5-Year Digital Twin</h3>
                <p className="text-xs text-stone-500">Simulate how human capital upskilling directly determines long-term net worth</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-stone-800 leading-relaxed font-sans">
                {digitalTwinData.ai_comparative_synthesis}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {digitalTwinData.scenarios.map(scen => (
                  <div key={scen.scenario_key} className={`advisor-card p-5 space-y-3 flex flex-col justify-between border ${
                    scen.scenario_key === 'SCENARIO_D' ? 'border-2 border-orange-500 bg-orange-50/20' : 'border-stone-200'
                  }`}>
                    <div>
                      <h4 className="font-black text-sm text-stone-900">{scen.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{scen.tagline}</p>
                      
                      <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Year 5 Salary:</span>
                          <span className="font-bold text-stone-900">{scen.year_5_salary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Year 5 Net Worth:</span>
                          <span className="font-black text-emerald-600">{scen.year_5_net_worth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Skill Readiness:</span>
                          <span className="font-bold text-orange-600">{scen.year_5_readiness}%</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-relaxed">{scen.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-bold text-stone-500">
              Loading 5-Year Simulation Engine...
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 7: AI SCAM & PONZI DETECTOR */}
      {/* ======================================================== */}
      {activeSubTab === 'scam' && (
        <div className="space-y-6 animate-fade-in">
          <div className="advisor-card p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-stone-900">SEBI & AMFI Investor Scam Checker</h3>
              <p className="text-xs text-stone-500">Paste any investment message or Telegram/WhatsApp pitch to detect illegal schemes</p>
            </div>

            <textarea
              rows={3}
              value={scamPitch}
              onChange={(e) => setScamPitch(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans text-stone-800 focus:outline-emerald-500"
              placeholder="e.g. Guaranteed 30% monthly returns on Telegram VIP group..."
            />

            <button
              onClick={handleScanScam}
              disabled={scamLoading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangleIcon className="w-4 h-4" />
              <span>{scamLoading ? 'Analyzing Text...' : 'Scan Scheme for Red Flags'}</span>
            </button>

            {scamResult && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-900">{scamResult.risk_badge}</span>
                  <span className="text-xs font-black bg-white px-2.5 py-1 rounded-full border border-rose-200">
                    Safety Score: {scamResult.safety_score} / 100
                  </span>
                </div>
                <p className="text-xs text-stone-800 leading-relaxed font-sans">{scamResult.verdict_summary}</p>
                <div className="text-xs text-stone-700 bg-white/80 p-3 rounded-xl border border-rose-200 space-y-1">
                  <strong>Red Flags Detected:</strong>
                  {scamResult.red_flags_detected.map((rf, idx) => (
                    <div key={idx} className="text-rose-700">• {rf}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 8: STUDENT DEMAT GUIDE */}
      {/* ======================================================== */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6 animate-fade-in">
          <div className="advisor-card p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-stone-900">Official Student Demat & Tax Blueprint</h3>
              <p className="text-xs text-stone-500">Step-by-step roadmap to opening verified zero-commission investment accounts</p>
            </div>

            <div className="space-y-4">
              {hubData?.student_demat_guide?.map((step, idx) => (
                <div key={idx} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                    {step.step_number}
                  </div>
                  <div className="space-y-1 flex-1 text-xs">
                    <h4 className="font-extrabold text-stone-900 text-sm">{step.title}</h4>
                    <p className="text-stone-600 leading-relaxed">{step.description}</p>
                    <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium mt-1">
                      💡 <strong>Pro Tip:</strong> {step.key_advice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INTERACTIVE UPI PAYMENT GATEWAY (GPAY / PHONEPE) */}
      {/* ======================================================== */}
      {isUpiModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget && upiStep !== 'PROCESSING') setIsUpiModalOpen(false); }}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn cursor-pointer"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6 cursor-default">
            
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SmartphoneIcon className="w-5 h-5 text-emerald-300" />
                  <h3 className="text-base font-black">
                    {upiStep === 'SUCCESS' ? 'Investment Confirmed' : 'Instant UPI Payment Gateway'}
                  </h3>
                </div>
                {upiStep !== 'PROCESSING' && (
                  <button
                    onClick={() => setIsUpiModalOpen(false)}
                    className="text-white/70 hover:text-white text-xs font-bold px-2 py-1 bg-white/10 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="mt-2 text-xs text-emerald-100 flex items-center justify-between">
                <span>Amount: <strong className="text-white text-sm">₹{(upiTargetBasket?.total_basket_cost_inr || upiTargetAsset?.chosenAmount || basketAmount).toLocaleString('en-IN')}</strong></span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">NPCI / UPI 2.0</span>
              </div>
            </div>

            {/* STEP 1: METHOD SELECT */}
            {upiStep === 'METHOD_SELECT' && (
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs font-bold text-stone-700 block mb-2">Select Your Preferred UPI App:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'GPAY', name: 'Google Pay', icon: '📱', color: 'border-blue-300 bg-blue-50/30' },
                      { id: 'PHONEPE', name: 'PhonePe', icon: '🟣', color: 'border-purple-300 bg-purple-50/30' },
                      { id: 'PAYTM', name: 'Paytm UPI', icon: '🔵', color: 'border-cyan-300 bg-cyan-50/30' },
                      { id: 'QR_CODE', name: 'Scan Dynamic QR', icon: '🔲', color: 'border-emerald-300 bg-emerald-50/30' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setUpiMethod(m.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          upiMethod === m.id
                            ? 'border-2 border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <h4 className="text-xs font-black text-stone-900">{m.name}</h4>
                          <span className="text-[10px] text-stone-500">Instant Verification</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom UPI ID or QR Code Display */}
                {upiMethod === 'QR_CODE' ? (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-2">
                    <div className="w-36 h-36 bg-white border-2 border-stone-300 rounded-xl mx-auto flex flex-col items-center justify-center p-2 shadow-xs">
                      <div className="w-full h-full bg-stone-900 p-1 flex items-center justify-center text-white rounded-lg text-xs font-mono">
                        [DYNAMIC UPI QR]
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">
                      Scan with Google Pay, PhonePe, Paytm or BHIM
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-stone-700 block">Your UPI ID / VPA (Optional):</label>
                    <input
                      type="text"
                      placeholder={`${profile?.name?.toLowerCase()?.replace(/\s+/g, '') || 'student'}@oksbi`}
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-emerald-500"
                    />
                  </div>
                )}

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Investment Basket:</span>
                    <strong className="text-stone-900">{upiTargetBasket?.basket_name || upiTargetAsset?.name || 'Multi-Company Basket'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Companies Covered:</span>
                    <strong className="text-emerald-700">{upiTargetBasket?.companies_count || 1} Companies/ETFs</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUpiModalOpen(false)}
                    className="w-1/3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ← Cancel
                  </button>
                  <button
                    onClick={() => setUpiStep('PIN_CONFIRM')}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to PIN (₹{(upiTargetBasket?.total_basket_cost_inr || upiTargetAsset?.chosenAmount || basketAmount).toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: UPI PIN CONFIRMATION */}
            {upiStep === 'PIN_CONFIRM' && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                  🔐
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900">Enter 4 or 6-Digit UPI PIN</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Authorizing debit of ₹{(upiTargetBasket?.total_basket_cost_inr || upiTargetAsset?.chosenAmount || basketAmount).toLocaleString('en-IN')} via {upiMethod}</p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={upiPin}
                    onChange={(e) => setUpiPin(e.target.value)}
                    className="w-full text-center tracking-[0.5em] text-2xl font-black p-3 bg-stone-100 border border-stone-300 rounded-xl focus:outline-emerald-500"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">NPCI 256-Bit Encrypted Secure Transmission</span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setUpiStep('METHOD_SELECT')}
                    className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmUpiPayment}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                    <span>Authorize & Allot Units</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROCESSING */}
            {upiStep === 'PROCESSING' && (
              <div className="p-10 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h4 className="text-sm font-black text-stone-900">Connecting to UPI Payment Switch...</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Confirming bank debit and registering fractional units with depository clearing house.
                </p>
              </div>
            )}

            {/* STEP 4: SUCCESS RECEIPT */}
            {upiStep === 'SUCCESS' && upiReceiptData && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-emerald-950">Payment & Allotment Successful!</h4>
                  <p className="text-xs text-stone-500">{upiReceiptData.message}</p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between border-b border-stone-200/60 pb-2">
                    <span className="text-stone-500">Transaction ID:</span>
                    <strong className="font-mono text-stone-900">{upiReceiptData.transaction_id}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-2">
                    <span className="text-stone-500">Bank UTR Reference:</span>
                    <strong className="font-mono text-stone-900">{upiReceiptData.utr_number}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-2">
                    <span className="text-stone-500">Payment Channel:</span>
                    <strong className="text-emerald-700">{upiReceiptData.payment_method} UPI Direct</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Timestamp:</span>
                    <strong className="text-stone-800">{upiReceiptData.timestamp}</strong>
                  </div>
                </div>

                {/* Units Allotted Summary Table */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">Depository Credit Breakdown:</span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {upiReceiptData.units_allocated_summary.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-stone-900 block">{item.company_name}</strong>
                          <span className="text-[10px] text-stone-500">{item.ticker} @ ₹{item.nav_price_inr}</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-800 block">+{item.units_bought} Units</strong>
                          <span className="text-[10px] text-stone-500">₹{item.amount_allocated_inr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-stone-500 leading-relaxed bg-stone-100 p-2 rounded-lg">
                  ⚖️ {upiReceiptData.amfi_sebi_compliance_note}
                </p>

                <button
                  onClick={() => {
                    setIsUpiModalOpen(false);
                    setActiveSubTab('portfolio');
                  }}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <WalletIcon className="w-4 h-4 text-emerald-400" />
                  <span>View in Live Portfolio</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {isCreateGoalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsCreateGoalOpen(false); }}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-stone-200 space-y-4 cursor-default">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-stone-900">Create New Savings Jar</h3>
              <button onClick={() => setIsCreateGoalOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Goal Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certification Voucher"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Amount (₹):</label>
                  <input
                    type="number"
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Date:</label>
                  <input
                    type="date"
                    required
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateGoalOpen(false)} className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer">Create Jar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {selectedGoalForDeposit && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedGoalForDeposit(null); }}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-stone-200 space-y-4 cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Deposit Money</span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">{selectedGoalForDeposit.title}</h3>
                <span className="text-xs text-stone-500">Current: ₹{selectedGoalForDeposit.current_amount_inr} / ₹{selectedGoalForDeposit.target_amount_inr}</span>
              </div>
              <button onClick={() => setSelectedGoalForDeposit(null)} className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <label className="font-bold text-stone-700 block">Deposit Amount (₹):</label>
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${depositAmount === amt ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'}`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
              />
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
              <button onClick={() => setSelectedGoalForDeposit(null)} className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleDepositGoal} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer">Confirm Deposit</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INTERACTIVE COMPANY HISTORICAL CHART & LIVE GMP */}
      {/* ======================================================== */}
      {selectedChartAsset && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedChartAsset(null); }}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn cursor-pointer"
        >
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6 cursor-default">
            
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 border-b border-stone-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {chartData?.ticker || selectedChartAsset.ticker} • {chartData?.category || selectedChartAsset.category || 'Equity'}
                    </span>
                    <span className="text-stone-300 text-xs font-semibold">
                      NSE / BSE Live Market Simulation
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {chartData?.company_name || selectedChartAsset.name || selectedChartAsset.ticker}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Current Price</span>
                    <span className="text-2xl font-black text-white">
                      ₹{(chartData?.current_price_inr || selectedChartAsset.current_price_inr || selectedChartAsset.current_nav_or_price || 1000).toLocaleString('en-IN')}
                    </span>
                    {chartData && (
                      <span className={`text-[11px] font-bold block ${chartData.change_inr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {chartData.change_inr >= 0 ? '▲ +' : '▼ '}₹{Math.abs(chartData.change_inr)} ({chartData.change_pct}%) in {chartTimeframe}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedChartAsset(null)}
                    className="text-stone-400 hover:text-white text-base font-bold w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Timeframe Selector & GMP Highlight Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                
                {/* Timeframe Toggle Buttons (1W, 1M, 3M, 6M, 1Y) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Historical Timeframe:</span>
                  <div className="flex flex-wrap items-center bg-stone-200/70 p-1 rounded-xl gap-1">
                    {[
                      { id: '1W', label: '1 Week' },
                      { id: '1M', label: '1 Month' },
                      { id: '3M', label: '3 Months' },
                      { id: '6M', label: '6 Months' },
                      { id: '1Y', label: '1 Year' },
                    ].map(tf => (
                      <button
                        key={tf.id}
                        type="button"
                        onClick={() => handleTimeframeChange(tf.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          chartTimeframe === tf.id
                            ? 'bg-emerald-600 text-white shadow-sm scale-105'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live GMP Card */}
                {chartData && (
                  <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-emerald-500/10 p-3.5 rounded-xl border border-orange-300/60 text-right min-w-[200px]">
                    <div className="flex items-center justify-end gap-1 text-[10px] font-black uppercase text-orange-900 tracking-wider">
                      <span>🔥 LIVE GMP / Premium</span>
                    </div>
                    <span className="text-base font-black text-emerald-800 block mt-0.5">
                      +₹{chartData.gmp_inr.toLocaleString('en-IN')} (+{chartData.gmp_pct}%)
                    </span>
                    <span className="text-[10px] font-bold text-orange-950 block">
                      {chartData.gmp_demand_rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Recharts Area Chart */}
              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 text-white relative">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <TrendingUpIcon className="w-4 h-4 text-emerald-400" />
                    <span>Price Trajectory & Trendline ({chartTimeframe})</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {chartData?.points?.length || 0} Data Points
                  </span>
                </div>

                {chartLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-2 text-stone-400 text-xs">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Rendering Real-Time Chart for {selectedChartAsset.ticker}...</span>
                  </div>
                ) : chartData?.points && chartData.points.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="chartPriceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                        <XAxis 
                          dataKey="formatted_date" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          domain={['auto', 'auto']}
                          tickFormatter={(val) => `₹${Math.round(val)}`}
                          tickLine={false}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const pt = payload[0].payload;
                              return (
                                <div className="bg-stone-900 border border-emerald-500/50 p-2.5 rounded-xl shadow-xl text-xs space-y-1 font-sans">
                                  <span className="text-[10px] text-stone-400 font-bold block">{pt.date} ({pt.formatted_date})</span>
                                  <div className="font-black text-emerald-400 text-sm">₹{pt.price.toLocaleString('en-IN')}</div>
                                  <div className="text-[10px] text-stone-300">Volume: {pt.volume_m}M Shares</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#chartPriceGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-stone-400 text-xs">
                    No chart points available.
                  </div>
                )}

                {/* Quick Metrics Bar: Period High, Low, 50-DMA */}
                {chartData && (
                  <div className="mt-3 pt-3 border-t border-stone-800 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-stone-800/60 p-2 rounded-xl border border-stone-700/50">
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Period Low</span>
                      <span className="font-bold text-rose-400">₹{chartData.low_price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-stone-800/60 p-2 rounded-xl border border-stone-700/50">
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">50-Day Moving Avg</span>
                      <span className="font-bold text-amber-400">₹{chartData.moving_average_50d.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-stone-800/60 p-2 rounded-xl border border-stone-700/50">
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Period High</span>
                      <span className="font-bold text-emerald-400">₹{chartData.high_price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Near-Term Catalysts & Strategic Why Banner */}
              {chartData && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-xs text-stone-800 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
                      <span>Market Catalyst & Student Investment Fit (6M – 1Yr)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {chartData.market_sentiment}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>💡 Why for you:</strong> {chartData.why_suggested_for_you}
                  </p>
                  {chartData.near_term_catalysts && (
                    <p className="text-[11px] text-emerald-950 font-semibold pt-1 border-t border-amber-200/60">
                      ⚡ <strong>Near-Term Catalyst:</strong> {chartData.near_term_catalysts}
                    </p>
                  )}
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChartAsset(null)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  ← Return to Investments
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChartAsset;
                    setSelectedChartAsset(null);
                    handleOpenUpiForAsset(target, assetAmounts[target.id] || 1000);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <SmartphoneIcon className="w-4 h-4" />
                  <span>Invest in {chartData?.ticker || selectedChartAsset.ticker} via GPay / PhonePe</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SEBI Pluggable Broker Connect Modal */}
      <BrokerConnectModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        brokerStatus={brokerStatus}
        onConnectionChanged={() => {
          fetchBrokerDetails();
          fetchHubData();
        }}
      />

      {/* Regulated Broker Order Placement Modal */}
      <BrokerOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderModalParams(null);
        }}
        orderParams={orderModalParams}
        brokerStatus={brokerStatus}
        executionEnvironment={executionEnvironment}
        clearanceState={safetyData?.investment_clearance_state}
        clearanceReason={safetyData?.clearance_reason}
        onOrderExecuted={() => {
          fetchBrokerDetails();
          fetchHubData();
        }}
      />

      {/* Safe NPCI UPI Mandate Deposit Modal */}
      <SafeUpiMandateModal
        isOpen={isSafeUpiModalOpen}
        onClose={() => setIsSafeUpiModalOpen(false)}
        brokerStatus={brokerStatus}
        onFundsDeposited={() => {
          fetchBrokerDetails();
          fetchHubData();
        }}
      />

    </div>
  );
}
