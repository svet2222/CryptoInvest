import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { TrendingUp, Shield, Zap, Users, ArrowRight, Globe, BarChart3, Wallet } from 'lucide-react';

const FeatureCard: React.FC<{ icon: any; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
  >
    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-6">
                Trusted by 50,000+ Investors
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                Grow Your Wealth with <span className="text-blue-600 dark:text-blue-400">CryptoInvest</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Secure, transparent, and high-yield crypto investment platform. Start your journey today with as little as $100.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide the most secure and efficient way to invest in the crypto market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Secure Platform"
              description="Your funds are protected by industry-leading security protocols and multi-signature wallets."
            />
            <FeatureCard
              icon={TrendingUp}
              title="High Yields"
              description="Our expert-managed investment plans offer competitive daily profits based on market performance."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Withdrawals"
              description="Request your earnings anytime and receive them instantly in your preferred crypto wallet."
            />
            <FeatureCard
              icon={Users}
              title="Referral Program"
              description="Earn 5% commission on every deposit made by your referrals. Unlimited earnings potential."
            />
            <FeatureCard
              icon={Globe}
              title="Global Access"
              description="Invest from anywhere in the world. Our platform is accessible 24/7 on any device."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Analytics"
              description="Track your portfolio performance with advanced charts and real-time market data."
            />
          </div>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Investment Plans</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose a plan that fits your investment goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', min: 100, max: 1000, profit: '0.5% - 1%' },
              { name: 'Silver', min: 1000, max: 5000, profit: '1% - 2%' },
              { name: 'Gold', min: 5000, max: 20000, profit: '2% - 4%' },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name} Plan</h3>
                <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">{plan.profit} <span className="text-lg font-normal text-gray-500">Daily</span></div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Min Deposit</span>
                    <span className="font-bold text-gray-900 dark:text-white">${plan.min}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max Deposit</span>
                    <span className="font-bold text-gray-900 dark:text-white">${plan.max}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-bold text-gray-900 dark:text-white">30 Days</span>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="block w-full py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-blue-700 transition-all"
                >
                  Invest Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center space-x-6 mb-4 font-medium text-gray-600 dark:text-gray-400">
            <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</Link>
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400">Sign In</Link>
            <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400">Register</Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            © 2026 CryptoInvest Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
