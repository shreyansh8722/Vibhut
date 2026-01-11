import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-[#14241C] text-white pt-20 pb-10 border-t border-[#B08D55]/20 font-sans">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <BrandLogo className="h-10 text-white" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Authentic spiritual marketplace from the ghats of Kashi. Bridging ancient Vedic wisdom with modern needs.
            </p>
            <div className="flex gap-4">
               {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#1F362A] flex items-center justify-center text-[#B08D55] hover:bg-[#B08D55] hover:text-white transition-colors">
                     <Icon size={18} />
                  </a>
               ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-[#F4EBD9]">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/shop?category=Rudraksha" className="hover:text-[#B08D55] transition-colors">Rudraksha Beads</Link></li>
              <li><Link to="/shop?category=Gemstones" className="hover:text-[#B08D55] transition-colors">Certified Gemstones</Link></li>
              <li><Link to="/shop?category=Yantras" className="hover:text-[#B08D55] transition-colors">Yantras & Idols</Link></li>
              <li><Link to="/shop?sort=new" className="hover:text-[#B08D55] transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-[#F4EBD9]">Services</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/kundali" className="hover:text-[#B08D55] transition-colors font-bold text-[#B08D55]">Get Kundali Report (₹99)</Link></li>
              <li><Link to="/consult" className="hover:text-[#B08D55] transition-colors">Talk to Astrologer</Link></li>
              <li><Link to="/consult?type=Tarot" className="hover:text-[#B08D55] transition-colors">Tarot Reading</Link></li>
              <li><Link to="/track-order" className="hover:text-[#B08D55] transition-colors">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-[#F4EBD9]">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                 <MapPin size={18} className="text-[#B08D55] mt-0.5" />
                 <span>B-21/100, Kamachha, <br/>Varanasi, Uttar Pradesh, 221010</span>
              </li>
              <li className="flex items-center gap-3">
                 <Phone size={18} className="text-[#B08D55]" />
                 <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                 <Mail size={18} className="text-[#B08D55]" />
                 <span>support@vishwanatham.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1F362A] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-xs text-gray-500">© 2026 Vishwanatham. All rights reserved.</p>
           <div className="flex gap-6 text-xs text-gray-500 uppercase tracking-wider font-bold">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms" className="hover:text-white">Terms</Link>
              <Link to="/shipping" className="hover:text-white">Shipping</Link>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;