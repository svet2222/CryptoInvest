import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { TrendingUp, CheckCircle2, AlertCircle, Loader2, Zap, ChevronRight, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const plans = [
  {
    name: 'Starter Algorithm',
    min: 100,
    max: 1000,
    minProfit: 0.5,
    maxProfit: 1,
    duration: 30,
    risk: 'Low Risk',
    riskColor: 'text-green-400 bg-green-500/10',
    color: 'blue'
  },
  {
    name: 'Silver Algorithm',
    min: 1000,
    max: 5000,
    minProfit: 1,
    maxProfit: 2,
    duration: 30,
    risk: 'Medium Risk',
    riskColor: 'text-blue-400 bg-blue-500/10',
    color: 'green'
  },
  {
    name: 'Gold Algorithm',
    min: 5000,
    max: 20000,
    minProfit: 2,
    maxProfit: 4,
    duration: 30,
    risk: 'High Risk',
    riskColor: 'text-purple-400 bg-purple-500/10',
    color: 'purple'
  }
];

const Invest: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get('/api/plans');
        setPlans(res.data);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setFetchingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !amount || !token) return;

    const numAmount = parseFloat(amount);
    if (numAmount < selectedPlan.minAmount || numAmount > selectedPlan.maxAmount) {
      toast.error(`Amount must be between $${selectedPlan.minAmount} and $${selectedPlan.maxAmount}`);
      return;
    }

    if (numAmount > (user?.walletBalance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/investments', {
        planName: selectedPlan.name,
        amount: numAmount,
        minDailyProfit: selectedPlan.minDailyProfit,
        maxDailyProfit: selectedPlan.maxDailyProfit,
        duration: selectedPlan.duration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || 'Investment successful!');
      setAmount('');
      setSelectedPlan(null);
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Investment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Investment Plans</h1>
            <p className="text-gray-500 text-sm">Select a strategy to grow your portfolio.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {fetchingPlans ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No active investment plans available at the moment.
              </div>
            ) : (
              plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${
                    selectedPlan?._id === plan._id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20`}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      plan.maxDailyProfit < 1 ? 'text-green-400 bg-green-500/10' : 
                      plan.maxDailyProfit < 2 ? 'text-blue-400 bg-blue-500/10' : 
                      'text-purple-400 bg-purple-500/10'
                    }`}>
                      {plan.maxDailyProfit < 1 ? 'Low Risk' : plan.maxDailyProfit < 2 ? 'Medium Risk' : 'High Risk'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-blue-400 mb-6">{plan.minDailyProfit}% - {plan.maxDailyProfit}% <span className="text-xs font-medium text-gray-500">Daily</span></p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Min Investment</span>
                      <span className="font-bold">${plan.minAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Max Investment</span>
                      <span className="font-bold">${plan.maxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-bold">{plan.duration} Days</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <AnimatePresence>
            {selectedPlan && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
              >
                <h3 className="text-xl font-bold mb-6">Invest in {selectedPlan.name}</h3>
                <form onSubmit={handleInvest}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Investment Amount (USDT)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={selectedPlan.minAmount}
                        max={selectedPlan.maxAmount}
                        className="block w-full pl-4 pr-12 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder={`Min: $${selectedPlan.minAmount}`}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-bold">USDT</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Available: <span className="font-bold text-white">${user?.walletBalance?.toLocaleString() || '0.00'}</span>
                      </p>
                      <button 
                        type="button"
                        onClick={() => setAmount(user?.walletBalance?.toString() || '')}
                        className="text-xs text-blue-500 font-bold"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-5 rounded-2xl mb-8 flex items-start gap-4 border border-blue-500/20">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-100/80 leading-relaxed">
                      <p className="font-bold text-blue-400 mb-1">Profit Estimation</p>
                      <p>Expected daily return: <span className="text-white font-bold">${(parseFloat(amount || '0') * selectedPlan.minDailyProfit / 100).toFixed(2)} - ${(parseFloat(amount || '0') * selectedPlan.maxDailyProfit / 100).toFixed(2)}</span></p>
                      <p className="mt-1">Total return after {selectedPlan.duration} days: <span className="text-white font-bold">${(parseFloat(amount || '0') * (1 + (selectedPlan.minDailyProfit * selectedPlan.duration / 100))).toFixed(2)} - ${(parseFloat(amount || '0') * (1 + (selectedPlan.maxDailyProfit * selectedPlan.duration / 100))).toFixed(2)}</span></p>
                      <p className="mt-2 text-[10px] text-blue-400/60 italic">
                        * Profit is variable and depends on system performance. Returns are not guaranteed.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Confirm Investment'
                    )}
                  </button>
                  <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest font-bold">
                    Note: Your investment will start from the next day after admin approval.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Invest;
