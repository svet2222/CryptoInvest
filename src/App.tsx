import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invest from './pages/Invest';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Admin from './pages/Admin';
import Referrals from './pages/Referrals';
import About from './pages/About';
import Verification from './pages/Verification';
import Support from './pages/Support';

import { TopBanner, OfferPopup } from './components/OfferSystem';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
          <TopBanner />
          <OfferPopup />
          <Toaster position="top-right" />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/:tab" element={<Admin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
