import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { Send, MessageSquare, Loader2, User, Clock, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const Support: React.FC = () => {
  const { user, token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/support', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicket(response.data);
    } catch (error) {
      console.error("Support fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !token || sending) return;

    setSending(true);
    try {
      const response = await axios.post('/api/support/message', { text: message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicket(response.data);
      setMessage('');
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  const isAdminReplied = ticket?.messages?.some((m: any) => m.sender === 'admin' && m.text !== "Hi Sir 👋, how can I help you?");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 h-screen flex flex-col">
        <header className="p-4 lg:p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Support Chat</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online Support Team
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 custom-scrollbar" ref={scrollRef}>
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : ticket ? (
            <AnimatePresence initial={false}>
              {ticket.messages.map((msg: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] lg:max-w-[60%] p-4 rounded-3xl shadow-xl ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] opacity-50 font-bold">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                      {msg.sender === 'user' && (
                        <CheckCheck className="w-3 h-3 opacity-50" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {!isAdminReplied && ticket.messages.length > 2 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <span className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                    ⏳ Waiting for admin response...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                <MessageSquare className="w-10 h-10 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No messages yet</h3>
                <p className="text-sm text-gray-500">Send a message to start a conversation with our support team.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 lg:p-8 bg-black/50 backdrop-blur-xl border-t border-white/10">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-16"
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all disabled:opacity-50 active:scale-90"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Support;
