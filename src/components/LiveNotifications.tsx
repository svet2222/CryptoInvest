import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../AuthContext';

const NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Skyler', 'Quinn', 'Avery'];
const AMOUNTS = [100, 250, 500, 1000, 2500, 5000, 10000];

export const LiveNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<{ name: string; amount: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
      setNotification({ name, amount });

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: -20 }}
          className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex items-center space-x-3"
        >
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              New Deposit!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {notification.name} just deposited ${notification.amount.toLocaleString()}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
