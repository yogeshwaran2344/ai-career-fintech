import React, { useState } from 'react';
import { 
  Building, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  AlertCircle,
  Cpu
} from 'lucide-react';
import { api } from '../api';

const BROKER_OPTIONS = [
  {
    id: 'Zerodha',
    name: 'Zerodha Kite',
    tagline: "India's largest discount retail broker (Kite Connect v3)",
    logo: '🔴',
    color: 'border-orange-500/40 bg-orange-50/20'
  },
  {
    id: 'Upstox',
    name: 'Upstox Pro',
    tagline: 'High-speed trading APIs & institutional infrastructure',
    logo: '🟣',
    color: 'border-purple-500/40 bg-purple-50/20'
  },
  {
    id: 'Angel One',
    name: 'Angel One (SmartAPI)',
    tagline: 'SmartAPI algorithmic execution and depository clearing',
    logo: '🔵',
    color: 'border-blue-500/40 bg-blue-50/20'
  },
  {
    id: 'Sandbox',
    name: 'SEBI Regulatory Sandbox Demat',
    tagline: 'Paper trading & demo execution with live NSE real-time ticks (Zero risk)',
    logo: '⚡',
    color: 'border-emerald-500/40 bg-emerald-50/20',
    isSandbox: true
  }
];

export default function BrokerConnectModal({ isOpen, onClose, brokerStatus, onConnectionChanged }) {
  const [selectedBroker, setSelectedBroker] = useState('Zerodha');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    const chosenBroker = BROKER_OPTIONS.find(b => b.id === selectedBroker);
    const finalAccountId = accountId.trim() || (chosenBroker?.isSandbox ? 'SANDBOX-DEMO' : 'CLIENT-ZR9421');

    try {
      setLoading(true);
      await api.connectBroker(
        selectedBroker,
        finalAccountId,
        null,
        Boolean(chosenBroker?.isSandbox)
      );
      if (onConnectionChanged) await onConnectionChanged();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect broker.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await api.disconnectBroker();
      if (onConnectionChanged) await onConnectionChanged();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to disconnect broker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Regulated Depository & Broker Gateway</span>
          </div>
          <h3 className="text-xl font-black mt-1">Connect Your Demat Account</h3>
          <p className="text-xs text-stone-300 mt-1">
            Synchronize live stock holdings and route orders directly through registered brokers.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Status */}
          {brokerStatus?.connected && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-900">Active Connection: {brokerStatus.broker_name}</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Account ID: {brokerStatus.account_id}</div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          )}

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">Select Supported Broker</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BROKER_OPTIONS.map((broker) => (
                  <div
                    key={broker.id}
                    onClick={() => setSelectedBroker(broker.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedBroker === broker.id
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{broker.logo}</span>
                      <span className="text-xs font-black text-stone-900">{broker.name}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">{broker.tagline}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Client / Demat Account ID
              </label>
              <input
                type="text"
                placeholder={selectedBroker === 'Sandbox' ? 'SANDBOX-DEMO (or custom ID)' : 'e.g. ZR9421 or UP5520'}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full text-xs font-bold p-3 bg-stone-100 border border-stone-200 rounded-xl focus:outline-emerald-500 text-stone-800"
              />
            </div>

            {/* Zero-Credential Policy Callout */}
            <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-[11px] text-stone-600 space-y-1.5">
              <div className="flex items-center gap-1.5 text-stone-900 font-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero-Credential Security Policy</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                CareerWealth complies strictly with SEBI circulars. We <strong>NEVER</strong> ask for, view, or store your trading passwords, MPINs, or bank credentials. Authentication is performed via secure OAuth token exchange.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Authorizing...' : 'Connect Broker Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
