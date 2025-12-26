import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, Loader2, Globe, Phone, Mail, MapPin, Shield, Facebook, Instagram, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: "Pahnawa Banaras",
    supportEmail: "",
    supportPhone: "",
    address: "",
    instagram: "",
    facebook: "",
    twitter: "",
    shippingPolicy: "Free shipping on orders above ₹1000",
    returnPolicy: "7-day easy returns"
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) setSettings(prev => ({ ...prev, ...doc.data() }));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), { ...settings, updatedAt: new Date() });
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>
         <button 
           onClick={handleSave} 
           disabled={saving}
           className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-black transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
         >
           {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
           <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2"><Globe size={18} className="text-[#B08D55]"/> General Details</h3>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label>
              <input name="siteName" value={settings.siteName} onChange={handleChange} className="w-full border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Support Phone</label>
                 <input name="supportPhone" value={settings.supportPhone} onChange={handleChange} className="w-full border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Support Email</label>
                 <input name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="w-full border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
              </div>
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Address</label>
              <textarea name="address" rows="3" value={settings.address} onChange={handleChange} className="w-full border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
           </div>
        </div>

        {/* Policies */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
           <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2"><Shield size={18} className="text-[#B08D55]"/> Policies (Checkout)</h3>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shipping Policy Summary</label>
              <input name="shippingPolicy" value={settings.shippingPolicy} onChange={handleChange} className="w-full border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Return Policy Summary</label>
              <input name="returnPolicy" value={settings.returnPolicy} onChange={handleChange} className="w-full border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
           </div>
        </div>

        {/* Social Media */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
           <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">Social Connections</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                 <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <input name="instagram" placeholder="Instagram URL" value={settings.instagram} onChange={handleChange} className="w-full pl-9 border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
              </div>
              <div className="relative">
                 <Facebook size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <input name="facebook" placeholder="Facebook URL" value={settings.facebook} onChange={handleChange} className="w-full pl-9 border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
              </div>
              <div className="relative">
                 <Twitter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <input name="twitter" placeholder="Twitter URL" value={settings.twitter} onChange={handleChange} className="w-full pl-9 border p-2.5 rounded text-sm outline-none focus:border-[#B08D55]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};