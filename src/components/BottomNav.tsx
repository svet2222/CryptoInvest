import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Plus, ArrowDownCircle, User } from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        
        <NavLink to="/invest" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-medium">Invest</span>
        </NavLink>

        <div className="relative -mt-10">
          <NavLink to="/deposit">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] border-4 border-black"
            >
              <Plus className="w-8 h-8 text-white" />
            </motion.div>
          </NavLink>
        </div>

        <NavLink to="/withdraw" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <ArrowDownCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Withdraw</span>
        </NavLink>

        <NavLink to="/verification" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
