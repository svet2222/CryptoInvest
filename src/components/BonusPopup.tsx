import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface BonusConfig {
  isEnabled: boolean;
  bonusPercentage: number;
  promoCode: string;
  bannerUrl: string;
  title: string;
  description: string;
}

interface BonusPopupProps {
  onClose: () => void;
}

export const BonusPopup: React.FC<BonusPopupProps> = ({ onClose }) => {
  const [config, setConfig] = useState<BonusConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/api/bonus-config');
        setConfig(res.data);
      } catch (error) {
        console.error('Failed to fetch bonus config', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleCopy = () => {
    if (config) {
      navigator.clipboard.writeText(config.promoCode);
      setCopied(true);
      toast.success('Code copied successfully');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDepositNow = () => {
    onClose();
    navigate('/deposit');
  };

  if (loading || !config || !config.isEnabled) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0f1e] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={config.bannerUrl}
              alt="Bonus Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] to-transparent" />
            <div className="absolute bottom-4 left-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                <Gift className="w-3 h-3" />
                Limited Time Offer
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 pt-4">
            <h2 className="text-3xl font-bold text-white mb-2">{config.title}</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {config.description}
            </p>

            {/* Promo Code Box */}
            <div className="bg-white/5 border border-dashed border-blue-500/50 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center gap-4">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Use Promo Code</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-mono font-bold text-blue-400 tracking-tighter">
                  {config.promoCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all active:scale-95"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDepositNow}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                Deposit Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-gray-500 hover:text-gray-300 font-bold transition-all"
              >
                Maybe Later
              </button>
            </div>

            <p className="text-[10px] text-gray-600 text-center mt-6 uppercase tracking-widest font-bold">
              * Bonus will be locked until equivalent investment is made
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
