import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building
} from 'lucide-react';
import { api } from '../api';

export default function BrokerOrderModal({ isOpen, onClose, orderParams, onOrderExecuted, brokerStatus }) {
  const [transactionType, setTransactionType] = useState(orderParams?.type || 'BUY');
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' or 'LIMIT'
  const [product, setProduct] = useState('CNC'); // 'CNC' (Delivery) or 'MIS' (Intraday)
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(orderParams?.price || 1000);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !orderParams) return null;

  const currentPrice = orderParams.price || 1000;
  const executionPrice = orderType === 'LIMIT' ? limitPrice : currentPrice;
  const estimatedTotal = roundTwo(quantity * executionPrice);

  function roundTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await api.placeBrokerOrder({
        symbol: orderParams.symbol,
        exchange: 'NSE',
        transaction_type: transactionType,
        order_type: orderType,
        product: product,
        quantity: parseInt(quantity, 10),
        price: orderType === 'LIMIT' ? parseFloat(limitPrice) : null
      });
      setOrderResult(res);
      if (onOrderExecuted) onOrderExecuted();
    } catch (err) {
      setError(err.message || 'Order execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-stone-800">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white relative ${transactionType === 'BUY' ? 'bg-gradient-to-r from-emerald-800 to-teal-900' : 'bg-gradient-to-r from-rose-800 to-red-900'}`}>
          <button 
            onClick={handleClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
            <Building className="w-4 h-4" />
            <span>Broker OMS • NSE Execution</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <h3 className="text-2xl font-black">{orderParams.symbol}</h3>
              <span className="text-xs text-white/80 font-semibold">NSE Equity</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">₹{currentPrice.toFixed(2)}</span>
              <span className="text-[10px] block text-white/70">Live Tick</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orderResult ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-stone-900">Order Executed Successfully!</h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                {orderResult.message}
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-400">Broker:</span>
                  <span className="font-bold text-stone-800">{orderResult.broker_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Broker Order ID:</span>
                  <span className="font-bold text-stone-800">{orderResult.broker_order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Execution Price:</span>
                  <span className="font-bold text-stone-800">₹{orderResult.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status:</span>
                  <span className="font-bold text-emerald-600">{orderResult.status}</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-black transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTransactionType('BUY')}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    transactionType === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('SELL')}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    transactionType === 'SELL'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Product and Order Type Tabs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1">Product</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setProduct('CNC')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] ${product === 'CNC' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    >
                      CNC (Delivery)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProduct('MIS')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] ${product === 'MIS' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    >
                      MIS (Intraday)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 block mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setOrderType('MARKET')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] ${orderType === 'MARKET' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('LIMIT')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] ${orderType === 'LIMIT' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                    >
                      Limit
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-stone-700">Quantity (Shares)</label>
                  <div className="flex gap-1 text-[10px] font-bold">
                    {[1, 5, 10, 25].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                      >
                        +{q}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-base font-bold p-2.5 bg-stone-100 border border-stone-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              {/* Limit Price Input */}
              {orderType === 'LIMIT' && (
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Limit Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
                    className="w-full text-base font-bold p-2.5 bg-stone-100 border border-stone-200 rounded-xl focus:outline-emerald-500"
                  />
                </div>
              )}

              {/* Estimated Total Calculation */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Estimated Order Value</span>
                  <span className="text-lg font-black text-stone-900">₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="text-right text-[10px] text-stone-500 font-semibold">
                  <div>Brokerage: ₹0 (Free Delivery)</div>
                  <div>STT + Exchange: ~₹{(estimatedTotal * 0.001).toFixed(2)}</div>
                </div>
              </div>

              {/* Routing Badge */}
              <div className="text-[10px] text-stone-500 flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Routing via <strong>{brokerStatus?.broker_name || 'SEBI Sandbox Broker'}</strong> to NSE
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2.5 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                    transactionType === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  }`}
                >
                  {loading ? 'Submitting to OMS...' : `Confirm ${transactionType} (${quantity} Qty)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
