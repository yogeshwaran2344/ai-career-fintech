import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  QrCode,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function SafeUpiMandateModal({ isOpen, onClose, onFundsDeposited, brokerStatus }) {
  const [amount, setAmount] = useState(2000);
  const [vpa, setVpa] = useState('student@okhdfcbank');
  const [step, setStep] = useState('FORM'); // 'FORM', 'AWAITING_APPROVAL', 'SUCCESS'
  const [mandateData, setMandateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInitiateMandate = async (e) => {
    e.preventDefault();
    setError('');
    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!vpa || !vpa.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. username@okhdfcbank).');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createUpiMandate(amount, vpa.trim());
      setMandateData(res);
      setStep('AWAITING_APPROVAL');
    } catch (err) {
      setError(err.message || 'Failed to initiate UPI collect request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateBankApproval = async () => {
    if (!mandateData) return;
    try {
      setLoading(true);
      const res = await api.approveUpiMandate(mandateData.mandate_ref);
      setMandateData(res);
      setStep('SUCCESS');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      if (onFundsDeposited) onFundsDeposited();
    } catch (err) {
      setError(err.message || 'Approval verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('FORM');
    setMandateData(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-stone-800">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 relative">
          <button 
            onClick={handleClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-400/30">
              🧪 SANDBOX UPI INTENT SIMULATOR
            </span>
          </div>
          <h3 className="text-xl font-black mt-1">NPCI UPI Mandate Deposit Flow</h3>
          <p className="text-xs text-emerald-100 mt-1">
            Zero-PIN Architecture: Demonstrating the official NPCI 2-step collect mandate.
          </p>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="bg-amber-50 px-6 py-2 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span><strong>Educational Sandbox:</strong> Simulates collect intent. No real bank accounts are debited.</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'FORM' && (
            <form onSubmit={handleInitiateMandate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Deposit Amount (₹)</label>
                <div className="flex gap-1.5 mb-2">
                  {[1000, 2000, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        amount === amt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="100"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold p-3 bg-stone-100 border border-stone-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Your UPI ID (VPA)</label>
                <input
                  type="text"
                  placeholder="e.g. mobile@paytm or name@okhdfcbank"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-stone-100 border border-stone-200 rounded-xl focus:outline-emerald-500"
                />
                <div className="flex gap-2 mt-1.5 text-[10px] text-stone-500">
                  <span>Quick suffixes:</span>
                  {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map(sfx => (
                    <button
                      key={sfx}
                      type="button"
                      onClick={() => setVpa((vpa.split('@')[0] || 'student') + sfx)}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      {sfx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zero-PIN Security Guarantee */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-900 font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero-PIN Security Guarantee</span>
                </div>
                <p className="text-[10px] text-stone-500">
                  CareerWealth <strong>never</strong> prompts for or stores your confidential UPI PIN. You will receive an official NPCI collect request on your mobile device.
                </p>
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  {loading ? 'Initiating Request...' : `Send UPI Collect Request (₹${amount.toLocaleString('en-IN')})`}
                </button>
              </div>
            </form>
          )}

          {step === 'AWAITING_APPROVAL' && mandateData && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl animate-pulse">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900">Collect Request Dispatched!</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  An authorized NPCI payment mandate of <strong>₹{amount.toLocaleString('en-IN')}</strong> was sent to <strong>{vpa}</strong>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-left space-y-2 text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Next Step: Authorize in your Mobile App</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800 font-medium">
                  <li>Open Google Pay, PhonePe, Paytm, or BHIM.</li>
                  <li>Check your pending Mandates / Collect requests.</li>
                  <li>Enter your confidential Bank UPI PIN directly in that app.</li>
                </ol>
              </div>

              <div className="p-2.5 bg-stone-100 rounded-xl text-[10px] font-mono text-stone-500">
                Ref: {mandateData.mandate_ref}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleSimulateBankApproval}
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying with Bank...' : 'I Have Approved in UPI App'}</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-bold transition cursor-pointer"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-stone-900">Funds Deposited to Broker Margin!</h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                ₹{amount.toLocaleString('en-IN')} has been verified by the NPCI banking switch and credited to your broker trading account balance.
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono text-stone-600">
                <div>Broker: {brokerStatus?.broker_name || 'Regulated Clearing Demat'}</div>
                <div>Status: COMPLETED (DEPOSITED)</div>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-black transition cursor-pointer"
              >
                Return to Trading Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
