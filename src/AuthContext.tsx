import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  walletBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  referralCode: string;
  referredBy: string;
  totalReferralEarnings: number;
  totalProfitEarned: number;
  totalBonusReceived: number;
  bonusBalance: number;
  hasSeenBonusPopup: boolean;
  hasDeposited: boolean;
  role: 'user' | 'admin';
  isVerified: boolean;
  kyc?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    address: string;
    pincode: string;
    idFrontImage: string;
    idBackImage: string;
    status: 'pending' | 'approved' | 'rejected' | null;
    submittedAt: string;
  };
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
      } else {
        console.error("Profile refresh error:", error);
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await refreshProfile();
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
