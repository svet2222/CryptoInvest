import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LogOut, User, Menu, X, LayoutDashboard, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Users, Shield, Info, Settings, Zap, MessageSquare, Gift } from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Invest', path: '/invest' },
    { icon: ArrowDownCircle, label: 'Deposit', path: '/deposit' },
    { icon: ArrowUpCircle, label: 'Withdraw', path: '/withdraw' },
    { icon: Users, label: 'Referrals', path: '/referrals' },
    { icon: Info, label: 'About Us', path: '/about' },
    { icon: Shield, label: 'Verification', path: '/verification' },
    { icon: MessageSquare, label: 'Support', path: '/support' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: TrendingUp, label: 'Manage Investments', path: '/admin/investments' },
    { icon: ArrowDownCircle, label: 'Manage Deposits', path: '/admin/deposits' },
    { icon: ArrowUpCircle, label: 'Manage Withdrawals', path: '/admin/withdrawals' },
    { icon: Zap, label: 'Manage Plans', path: '/admin/plans' },
    { icon: TrendingUp, label: 'Manual Profit', path: '/admin/manual_profit' },
    { icon: Gift, label: 'Bonus Settings', path: '/admin/bonus' },
    { icon: Zap, label: 'Manage Offers', path: '/admin/offers' },
    { icon: Shield, label: 'Verification Requests', path: '/admin/verifications' },
    { icon: Wallet, label: 'Manage Wallets', path: '/admin/wallets' },
    { icon: MessageSquare, label: 'Support Chat', path: '/admin/support' },
    { icon: Settings, label: 'Withdrawal Fees', path: '/admin/fees' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggle}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-50 transition-transform lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* TOP: Logo + User Info */}
        <div className="flex-shrink-0">
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              CryptoInvest
            </Link>
            <button onClick={toggle} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-4 mb-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-widest font-bold">
                  {user?.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Menu items (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => toggle()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* BOTTOM: Settings + Logout (fixed) */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          {isAdmin && (
            <Link
              to="/admin/settings"
              onClick={() => toggle()}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-2 ${
                location.pathname === '/admin/settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-bold text-sm">Settings</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
