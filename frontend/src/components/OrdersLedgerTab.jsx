import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { api } from '../api';

export default function OrdersLedgerTab({ onOpenOrderModal }) {
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'EXECUTED', 'PENDING', 'REJECTED'
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getBrokerOrdersSummary();
      setSummary(res);
    } catch (err) {
      console.error('Error fetching orders summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (!summary) return [];
    if (filter === 'EXECUTED') return summary.executed_orders;
    if (filter === 'PENDING') return summary.pending_orders;
    if (filter === 'REJECTED') return summary.rejected_orders;
    return summary.all_orders;
  };

  const orders = getFilteredOrders();

  return (
    <div className="space-y-6 animate-fade-in text-stone-800">
      {/* Top Banner with Environment Badge */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">Regulated Order Audit</span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              summary?.active_environment === 'LIVE'
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {summary?.active_environment === 'LIVE' ? '🔴 LIVE TRADING (BROKER OMS)' : '🟠 PAPER TRADING (SIMULATION)'}
            </span>
          </div>
          <h2 className="text-xl font-black text-stone-900 mt-1">Official Broker Order History & Executions</h2>
          <p className="text-xs text-stone-500 mt-0.5 max-w-xl">
            Real-time depository tracking for equity trades routed via your connected broker (Zerodha Kite, Upstox Pro, or SEBI Sandbox).
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-2 self-start md:self-auto cursor-pointer transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        {[
          { id: 'ALL', label: `All Orders (${summary?.total_orders_count || 0})` },
          { id: 'EXECUTED', label: `Executed (${summary?.executed_orders?.length || 0})` },
          { id: 'PENDING', label: `Pending (${summary?.pending_orders?.length || 0})` },
          { id: 'REJECTED', label: `Rejected (${summary?.rejected_orders?.length || 0})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              filter === tab.id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
          <span>Loading verified broker order logs...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-xl">
            📋
          </div>
          <h4 className="text-sm font-bold text-stone-900">No Orders in this Category</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you place Buy or Sell orders via the Live Market Terminal, every execution tick, limit price, and statutory tax will be logged here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="p-3.5">Order ID & Timestamp</th>
                  <th className="p-3.5">Broker OMS</th>
                  <th className="p-3.5">Security</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Type & Product</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Est. Taxes</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-stone-900 block">{ord.id}</span>
                      <span className="text-[10px] text-stone-400 font-medium">{ord.created_at || 'Just Now'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-stone-800 block">{ord.broker_name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{ord.broker_order_id || 'ID Pending'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-black text-stone-900 block">{ord.symbol}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{ord.exchange}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        ord.transaction_type === 'BUY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ord.transaction_type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-700">
                      <div>{ord.order_type}</div>
                      <span className="text-[10px] text-stone-400">{ord.product === 'CNC' ? 'CNC (Delivery)' : 'MIS (Intraday)'}</span>
                    </td>
                    <td className="p-3.5 font-black text-stone-900">{ord.quantity}</td>
                    <td className="p-3.5 font-mono font-bold text-stone-900">
                      ₹{Number(ord.executed_price || ord.requested_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-stone-500">
                      ₹{ord.estimated_charges ? Number(ord.estimated_charges).toFixed(2) : '1.50'}
                    </td>
                    <td className="p-3.5">
                      {ord.status === 'EXECUTED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>EXECUTED</span>
                        </span>
                      ) : ord.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>PENDING</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>{ord.status}</span>
                        </span>
                      )}
                      {ord.failure_reason && (
                        <span className="text-[10px] text-rose-600 block mt-0.5">{ord.failure_reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
