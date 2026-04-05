import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { BonusPopup } from '../components/BonusPopup';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Zap,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  ShieldEllipsis,
  Plus,
  ArrowDownCircle,
  History,
  LayoutDashboard,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, differenceInDays, isToday, isWithinInterval, subDays, startOfDay } from 'date-fns';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 2, className = '' }: { value: number, prefix?: string, suffix?: string, decimals?: number, className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};

import { DashboardOfferCard } from '../components/OfferSystem';

const Dashboard: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [investments, setInvestments] = useState<any[]>([]);
  const [profits, setProfits] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'profits'>('positions');
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const prevBalanceRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (user && prevBalanceRef.current !== null && user.walletBalance > prevBalanceRef.current) {
      toast.success(`Your balance has been updated! New balance: $${user.walletBalance.toLocaleString()}`, {
        icon: '💰',
        duration: 5000,
      });
    }
    if (user) {
      prevBalanceRef.current = user.walletBalance;
    }
  }, [user?.walletBalance]);

  useEffect(() => {
    if (user && !user.hasSeenBonusPopup && !user.hasDeposited) {
      setShowBonusPopup(true);
    }
  }, [user]);

  const handleCloseBonusPopup = async () => {
    setShowBonusPopup(false);
    try {
      await axios.put('/api/user/popup-seen', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProfile();
    } catch (error) {
      console.error('Failed to mark popup as seen', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [invRes, profitRes, transRes] = await Promise.all([
          axios.get('/api/investments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/profits', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/transactions/all', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setInvestments(invRes.data);
        setProfits(profitRes.data);
        setTransactions(transRes.data);
        await refreshProfile();
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      const fetchSilent = async () => {
        try {
          const [invRes, profitRes, transRes] = await Promise.all([
            axios.get('/api/investments', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('/api/profits', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('/api/transactions/all', { headers: { Authorization: `Bearer ${token}` } })
          ]);
          setInvestments(invRes.data);
          setProfits(profitRes.data);
          setTransactions(transRes.data);
          await refreshProfile();
        } catch (error) {
          console.error("Polling error:", error);
        }
      };
      fetchSilent();
    }, 5000); // 5 seconds polling as requested

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const fetchFilteredProfits = async () => {
      if (!token) return;
      try {
        let url = `/api/profits?range=${timeframe}`;
        if (timeframe === 'custom' && customRange.start && customRange.end) {
          url = `/api/profits?startDate=${customRange.start}&endDate=${customRange.end}`;
        }
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setProfits(res.data);
      } catch (error) {
        console.error("Failed to fetch filtered profits:", error);
      }
    };
    if (!loading) {
      fetchFilteredProfits();
    }
  }, [timeframe, customRange, token, loading]);

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const pendingInvestments = investments.filter(inv => inv.status === 'pending');
  const totalInvested = activeInvestments.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = pendingInvestments.reduce((acc, inv) => acc + inv.amount, 0);

  // Filtered Profit Logic
  const totalFilteredProfit = useMemo(() => {
    return profits.reduce((acc, p) => acc + p.amount, 0);
  }, [profits]);

  const avgProfitPercent = useMemo(() => {
    if (totalInvested === 0) return 0;
    return (totalFilteredProfit / totalInvested) * 100;
  }, [totalFilteredProfit, totalInvested]);

  const todayProfit = useMemo(() => {
    const today = startOfDay(new Date());
    return profits
      .filter(p => new Date(p.timestamp) >= today)
      .reduce((acc, p) => acc + p.amount, 0);
  }, [profits]);

  const todayProfitPercent = useMemo(() => {
    if (totalInvested === 0) return 0;
    return (todayProfit / totalInvested) * 100;
  }, [todayProfit, totalInvested]);

  const totalRunningProfit = activeInvestments.reduce((acc, inv) => acc + inv.totalProfitEarned, 0);

  // Prepare chart data
  const chartData = profits.slice(0, 7).reverse().map(p => ({
    date: format(new Date(p.timestamp), 'MMM dd'),
    profit: p.amount
  }));

  const allPositions = [...pendingInvestments, ...activeInvestments];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Top Section: Profile */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{user?.name}</h2>
                <p className="text-xs text-gray-500 font-mono">ID: {user?._id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.isVerified ? (
                <ShieldCheck className="w-5 h-5 text-green-500" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              )}
            </div>
          </header>

          {/* Portfolio Balance Card (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] p-8 mb-8 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-400 font-medium">Total Portfolio Balance</p>
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                  {(['today', '7days', '30days', 'custom'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${timeframe === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {t === '7days' ? '7D' : t === '30days' ? '30D' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                <AnimatedNumber value={(user?.walletBalance || 0) + totalInvested + totalPending + totalRunningProfit + (user?.bonusBalance || 0)} prefix="$" />
              </h1>
              <p className="text-xs text-green-400 font-bold mb-6 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Today's Profit: {todayProfitPercent.toFixed(2)}% (+${todayProfit.toFixed(2)})
              </p>

              {timeframe === 'custom' && (
                <div className="flex gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="date" 
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input 
                    type="date" 
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Invested</p>
                  <p className="text-sm font-bold">
                    <AnimatedNumber value={totalInvested + totalPending} prefix="$" decimals={0} />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Profit ({timeframe})</p>
                  <p className={`text-sm font-bold ${totalFilteredProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedNumber value={totalFilteredProfit} prefix={totalFilteredProfit >= 0 ? '+$' : '-$'} />
                  </p>
                  <p className="text-[8px] text-gray-500 font-bold">Avg: {avgProfitPercent.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Bonus Wallet</p>
                  <p className="text-sm font-bold text-blue-400">
                    <AnimatedNumber value={user?.bonusBalance || 0} prefix="$" decimals={2} />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Available</p>
                  <p className="text-sm font-bold">
                    <AnimatedNumber value={user?.walletBalance || 0} prefix="$" decimals={2} />
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <Wallet className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Deposit</span>
              </div>
              <p className="text-lg font-bold">${user?.totalDeposits?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Profit</span>
              </div>
              <p className="text-lg font-bold text-green-400">${user?.totalProfitEarned?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Bonus</span>
              </div>
              <p className="text-lg font-bold text-purple-400">${user?.totalBonusReceived?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Referral Earned</span>
              </div>
              <p className="text-lg font-bold text-amber-400">${user?.totalReferralEarnings?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Active Offer Card */}
          <div className="mb-8">
            <DashboardOfferCard />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link to="/deposit" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
              <Plus className="w-5 h-5" />
              Add Funds
            </Link>
            <Link to="/withdraw" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold transition-all active:scale-95 border border-white/10">
              <ArrowDownCircle className="w-5 h-5" />
              Withdraw
            </Link>
          </div>

          {/* Middle Section: Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-6 border-b border-white/10 mb-6">
              <button 
                onClick={() => setActiveTab('positions')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'positions' ? 'text-white' : 'text-gray-500'}`}
              >
                Positions
                {activeTab === 'positions' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}
              >
                Transaction History
                {activeTab === 'history' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
              </button>
              <button 
                onClick={() => setActiveTab('profits')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'profits' ? 'text-white' : 'text-gray-500'}`}
              >
                Profit History
                {activeTab === 'profits' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'positions' ? (
                <motion.div 
                  key="positions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {allPositions.length > 0 ? (
                    allPositions.map((inv) => (
                      <div key={inv._id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.status === 'pending' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                            {inv.status === 'pending' ? <Clock className="w-6 h-6 text-amber-500" /> : <TrendingUp className="w-6 h-6 text-blue-500" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{inv.planName}</h4>
                            {inv.status === 'pending' ? (
                              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">⏳ Waiting for admin approval</p>
                            ) : (
                              <p className="text-xs text-gray-500">Maturity in {differenceInDays(new Date(inv.maturityDate), new Date())} days</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">${inv.amount}</p>
                          {inv.status === 'active' && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${inv.totalProfitEarned >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {inv.totalProfitEarned >= 0 ? '+' : '-'}${Math.abs(inv.totalProfitEarned).toFixed(2)}
                            </span>
                          )}
                          {inv.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 bg-amber-500/10 text-amber-500">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <Zap className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No active positions</p>
                      <Link to="/invest" className="text-blue-500 text-xs font-bold mt-2 inline-block">Start Investing</Link>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'history' ? (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <div key={tx._id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            ['deposit', 'profit', 'bonus', 'referral'].includes(tx.type) ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {['deposit', 'profit', 'bonus', 'referral'].includes(tx.type) ? 
                              <ArrowUpRight className="w-6 h-6 text-green-500" /> : 
                              <ArrowDownLeft className="w-6 h-6 text-red-500" />
                            }
                          </div>
                          <div>
                            <h4 className="font-bold text-sm capitalize">{tx.type}</h4>
                            <p className="text-xs text-gray-500">{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</p>
                            {tx.source && <p className="text-[10px] text-gray-600 italic">{tx.source}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${
                            ['deposit', 'profit', 'bonus', 'referral'].includes(tx.type) ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {['deposit', 'profit', 'bonus', 'referral'].includes(tx.type) ? '+' : '-'}${tx.amount.toFixed(2)}
                          </p>
                          <span className="text-[10px] text-gray-500 uppercase font-bold">{tx.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <History className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No transaction history</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="profits"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Investment</th>
                        <th className="py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profit %</th>
                        <th className="py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {profits.length > 0 ? (
                        profits.map((p) => (
                          <tr key={p._id} className="group hover:bg-white/5 transition-all">
                            <td className="py-4 text-xs text-gray-400">{format(new Date(p.timestamp), 'MMM dd, yyyy')}</td>
                            <td className="py-4 text-xs font-bold">${p.amountInvested?.toLocaleString()}</td>
                            <td className="py-4 text-xs text-green-400 font-bold">{p.percentage}%</td>
                            <td className="py-4 text-right text-xs font-bold text-green-400">+${p.amount.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">No profit history found for this period</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Performance Chart (Desktop Only or Optional) */}
          <div className="hidden lg:block bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] mt-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Profit Performance
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.05} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
      {showBonusPopup && <BonusPopup onClose={handleCloseBonusPopup} />}
    </div>
  );
};

export default Dashboard;
