import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X, Gift, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Offer {
  _id: string;
  title: string;
  description: string;
  code: string;
  bonusPercent: number;
  minDeposit: number;
  maxBonus: number | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export const CountdownTimer: React.FC<{ endTime: string; onExpire?: () => void }> = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft('00:00:00');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  return <span className="font-mono font-bold">{timeLeft}</span>;
};

export const TopBanner: React.FC = () => {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [isVisible, setIsVisible] = useState(true);

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

  if (!activeOffer || !isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-[60] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="hidden sm:flex p-1.5 bg-white/20 rounded-lg animate-pulse">
            <Gift className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold truncate">
            {activeOffer.title}: <span className="text-yellow-300">{activeOffer.bonusPercent}% Bonus</span> with code <span className="bg-white/20 px-2 py-0.5 rounded font-mono">{activeOffer.code}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1 rounded-full border border-white/10">
            <Timer className="w-3.5 h-3.5" />
            <CountdownTimer endTime={activeOffer.endTime} onExpire={() => setIsVisible(false)} />
          </div>
          
          <Link
            to="/deposit"
            className="bg-white text-blue-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-1"
          >
            Deposit Now
            <ArrowRight className="w-3 h-3" />
          </Link>
          
          <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const OfferPopup: React.FC = () => {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkOffer = async () => {
      const hasSeen = localStorage.getItem('hasSeenOfferPopup');
      if (hasSeen) return;

      try {
        const res = await axios.get('/api/offers/active');
        if (res.data) {
          setActiveOffer(res.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to fetch active offer:', error);
      }
    };
    checkOffer();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenOfferPopup', 'true');
  };

  const handleCopy = () => {
    if (!activeOffer) return;
    navigator.clipboard.writeText(activeOffer.code);
    setCopied(true);
    toast.success('Promo code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeOffer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="h-40 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Gift className="w-20 h-20 text-white" />
                </motion.div>
              </div>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeOffer.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{activeOffer.description}</p>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Use Promo Code</p>
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xl font-black text-blue-600 font-mono tracking-wider">{activeOffer.code}</span>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-blue-600"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
                  <Timer className="w-3.5 h-3.5" />
                  Ends in: <CountdownTimer endTime={activeOffer.endTime} />
                </div>
              </div>

              <Link
                to="/deposit"
                onClick={handleClose}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                Deposit Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="mt-4 text-[10px] text-gray-400 font-medium">
                *Min deposit ${activeOffer.minDeposit} required. {activeOffer.maxBonus ? `Max bonus $${activeOffer.maxBonus}.` : ''}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const DashboardOfferCard: React.FC = () => {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

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

  if (!activeOffer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Active Offer</span>
        </div>
        
        <h3 className="text-xl font-bold mb-1">{activeOffer.bonusPercent}% Deposit Bonus</h3>
        <p className="text-sm opacity-80 mb-6">Use code: <span className="font-mono font-bold text-yellow-300">{activeOffer.code}</span></p>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-60">Time Left</span>
            <div className="flex items-center gap-1.5 text-sm font-bold">
              <Timer className="w-4 h-4" />
              <CountdownTimer endTime={activeOffer.endTime} />
            </div>
          </div>
          
          <Link
            to="/deposit"
            className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-lg"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
