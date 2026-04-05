import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Settings, 
  TrendingUp, 
  Shield, 
  Edit2, 
  Check, 
  X,
  Pause,
  Play,
  Zap,
  Clock,
  Loader2,
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Send,
  User,
  Gift
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Admin: React.FC = () => {
  const { token } = useAuth();
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'deposits' | 'withdrawals' | 'investments' | 'settings' | 'plans' | 'manual_profit' | 'verifications' | 'wallets' | 'fees' | 'support' | 'bonus' | 'offers'>( (tab as any) || 'dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    code: '',
    bonusPercent: 0,
    minDeposit: 0,
    maxBonus: 0,
    startTime: '',
    endTime: '',
    isActive: true
  });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [newWallet, setNewWallet] = useState({ network: '', address: '', qrCode: '', status: 'active' });
  const [newPlan, setNewPlan] = useState({ 
    name: '', 
    minAmount: 0, 
    maxAmount: 0, 
    minDailyProfit: 0, 
    maxDailyProfit: 0, 
    duration: 0, 
    totalReturn: 0, 
    status: 'active' 
  });
  const [bonusConfig, setBonusConfig] = useState<any>({
    isEnabled: true,
    bonusPercentage: 10,
    promoCode: 'WELCOME10',
    bannerUrl: 'https://picsum.photos/seed/bonus/800/400',
    title: '🎁 Deposit Bonus Offer',
    description: 'Get 10% instant bonus on your first deposit'
  });
  const [loading, setLoading] = useState(true);
  const [planReturns, setPlanReturns] = useState({
    'Starter Algorithm': '',
    'Silver Algorithm': '',
    'Gold Algorithm': ''
  });

  useEffect(() => {
    if (tab) {
      setActiveTab(tab as any);
    } else {
      setActiveTab('dashboard');
    }
  }, [tab]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [uRes, dRes, wRes, iRes, cRes, vRes, walRes, fRes, sRes, pRes, oRes] = await Promise.all([
        axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/deposits', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/investments', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/verifications', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/wallets', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/fees'),
        axios.get('/api/admin/support', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/plans', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/offers', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(uRes.data);
      setDeposits(dRes.data);
      setWithdrawals(wRes.data);
      setInvestments(iRes.data);
      setConfigs(cRes.data);
      setVerifications(vRes.data);
      setWallets(walRes.data);
      setFees(fRes.data);
      setSupportTickets(sRes.data);
      setPlans(pRes.data);
      setOffers(oRes.data);
      
      const bRes = await axios.get('/api/bonus-config');
      setBonusConfig(bRes.data);
    } catch (error) {
      console.error("Admin data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdateUser = async (id: string, data: any) => {
    try {
      await axios.put(`/api/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User updated');
      setEditingUser(null);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleApproveDeposit = async (id: string) => {
    try {
      await axios.put(`/api/admin/deposits/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deposit approved');
      fetchData();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleUpdateConfig = async (key: string, value: any) => {
    try {
      await axios.post('/api/admin/config', { key, value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Configuration updated');
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleApplyReturn = async (planName: string) => {
    const percent = parseFloat(planReturns[planName as keyof typeof planReturns]);
    if (isNaN(percent)) {
      toast.error('Please enter a valid percentage');
      return;
    }

    if (!window.confirm(`Are you sure you want to apply a ${percent}% ${percent >= 0 ? 'profit' : 'loss'} to all users in ${planName}?`)) {
      return;
    }

    try {
      await axios.post('/api/admin/apply-return', { planName, percent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Return applied successfully');
      setPlanReturns({ ...planReturns, [planName]: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to apply return');
    }
  };

  const handleVerifyUser = async (id: string, status: 'approved' | 'rejected') => {
    setVerifyingId(id);
    try {
      await axios.put(`/api/admin/verifications/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Verification ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Verification update failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleApproveInvestment = async (id: string) => {
    try {
      await axios.put(`/api/admin/investments/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Investment approved');
      fetchData();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleRejectInvestment = async (id: string) => {
    try {
      await axios.put(`/api/admin/investments/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Investment rejected');
      fetchData();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handleSavePlan = async () => {
    try {
      await axios.post('/api/admin/plans', newPlan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Plan created');
      setNewPlan({ name: '', minAmount: 0, maxAmount: 0, minDailyProfit: 0, maxDailyProfit: 0, duration: 0, totalReturn: 0, status: 'active' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  const handleUpdatePlan = async () => {
    try {
      await axios.put(`/api/admin/plans/${editingPlan._id}`, editingPlan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Plan updated');
      setEditingPlan(null);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await axios.delete(`/api/admin/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Plan deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleCreateWallet = async () => {
    try {
      await axios.post('/api/admin/wallets', newWallet, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Wallet added');
      setNewWallet({ network: '', address: '', qrCode: '', status: 'active' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add wallet');
    }
  };

  const handleUpdateWallet = async (id: string, data: any) => {
    try {
      await axios.put(`/api/admin/wallets/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Wallet updated');
      setEditingWallet(null);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) return;
    try {
      await axios.delete(`/api/admin/wallets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Wallet deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleUpdateFees = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/admin/fees', fees, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Withdrawal fees updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update fees');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      await axios.post(`/api/admin/support/${selectedTicket._id}/reply`, { text: replyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplyText('');
      const res = await axios.get(`/api/admin/support/${selectedTicket._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(res.data);
      fetchData();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleUpdateBonusConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/config', {
        key: 'bonus_popup_config',
        value: bonusConfig
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bonus configuration updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update bonus configuration');
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/offers', newOffer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Offer created successfully');
      setNewOffer({
        title: '',
        description: '',
        code: '',
        bonusPercent: 0,
        minDeposit: 0,
        maxBonus: 0,
        startTime: '',
        endTime: '',
        isActive: true
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create offer');
    }
  };

  const handleUpdateOffer = async (id: string, data: any) => {
    try {
      await axios.put(`/api/admin/offers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Offer updated');
      setEditingOffer(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axios.delete(`/api/admin/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Offer deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const isProfitPaused = configs.find(c => c.key === 'profit_system_paused')?.value === true;
  const profitMode = configs.find(c => c.key === 'profit_system_mode')?.value || 'auto';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Admin Terminal
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide monitoring and controls.</p>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</h3>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Deposits</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        ${deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Withdrawals</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        ${withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Investments</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {investments.filter(i => i.status === 'active').length}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Users</h3>
                      <div className="space-y-4">
                        {users.slice(0, 5).map(user => (
                          <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className="text-xs font-medium text-gray-400">{format(new Date(user.createdAt), 'MMM dd')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Status</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <Zap className={`w-5 h-5 ${isProfitPaused ? 'text-amber-500' : 'text-green-500'}`} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit Engine</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isProfitPaused ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                            {isProfitPaused ? 'PAUSED' : 'ACTIVE'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Verifications</span>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                            {verifications.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profit Engine</h3>
                          <p className="text-sm text-gray-500">Global control for daily profit distribution.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateConfig('profit_system_paused', !isProfitPaused)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                          isProfitPaused 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20' 
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20'
                        }`}
                      >
                        {isProfitPaused ? (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Resume Engine</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-5 h-5" />
                            <span>Pause Engine</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status: <span className={`font-bold ${isProfitPaused ? 'text-amber-600' : 'text-green-600'}`}>
                          {isProfitPaused ? 'PAUSED' : 'RUNNING'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 italic">
                        When paused, no daily profits will be distributed to users.
                      </p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Profit Distribution Mode</h4>
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                          onClick={() => handleUpdateConfig('profit_system_mode', 'auto')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${profitMode === 'auto' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                          AUTO (Random)
                        </button>
                        <button
                          onClick={() => handleUpdateConfig('profit_system_mode', 'manual')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${profitMode === 'manual' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                          MANUAL (Admin)
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">
                        {profitMode === 'auto' 
                          ? 'System will automatically generate random profits based on plan ranges every 24h.' 
                          : 'System will wait for Admin to manually apply returns via Plan Control tab.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'manual_profit' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map((plan, index) => (
                    <div key={plan._id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Plan {index + 1}</h3>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          index % 3 === 0 ? 'bg-green-100 text-green-600' : 
                          index % 3 === 1 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {plan.name.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-6">{plan.name}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Return Percentage (%)</label>
                          <input
                            type="number"
                            value={planReturns[plan.name] || ''}
                            onChange={(e) => setPlanReturns({ ...planReturns, [plan.name]: e.target.value })}
                            placeholder="e.g. 2.5 or -1.2"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <button
                          onClick={() => handleApplyReturn(plan.name)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Apply to All Users</span>
                        </button>
                      </div>
                      
                      <p className="mt-4 text-[10px] text-gray-500 italic">
                        Positive value = Profit<br />
                        Negative value = Loss
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              {editingUser?._id === u._id ? (
                                <input
                                  type="number"
                                  value={editingUser.walletBalance}
                                  onChange={(e) => setEditingUser({ ...editingUser, walletBalance: parseFloat(e.target.value) })}
                                  className="w-24 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                                />
                              ) : (
                                <span className="text-sm font-bold text-gray-900 dark:text-white">${u.walletBalance.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {editingUser?._id === u._id ? (
                                <select
                                  value={editingUser.role}
                                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                  className="px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {u.role.toUpperCase()}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {editingUser?._id === u._id ? (
                                <div className="flex justify-end space-x-2">
                                  <button onClick={() => handleUpdateUser(u._id, editingUser)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingUser(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <button onClick={() => setEditingUser(u)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'investments' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Maturity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {investments.map((inv) => (
                          <tr key={inv._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{inv.userId?.name}</p>
                              <p className="text-xs text-gray-500">{inv.userId?.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{inv.planName}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">${inv.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-green-600">+${inv.totalProfitEarned.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {inv.status === 'pending' ? (
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleApproveInvestment(inv._id)}
                                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectInvestment(inv._id)}
                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-900 dark:text-white">{inv.maturityDate ? format(new Date(inv.maturityDate), 'MMM dd, yyyy') : 'N/A'}</p>
                                  <p className={`text-[10px] font-bold ${inv.status === 'active' ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {inv.status.toUpperCase()}
                                  </p>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'deposits' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {deposits.map((d) => (
                          <tr key={d._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{d.userId?.name}</p>
                              <p className="text-xs text-gray-500">{d.userId?.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">${d.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                d.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                d.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {d.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {d.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveDeposit(d._id)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Charge</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payable</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {withdrawals.map((w) => (
                          <tr key={w._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{w.userId?.name}</p>
                              <p className="text-xs text-gray-500">{w.userId?.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">${w.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-red-500 font-bold">-${(w.charge || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-green-500 font-bold">${(w.finalAmount || w.amount).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                w.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                w.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {w.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'verifications' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {verifications.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No pending verifications</td>
                          </tr>
                        ) : (
                          verifications.map((v) => (
                            <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 dark:text-white">{v.firstName} {v.lastName}</div>
                                <div className="text-xs text-gray-500">{v.userId?.email}</div>
                                {v.userId?.kyc?.status === 'approved' && v.status === 'pending' && (
                                  <span className="mt-1 inline-block px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full uppercase">
                                    Updated Request
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">{v.phone}</div>
                                <div className="text-xs text-gray-500">{v.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">{v.country}</div>
                                <div className="text-xs text-gray-500">{v.city}, {v.state}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <a href={v.idFrontImage} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">ID Front</a>
                                  <a href={v.idBackImage} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">ID Back</a>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {v.status === 'pending' ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleVerifyUser(v._id, 'approved')}
                                      disabled={verifyingId === v._id}
                                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                      title="Approve"
                                    >
                                      {verifyingId === v._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => handleVerifyUser(v._id, 'rejected')}
                                      disabled={verifyingId === v._id}
                                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                      title="Reject"
                                    >
                                      {verifyingId === v._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${
                                    v.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                  }`}>
                                    {v.status === 'approved' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    {v.status.toUpperCase()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-8">
                  {/* Add Plan Form */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      {editingPlan ? 'Edit Investment Plan' : 'Add New Investment Plan'}
                    </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Name</label>
                          <input
                            type="text"
                            value={editingPlan ? editingPlan.name : newPlan.name}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, name: e.target.value}) : setNewPlan({...newPlan, name: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                            placeholder="e.g. Starter Plan"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Amount ($)</label>
                          <input
                            type="number"
                            value={editingPlan ? editingPlan.minAmount : newPlan.minAmount}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, minAmount: Number(e.target.value)}) : setNewPlan({...newPlan, minAmount: Number(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Amount ($)</label>
                          <input
                            type="number"
                            value={editingPlan ? editingPlan.maxAmount : newPlan.maxAmount}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, maxAmount: Number(e.target.value)}) : setNewPlan({...newPlan, maxAmount: Number(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Daily Profit (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingPlan ? editingPlan.minDailyProfit : newPlan.minDailyProfit}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, minDailyProfit: Number(e.target.value)}) : setNewPlan({...newPlan, minDailyProfit: Number(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Daily Profit (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingPlan ? editingPlan.maxDailyProfit : newPlan.maxDailyProfit}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, maxDailyProfit: Number(e.target.value)}) : setNewPlan({...newPlan, maxDailyProfit: Number(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Days)</label>
                          <input
                            type="number"
                            value={editingPlan ? editingPlan.duration : newPlan.duration}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, duration: Number(e.target.value)}) : setNewPlan({...newPlan, duration: Number(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Return (%)</label>
                          <input
                            type="number"
                            value={editingPlan ? editingPlan.totalReturn : newPlan.totalReturn}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, totalReturn: Number(e.target.value)}) : setNewPlan({...newPlan, totalReturn: Number(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                          <select
                            value={editingPlan ? editingPlan.status : newPlan.status}
                            onChange={(e) => editingPlan ? setEditingPlan({...editingPlan, status: e.target.value}) : setNewPlan({...newPlan, status: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    <div className="mt-6 flex gap-3">
                      {editingPlan ? (
                        <>
                          <button
                            onClick={handleUpdatePlan}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Update Plan
                          </button>
                          <button
                            onClick={() => setEditingPlan(null)}
                            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleSavePlan}
                          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          <Zap className="w-4 h-4" /> Save Plan
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plans List */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Range</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Profit/Duration</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {plans.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-900 dark:text-white">${p.minAmount} - ${p.maxAmount}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">{p.minDailyProfit}% - {p.maxDailyProfit}% Daily</div>
                                <div className="text-xs text-gray-500">{p.duration} Days</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setEditingPlan(p)}
                                    className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlan(p._id)}
                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
                  {/* Ticket List */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Support Tickets
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {supportTickets.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No tickets found</div>
                      ) : (
                        supportTickets.map((t) => (
                          <button
                            key={t._id}
                            onClick={() => setSelectedTicket(t)}
                            className={`w-full p-4 text-left border-b border-gray-50 dark:border-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              selectedTicket?._id === t._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">{t.userId?.name}</span>
                              <span className="text-[10px] text-gray-500">{format(new Date(t.lastMessageAt), 'HH:mm')}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-2">{t.messages[t.messages.length - 1]?.text}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                t.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {t.status}
                              </span>
                              {t.messages[t.messages.length - 1]?.sender === 'user' && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                    {selectedTicket ? (
                      <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white">{selectedTicket.userId?.name}</h4>
                              <p className="text-[10px] text-gray-500">{selectedTicket.userId?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30">
                          {selectedTicket.messages.map((m: any, idx: number) => (
                            <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                m.sender === 'admin' 
                                  ? 'bg-blue-600 text-white rounded-tr-none' 
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'
                              }`}>
                                {m.text}
                                <div className="text-[10px] opacity-50 mt-1 text-right">
                                  {format(new Date(m.timestamp), 'HH:mm')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                          <form onSubmit={handleSendReply} className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            />
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">Select a ticket to start chatting</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'fees' && fees && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdrawal Fees & Limits</h3>
                        <p className="text-sm text-gray-500">Configure global withdrawal rules for all users.</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateFees} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Charges Section */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Charges System</h4>
                          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Fixed Charge (USDT)</label>
                              <input
                                type="number"
                                value={fees.fixedCharge}
                                onChange={(e) => setFees({ ...fees, fixedCharge: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                              />
                              <p className="text-[10px] text-gray-500 mt-1">Set to 0 to use percentage charge instead.</p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Percentage Charge (%)</label>
                              <input
                                type="number"
                                value={fees.percentageCharge}
                                onChange={(e) => setFees({ ...fees, percentageCharge: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Range Section */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Withdrawal Range</h4>
                          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Minimum Amount (USDT)</label>
                              <input
                                type="number"
                                value={fees.minAmount}
                                onChange={(e) => setFees({ ...fees, minAmount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Maximum Amount (USDT)</label>
                              <input
                                type="number"
                                value={fees.maxAmount}
                                onChange={(e) => setFees({ ...fees, maxAmount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Limits Section */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Transfer Limits</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Daily Limit (USDT)</label>
                              <input
                                type="number"
                                value={fees.dailyLimit}
                                onChange={(e) => setFees({ ...fees, dailyLimit: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Monthly Limit (USDT)</label>
                              <input
                                type="number"
                                value={fees.monthlyLimit}
                                onChange={(e) => setFees({ ...fees, monthlyLimit: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-xs text-gray-500 italic">
                          Last updated: {fees.updatedAt ? format(new Date(fees.updatedAt), 'MMM dd, yyyy HH:mm') : 'Never'}
                        </p>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'wallets' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Add New USDT Wallet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <input
                        type="text"
                        placeholder="Network (e.g. TRC20)"
                        value={newWallet.network}
                        onChange={(e) => setNewWallet({ ...newWallet, network: e.target.value })}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Wallet Address"
                        value={newWallet.address}
                        onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="QR Code URL (Optional)"
                        value={newWallet.qrCode}
                        onChange={(e) => setNewWallet({ ...newWallet, qrCode: e.target.value })}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleCreateWallet}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all"
                      >
                        Add Wallet
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Network</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {wallets.map((wal) => (
                            <tr key={wal._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{wal.network}</span>
                              </td>
                              <td className="px-6 py-4">
                                {editingWallet?._id === wal._id ? (
                                  <input
                                    type="text"
                                    value={editingWallet.address}
                                    onChange={(e) => setEditingWallet({ ...editingWallet, address: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-500 font-mono">{wal.address}</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingWallet?._id === wal._id ? (
                                  <select
                                    value={editingWallet.status}
                                    onChange={(e) => setEditingWallet({ ...editingWallet, status: e.target.value })}
                                    className="px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                                  >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                  </select>
                                ) : (
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${wal.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {wal.status.toUpperCase()}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {editingWallet?._id === wal._id ? (
                                  <div className="flex justify-end space-x-2">
                                    <button onClick={() => handleUpdateWallet(wal._id, editingWallet)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingWallet(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end space-x-2">
                                    <button onClick={() => setEditingWallet(wal)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteWallet(wal._id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'offers' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Limited-Time Offer</h3>
                    <form onSubmit={handleCreateOffer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Title</label>
                        <input
                          type="text"
                          value={newOffer.title}
                          onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 🚀 Flash Deposit Bonus"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Description</label>
                        <textarea
                          value={newOffer.description}
                          onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                          placeholder="e.g. Get 20% extra USDT on your next deposit!"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Promo Code</label>
                        <input
                          type="text"
                          value={newOffer.code}
                          onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. FLASH20"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bonus Percentage (%)</label>
                        <input
                          type="number"
                          value={newOffer.bonusPercent}
                          onChange={(e) => setNewOffer({ ...newOffer, bonusPercent: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Min Deposit ($)</label>
                        <input
                          type="number"
                          value={newOffer.minDeposit}
                          onChange={(e) => setNewOffer({ ...newOffer, minDeposit: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Max Bonus ($) (0 for no limit)</label>
                        <input
                          type="number"
                          value={newOffer.maxBonus}
                          onChange={(e) => setNewOffer({ ...newOffer, maxBonus: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Start Time</label>
                        <input
                          type="datetime-local"
                          value={newOffer.startTime}
                          onChange={(e) => setNewOffer({ ...newOffer, startTime: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">End Time</label>
                        <input
                          type="datetime-local"
                          value={newOffer.endTime}
                          onChange={(e) => setNewOffer({ ...newOffer, endTime: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                        >
                          Create Offer
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Offer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bonus</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {offers.map((offer) => (
                            <tr key={offer._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">{offer.title}</span>
                                  <span className="text-xs text-gray-500 line-clamp-1">{offer.description}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-bold font-mono">
                                  {offer.code}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">{offer.bonusPercent}%</span>
                                  <span className="text-[10px] text-gray-500">Min: ${offer.minDeposit}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col text-[10px] text-gray-500">
                                  <span>Start: {format(new Date(offer.startTime), 'MMM d, HH:mm')}</span>
                                  <span>End: {format(new Date(offer.endTime), 'MMM d, HH:mm')}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleUpdateOffer(offer._id, { isActive: !offer.isActive })}
                                  className={`px-2 py-1 rounded-full text-[10px] font-bold ${offer.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                >
                                  {offer.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteOffer(offer._id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'bonus' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bonus Popup Settings</h3>
                        <p className="text-sm text-gray-500">Configure the promotional deposit bonus popup.</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateBonusConfig} className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Enable Popup</p>
                          <p className="text-xs text-gray-500">Show the bonus offer to eligible users.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBonusConfig({ ...bonusConfig, isEnabled: !bonusConfig.isEnabled })}
                          className={`w-12 h-6 rounded-full transition-all relative ${bonusConfig.isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${bonusConfig.isEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Promo Code</label>
                          <input
                            type="text"
                            value={bonusConfig.promoCode}
                            onChange={(e) => setBonusConfig({ ...bonusConfig, promoCode: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. WELCOME10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bonus Percentage (%)</label>
                          <input
                            type="number"
                            value={bonusConfig.bonusPercentage}
                            onChange={(e) => setBonusConfig({ ...bonusConfig, bonusPercentage: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Popup Title</label>
                        <input
                          type="text"
                          value={bonusConfig.title}
                          onChange={(e) => setBonusConfig({ ...bonusConfig, title: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 🎁 Deposit Bonus Offer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Description</label>
                        <textarea
                          value={bonusConfig.description}
                          onChange={(e) => setBonusConfig({ ...bonusConfig, description: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                          placeholder="e.g. Get 10% instant bonus on your first deposit"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Banner Image URL</label>
                        <input
                          type="text"
                          value={bonusConfig.bannerUrl}
                          onChange={(e) => setBonusConfig({ ...bonusConfig, bannerUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/banner.jpg"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Save Configuration
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
