import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { 
  Info, 
  Target, 
  Eye, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Lock, 
  AlertTriangle,
  ChevronRight,
  Globe,
  Activity,
  TrendingUp
} from 'lucide-react';

const About: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const features = [
    { icon: Cpu, title: "Automated Trading System", description: "Our advanced algorithms execute trades based on real-time data analysis." },
    { icon: BarChart3, title: "Real-time Dashboard", description: "Monitor your investment performance and market activity as it happens." },
    { icon: ShieldCheck, title: "Secure Wallet Management", description: "Your funds are protected by industry-standard encryption and security protocols." },
    { icon: Zap, title: "Transparent Performance", description: "View detailed logs of all algorithmic trading activities and returns." },
    { icon: Lock, title: "Admin-Managed Control", description: "System-wide monitoring ensures platform stability and security." }
  ];

  const steps = [
    { title: "Choose a Plan", description: "Select a risk-based plan that aligns with your investment goals." },
    { title: "Algorithm Activation", description: "Our system activates the corresponding trading strategy for your capital." },
    { title: "Regular Updates", description: "Performance data is updated regularly, reflecting market-simulated results." },
    { title: "Track & Manage", description: "Use your personal dashboard to track activity and manage your portfolio." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 md:p-16 mb-12 text-white shadow-2xl shadow-blue-500/20">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                <Info className="w-3 h-3" />
                <span>Our Story</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                About Our Platform
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                We are a technology-driven algorithmic trading platform designed to provide smart and efficient investment solutions for the modern era.
              </p>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </section>

          {/* Company Introduction */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Redefining Modern Investing
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Our platform utilizes advanced algorithms to navigate the complexities of financial markets. We focus on data-driven trading strategies that remove emotional bias and prioritize systematic performance. 
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Designed specifically for modern investors, our system bridges the gap between sophisticated institutional technology and accessible user interfaces, allowing you to participate in algorithmic trading with ease.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Global Reach</p>
                </div>
                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-center">
                  <Activity className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Real-time Data</p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Smart Growth</p>
                </div>
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-center">
                  <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Secure Tech</p>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400">
                To provide accessible and intelligent trading solutions for users worldwide, empowering them with technology that was once reserved for elite financial institutions.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-400">
                To become a globally trusted platform for algorithmic investment systems, recognized for our commitment to transparency, security, and technological excellence.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full transition-all hover:border-blue-500">
                    <div className="text-3xl font-black text-gray-100 dark:text-gray-800 mb-4 group-hover:text-blue-100 dark:group-hover:text-blue-900 transition-colors">
                      0{idx + 1}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                      <ChevronRight className="w-8 h-8 text-gray-200 dark:text-gray-800" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Investment Approach */}
          <section className="bg-gray-900 dark:bg-black rounded-3xl p-8 md:p-12 mb-20 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-6">Our Investment Approach</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                We believe in structured risk management. Our platform offers three distinct risk-based plans (Low, Medium, and High) to suit different investor profiles. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-green-400 uppercase mb-1">Low Risk</p>
                  <p className="text-sm text-gray-300">Conservative strategies focusing on stability.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-blue-400 uppercase mb-1">Medium Risk</p>
                  <p className="text-sm text-gray-300">Balanced approach for moderate growth.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-purple-400 uppercase mb-1">High Risk</p>
                  <p className="text-sm text-gray-300">Aggressive strategies for higher potential.</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic border-l-2 border-blue-500 pl-4">
                Our system utilizes market-based performance simulation. We do not offer fixed or guaranteed returns, as algorithmic trading is inherently subject to market conditions.
              </p>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Trust */}
          <section className="mb-20 bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 md:p-12 border border-blue-100 dark:border-blue-800/30">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Security & Trust</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Advanced Data Protection</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Secure Backend Infrastructure</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Continuous 24/7 System Monitoring</p>
                  </div>
                </div>
                <p className="mt-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We prioritize the safety of your data and assets. Our platform is built on a secure foundation with multiple layers of protection to ensure a safe environment for your algorithmic trading activities.
                </p>
              </div>
              <div className="w-full md:w-64 flex justify-center">
                <div className="relative">
                  <ShieldCheck className="w-32 h-32 text-blue-600 opacity-20" />
                  <Lock className="w-12 h-12 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </section>

          {/* Risk Disclaimer */}
          <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-3xl p-8 md:p-10 mb-12">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4 uppercase tracking-tight">Risk Disclaimer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800/80 dark:text-amber-200/60 leading-relaxed">
                  <p>• Trading in financial markets involves significant risk to your capital.</p>
                  <p>• Returns are not guaranteed and may fluctuate based on market conditions.</p>
                  <p>• Performance may vary significantly based on the chosen algorithm and timing.</p>
                  <p>• Past results do not guarantee future performance in any trading strategy.</p>
                </div>
                <p className="mt-6 text-xs text-amber-700/60 dark:text-amber-200/40 font-medium">
                  Please ensure you fully understand the risks involved before participating in algorithmic trading.
                </p>
              </div>
            </div>
          </section>

          <footer className="text-center py-10 border-t border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CryptoInvest Algorithmic Trading Platform. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default About;
