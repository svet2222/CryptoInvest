import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Users, Copy, Share2, TrendingUp, Clock, User, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Referrals: React.FC = () => {
  const { user, token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/referrals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
      } catch (error) {
        console.error("Referral history error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Program</h1>
            <p className="text-gray-500 dark:text-gray-400">Invite your friends and earn 5% commission on their deposits.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Referral Link Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Share2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Referral Link</h3>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">{referralLink}</span>
                <button onClick={copyLink} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Your Code</p>
                  <p className="text-lg font-bold text-blue-600">{user?.referralCode}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Commission</p>
                  <p className="text-lg font-bold text-green-600">5%</p>
                </div>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Earnings</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">${user?.totalReferralEarnings?.toLocaleString() || '0.00'}</p>
                <p className="text-sm text-gray-500 mt-1">Earned from successful referrals</p>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{history.length} Referrals</p>
                  <p className="text-xs text-gray-500">Active network members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral History */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Referral History</h3>
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Referral Commission</p>
                        <p className="text-xs text-gray-500">{format(new Date(item.timestamp), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+${item.commission}</p>
                      <p className="text-xs text-gray-500">from ${item.amount} deposit</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No referral history yet. Start inviting!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Referrals;
