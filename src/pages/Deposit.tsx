import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { ArrowDownCircle, CheckCircle2, AlertCircle, Loader2, Copy, ExternalLink, Clock, Wallet, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Deposit: React.FC = () => {
  const { token, refreshProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const res = await axios.get('/api/offers/active');
        setActiveOffer(res.data);
      } catch (error) {
        console.error('Failed to fetch active offer:', error);
      }
    };
    fetchActiveOffer();
  }, []);

  const calculateBonus = () => {
    const depAmount = parseFloat(amount) || 0;
    if (!activeOffer || promoCode.toUpperCase() !== activeOffer.code.toUpperCase()) return 0;
    if (depAmount < activeOffer.minDeposit) return 0;
    
    let bonus = (depAmount * activeOffer.bonusPercent) / 100;
    if (activeOffer.maxBonus) {
      bonus = Math.min(bonus, activeOffer.maxBonus);
    }
    return bonus;
  };

  const bonus = calculateBonus();
  const total = (parseFloat(amount) || 0) + bonus;
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [loadingWallets, setLoadingWallets] = useState(true);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/wallets');
      setWallets(response.data);
      if (response.data.length > 0) {
        setSelectedWallet(response.data[0]);
      }
    } catch (error) {
      console.error("Fetch wallets error:", error);
    } finally {
      setLoadingWallets(false);
    }
  };

  const walletAddress = "0x1234567890abcdef1234567890abcdef12345678"; // Example USDT (TRC20) address

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/deposits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Deposit history error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchWallets();
  }, [token]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txHash || !token) return;

    setLoading(true);
    try {
      await axios.post('/api/deposits', {
        amount: parseFloat(amount),
        txHash,
        promoCode: promoCode || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Deposit request submitted!');
      setAmount('');
      setTxHash('');
      setPromoCode('');
      fetchHistory();
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Deposit USDT</h1>
            <p className="text-gray-500 text-sm">Add funds to your wallet via TRC20 network.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Deposit Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <div className="mb-8 space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Select Network
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {loadingWallets ? (
                    <div className="col-span-full py-4 flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : wallets.map((wal) => (
                    <button
                      key={wal._id}
                      onClick={() => setSelectedWallet(wal)}
                      className={`px-4 py-3 rounded-2xl border transition-all text-xs font-bold ${
                        selectedWallet?._id === wal._id 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {wal.network}
                    </button>
                  ))}
                </div>

                {selectedWallet && (
                  <div className="p-5 bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">USDT ({selectedWallet.network}) Address</p>
                        <p className="text-[10px] text-blue-100/60">Send only USDT via {selectedWallet.network} network</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 group mb-4">
                      <span className="text-[10px] font-mono text-gray-400 break-all mr-2 leading-relaxed">{selectedWallet.address}</span>
                      <button onClick={() => copyAddress(selectedWallet.address)} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90">
                        <Copy className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>

                    {selectedWallet.qrCode && (
                      <div className="flex justify-center p-4 bg-white rounded-2xl mb-4">
                        <img src={selectedWallet.qrCode} alt="QR Code" className="w-32 h-32" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-200/80 leading-relaxed">
                        Warning: Send only selected network, wrong network may result in loss of funds.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Amount Sent (USDT)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Transaction Hash (TXID)
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="block w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter TXID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="block w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none uppercase font-mono"
                    placeholder="Enter Promo Code"
                  />
                  {activeOffer && promoCode.toUpperCase() === activeOffer.code.toUpperCase() && (
                    <p className="mt-2 text-[10px] text-green-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Promo Applied: {activeOffer.bonusPercent}% Bonus
                    </p>
                  )}
                </div>

                {parseFloat(amount) > 0 && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Deposit Amount:</span>
                      <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    {bonus > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">Bonus Amount:</span>
                        <span className="font-bold text-green-400">+${bonus.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                      <span className="font-bold">Total to Receive:</span>
                      <span className="font-bold text-blue-500">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Submit Deposit Request'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Deposit History */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-6">Deposit History</h3>
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
                      <ArrowDownCircle className="w-8 h-8 text-gray-700" />
                    </div>
                    <p className="text-gray-500 text-sm">No deposits yet</p>
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

export default Deposit;
