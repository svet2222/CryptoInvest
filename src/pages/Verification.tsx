import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { Shield, CheckCircle2, AlertCircle, Loader2, Upload, Camera, X, Info, User, Mail, Phone, Globe, MapPin, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const countries = [
  "United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "UAE", "Other"
];

const Verification: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    country: 'United States',
    state: '',
    city: '',
    address: '',
    pincode: '',
    idFrontImage: '',
    idBackImage: ''
  });
  const [files, setFiles] = useState<{ idFrontImage: File | null; idBackImage: File | null }>({
    idFrontImage: null,
    idBackImage: null
  });

  useEffect(() => {
    if (user?.kyc && !isEditing) {
      setFormData({
        firstName: user.kyc.firstName || '',
        lastName: user.kyc.lastName || '',
        email: user.kyc.email || user.email || '',
        phone: user.kyc.phone || '',
        country: user.kyc.country || 'United States',
        state: user.kyc.state || '',
        city: user.kyc.city || '',
        address: user.kyc.address || '',
        pincode: user.kyc.pincode || '',
        idFrontImage: user.kyc.idFrontImage || '',
        idBackImage: user.kyc.idBackImage || ''
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'idFrontImage' | 'idBackImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFiles(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!files.idFrontImage || !files.idBackImage) {
      toast.error('Please upload both front and back of your ID');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'idFrontImage' && key !== 'idBackImage') {
          data.append(key, value as string);
        }
      });
      if (files.idFrontImage) data.append('idFrontImage', files.idFrontImage);
      if (files.idBackImage) data.append('idBackImage', files.idBackImage);

      await axios.post('/api/kyc', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Verification request submitted!');
      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      // Always show success as per request
      toast.success('Verification request submitted!');
      await refreshProfile();
    } finally {
      setLoading(false);
    }
  };

  const kycStatus = user?.kyc?.status;

  if (kycStatus === 'approved' && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-2xl p-8 lg:p-12 rounded-[3rem] border border-green-500/20 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center border border-green-500/20 flex-shrink-0">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">Verified</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Your account is fully verified. You now have full access to all features.
                  </p>
                </div>
                <div className="md:ml-auto">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit KYC
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-blue-400">
                    <User className="w-5 h-5" />
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="First Name" value={user.kyc.firstName} />
                    <DetailItem label="Last Name" value={user.kyc.lastName} />
                    <DetailItem label="Email" value={user.kyc.email} className="col-span-2" />
                    <DetailItem label="Phone" value={user.kyc.phone} />
                    <DetailItem label="Country" value={user.kyc.country} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-purple-400">
                    <MapPin className="w-5 h-5" />
                    Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="City" value={user.kyc.city} />
                    <DetailItem label="State" value={user.kyc.state} />
                    <DetailItem label="Pincode" value={user.kyc.pincode} />
                    <DetailItem label="Address" value={user.kyc.address} className="col-span-2" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-amber-400">
                    <Camera className="w-5 h-5" />
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ID Front</p>
                      <div className="aspect-video rounded-3xl overflow-hidden border border-white/10">
                        <img src={user.kyc.idFrontImage} alt="ID Front" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ID Back</p>
                      <div className="aspect-video rounded-3xl overflow-hidden border border-white/10">
                        <img src={user.kyc.idBackImage} alt="ID Back" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (kycStatus === 'pending' && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-blue-500/20 shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Reviewing</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Your verification documents are being reviewed by our compliance team. This usually takes 24-48 hours.
            </p>
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest">
              Status: Pending
            </div>
          </motion.div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] to-black text-white pb-24 lg:pb-0">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Identity Verification</h1>
            <p className="text-gray-500 text-sm">Complete KYC to unlock full account features.</p>
            
            {kycStatus === 'rejected' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-sm">Verification Rejected</p>
                  <p className="text-red-100/60 text-xs mt-1">
                    Your previous submission was rejected. Please review your details and re-upload clear images of your ID.
                  </p>
                </div>
              </motion.div>
            )}
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-gray-500 cursor-not-allowed outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Address Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-500" />
                </div>
                Residential Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Country</label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                      required
                    >
                      {countries.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                    </select>
                    <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Pin / Zip Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Document Upload */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-amber-500" />
                </div>
                Identity Documents
              </h3>
              <p className="text-xs text-gray-500 mb-8 ml-11">Upload clear photos of the front and back of your Government ID.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Front Image */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ID Proof (Front)</p>
                  <div className="relative group">
                    {formData.idFrontImage ? (
                      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10">
                        <img src={formData.idFrontImage} alt="ID Front" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, idFrontImage: '' }));
                            setFiles(prev => ({ ...prev, idFrontImage: null }));
                          }}
                          className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-300">Upload Front</span>
                        <span className="text-[10px] text-gray-500 mt-1">JPG, PNG up to 5MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'idFrontImage')} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Back Image */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ID Proof (Back)</p>
                  <div className="relative group">
                    {formData.idBackImage ? (
                      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10">
                        <img src={formData.idBackImage} alt="ID Back" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, idBackImage: '' }));
                            setFiles(prev => ({ ...prev, idBackImage: null }));
                          }}
                          className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-300">Upload Back</span>
                        <span className="text-[10px] text-gray-500 mt-1">JPG, PNG up to 5MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'idBackImage')} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="bg-blue-500/10 p-6 rounded-[2rem] border border-blue-500/20 flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-100/70 leading-relaxed">
                <p className="font-bold text-blue-400 mb-1">Data Privacy Notice</p>
                <p>Your personal information and documents are encrypted and stored securely. We only use this data for identity verification purposes in compliance with global financial regulations.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-[2rem] transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 shadow-xl shadow-blue-600/20 text-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Submit for Verification'
              )}
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Verification;

const DetailItem: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className={`p-4 bg-white/5 rounded-2xl border border-white/5 ${className}`}>
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-white truncate">{value || 'N/A'}</p>
  </div>
);
