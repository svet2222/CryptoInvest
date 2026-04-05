import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, CheckCircle2, AlertCircle, Loader2, Clock, ShieldAlert, Wallet, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Withdraw: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/withdrawals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Withdrawal history error:", error);
    } finally {
      setHistory(prev => prev || []);
      setLoadingHistory(false);
    }
  };

  const fetchFees = async () => {
    try {
      const response = await axios.get('/api/fees');
      setFees(response.data);
    } catch (error) {
      console.error("Fees fetch error:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchFees();
  }, [token]);

  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              To ensure the security of your funds, please complete account verification to enable withdrawals.
            </p>
            <Link
              to="/verification"
              className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Complete Verification
            </Link>
          </motion.div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !token) return;

    const numAmount = parseFloat(amount);
    if (fees) {
      if (numAmount < fees.minAmount) {
        toast.error(`Minimum withdrawal is ${fees.minAmount} USDT`);
        return;
      }
      if (numAmount > fees.maxAmount) {
        toast.error(`Maximum withdrawal is ${fees.maxAmount} USDT`);
        return;
      }
    }

    if (numAmount > (user?.walletBalance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/withdrawals', {
        amount: numAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Withdrawal request submitted!');
      setAmount('');
      fetchHistory();
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateCharge = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !fees) return 0;
    if (fees.fixedCharge > 0) return fees.fixedCharge;
    return (numAmount * fees.percentageCharge) / 100;
  };

  const charge = calculateCharge();
  const finalAmount = parseFloat(amount) - charge;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
            <p className="text-gray-500 text-sm">Withdraw your earnings to your USDT (TRC20) wallet.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Withdrawal Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <div className="mb-8 p-6 bg-gradient-to-br from-red-500/20 to-red-600/5 rounded-[2rem] border border-red-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Available Balance</p>
                </div>
                <h3 className="text-4xl font-bold text-white">${user?.walletBalance?.toLocaleString() || '0.00'}</h3>
                {fees && (
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] text-red-100/60 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      Min: {fees.minAmount} USDT | Max: {fees.maxAmount} USDT
                    </p>
                    <p className="text-[10px] text-red-100/60 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      Daily Limit: {fees.dailyLimit} USDT
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleWithdraw} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Withdrawal Amount (USDT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-bold">USDT</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    USDT (TRC20) Wallet Address
                  </label>
                  <input
                    type="text"
                    className="block w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter TRC20 address"
                    required
                  />
                </div>

                {amount && !isNaN(parseFloat(amount)) && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Withdrawal Amount</span>
                      <span className="text-white font-bold">{amount} USDT</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Charge Applied</span>
                      <span className="text-red-400 font-bold">-{charge.toFixed(2)} USDT</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">You Receive</span>
                      <span className="text-green-400 font-bold">{(finalAmount > 0 ? finalAmount : 0).toFixed(2)} USDT</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Request Withdrawal'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Withdrawal History */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-6">Withdrawal History</h3>
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  history.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          tx.status === 'approved' ? 'bg-green-500/10' : 
                          tx.status === 'rejected' ? 'bg-red-500/10' : 
                          'bg-yellow-500/10'
                        }`}>
                          <Clock className={`w-5 h-5 ${
                            tx.status === 'approved' ? 'text-green-400' : 
                            tx.status === 'rejected' ? 'text-red-400' : 
                            'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">${tx.amount} USDT</p>
                          <p className="text-[10px] text-gray-500">{format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          tx.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                          tx.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowUpCircle className="w-8 h-8 text-gray-700" />
                    </div>
                    <p className="text-gray-500 text-sm">No withdrawals yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Withdraw;
