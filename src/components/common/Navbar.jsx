import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Search, User, Menu, X, 
  ChevronDown, ArrowRight, 
  Sparkles, ScrollText, BookOpen, ShieldCheck,
  PackageSearch, MessageCircle, ChevronRight, Truck, Phone
} from 'lucide-react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import BrandLogo from './BrandLogo'; 
import NewsletterPopup from './NewsletterPopup';
import SearchPopup from './SearchPopup'; 
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { DEFAULT_NAV_DATA } from '../../data/navbarData';

// --- ANNOUNCEMENTS ---
const ANNOUNCEMENTS = [
  { text: "🕉️ Har Har Mahadev — Welcome to Vibhut", color: "text-[#E5C580]" },
  { text: "🚚 Free Shipping on Orders Above ₹499", color: "text-white" },
  { text: "✨ Get Your Detailed Kundali Report for ₹99", color: "text-[#E5C580]" },
];

const Navbar = () => {
  const [categoryData, setCategoryData] = useState(DEFAULT_NAV_DATA);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [isSupportOpen, setIsSupportOpen] = useState(false); 
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null); 
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false); 
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null);
  const { cartItems, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation(); 
  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const isProductPage = location.pathname.includes('/product/');

  const activeCategoryData = categoryData.find(c => c.id === activeDropdown);

  // --- 1. ANNOUNCEMENTS ---
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'storefront', 'navigation'), (snap) => {
      if (snap.exists() && snap.data().categories && snap.data().categories.length > 0) {
        const merged = snap.data().categories.map((dbCat, index) => {
            const defaultCat = DEFAULT_NAV_DATA.find(d => d.id === dbCat.id) || DEFAULT_NAV_DATA[index];
            if(!defaultCat) return dbCat; 
            return {
                ...dbCat,
                wisdom: dbCat.wisdom || defaultCat.wisdom, 
                subItems: (dbCat.subItems && dbCat.subItems.length > 0) ? dbCat.subItems : defaultCat.subItems
            };
        });
        setCategoryData(merged);
      }
    });
    return () => unsub();
  }, []);

  // --- 3. SEARCH LOGIC ---
  useEffect(() => {
    if (searchQuery.trim().length > 1 && products) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = products?.filter(p => {
         const name = p.name ? p.name.toLowerCase() : '';
         return name.includes(lowerQuery);
      }).slice(0, 5) || [];
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    searchRef.current?.querySelector('input')?.focus();
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setIsSupportOpen(false);
    setShowResults(false);
  };

  return (
    <>
      <NewsletterPopup />
      <SearchPopup isOpen={isSearchPopupOpen} onClose={() => setIsSearchPopupOpen(false)} />

      {/* ==================== 1. TOP ANNOUNCEMENT BAR ==================== */}
      <div className="bg-[#2E4F3E] h-[36px] w-full relative overflow-hidden z-[160] cursor-pointer" onClick={() => navigate('/kundali')}>
        <div className="container mx-auto h-full flex items-center justify-center relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={announcementIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${ANNOUNCEMENTS[announcementIndex].color}`}
                >
                    {ANNOUNCEMENTS[announcementIndex].text}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* ==================== 2. MAIN HEADER ==================== */}
      <div className="bg-white sticky top-0 z-[150] shadow-sm transition-all duration-300">
        <div className="border-b border-gray-100 relative z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center gap-4 lg:gap-8">
              
              {/* LEFT: Logo + Mobile Hamburger */}
              <div className="flex-shrink-0 flex items-center gap-3">
                <button className="lg:hidden text-[#1F362A] p-1 active:scale-95 transition-transform" onClick={() => setMobileMenuOpen(true)}>
                  <Menu size={24} strokeWidth={1.5} />
                </button>
                <Link to="/" onClick={closeAllMenus}>
                  <BrandLogo className="h-8 md:h-12 w-auto text-[#2E4F3E]" />
                </Link>
              </div>

              {/* CENTER: Search Bar (Desktop Only) */}
              <div className="hidden lg:block flex-grow max-w-xl relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative group">
                  <input type="text" 
                    placeholder="Search for '5 Mukhi', 'Ruby'..." 
                    className="w-full bg-gray-50 text-gray-900 border border-gray-200 focus:border-[#2E4F3E] focus:bg-white rounded-full py-2.5 pl-5 pr-12 text-sm transition-all outline-none shadow-inner"
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onFocus={() => setShowResults(true)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {searchQuery && (
                          <button type="button" onClick={clearSearch} className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"><X size={14} strokeWidth={3} /></button>
                      )}
                      <button type="submit" className="p-2 bg-[#2E4F3E] rounded-full text-white hover:bg-black transition-colors"><Search size={16} /></button>
                  </div>
                </form>
                {/* Search Results */}
                <AnimatePresence>
                  {showResults && searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div>{searchResults.map((product) => (
                            <div key={product.id} onClick={() => { navigate(`/product/${product.id}`); closeAllMenus(); setSearchQuery(""); }}
                                  className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group">
                                <img src={product.image || product.featuredImageUrl || 'https://via.placeholder.com/40'} alt={product.name} className="w-12 h-12 object-cover rounded-md bg-gray-100" />
                                <div className="flex-1"><h4 className="text-sm font-bold text-gray-900 group-hover:text-[#2E4F3E] line-clamp-1">{product.name}</h4><p className="text-[10px] text-gray-500 uppercase">{product.category}</p></div>
                                <span className="text-xs font-bold text-[#2E4F3E]">₹{product.price}</span>
                            </div>
                        ))}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-3 md:gap-6">
                 {/* Desktop Help */}
                 <div className="hidden lg:block relative" onMouseEnter={() => { setIsSupportOpen(true); setActiveDropdown(null); }} onMouseLeave={() => setIsSupportOpen(false)}>
                    <button className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#2E4F3E] transition-colors py-4">
                        Help <ChevronDown size={14} className={`transition-transform duration-300 ${isSupportOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    <AnimatePresence>
                        {isSupportOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2">
                                <Link to="/track-order" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all group">
                                    <PackageSearch size={18} className="text-gray-400 group-hover:text-[#2E4F3E]"/> 
                                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-700">Track Order</span></div>
                                </Link>
                                <Link to="/contact" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all group">
                                    <MessageCircle size={18} className="text-gray-400 group-hover:text-[#2E4F3E]"/> 
                                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-700">Support Chat</span></div>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Kundali Btn */}
                <Link to="/kundali" className="hidden xl:flex relative overflow-hidden bg-[#2E4F3E] text-white pl-4 pr-5 py-2 rounded-full shadow-md items-center gap-2 group border border-[#C5A059]">
                  <ScrollText size={16} className="text-[#C5A059]" />
                  <div className="flex flex-col leading-none"><span className="text-[9px] text-[#C5A059] font-bold uppercase">Free Report</span><span className="text-xs font-bold">Kundali</span></div>
                </Link>
                
                {/* --- MOBILE SEARCH BUTTON (ADDED BACK) --- */}
                <button 
                  className="lg:hidden text-[#1F362A] hover:text-[#2E4F3E] transition-colors p-1" 
                  onClick={() => setIsSearchPopupOpen(true)}
                >
                  <Search size={22} strokeWidth={1.5} />
                </button>

                <Link to="/login" className="hover:text-[#2E4F3E] block"><User size={24} strokeWidth={1.5} /></Link>
                <button onClick={() => setIsCartOpen(true)} className="relative hover:text-[#2E4F3E]">
                  <ShoppingBag size={24} strokeWidth={1.5} />
                  {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">{cartItemCount}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. DESKTOP CATEGORY STRIP ==================== */}
      {!isProductPage && (
        <div 
          // Z-[140] ensures this stays above page content (z-index fix)
          className="hidden md:block bg-white border-b border-gray-200 relative z-[140]"
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="container mx-auto relative">
             
             {/* Icons Row */}
             <div className="flex items-center justify-center gap-8 px-4">
                {categoryData.map((category) => (
                   <div 
                      key={category.id} 
                      className="py-4 flex flex-col items-center gap-2 cursor-pointer group relative"
                      onMouseEnter={() => { setActiveDropdown(category.id); setIsSupportOpen(false); }}
                   >
                      <Link to={category.path} onClick={closeAllMenus} className="flex flex-col items-center gap-2">
                         <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full p-[2px] border-2 transition-all duration-300 ${activeDropdown === category.id ? 'border-[#C5A059] scale-105 shadow-md' : 'border-transparent group-hover:border-[#2E4F3E]/20'}`}>
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                                {category.image ? <img src={category.image} alt={category.label} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px]">IMG</div>}
                            </div>
                         </div>
                         <span className={`text-[12px] font-bold text-center capitalize transition-colors ${activeDropdown === category.id ? 'text-[#2E4F3E]' : 'text-gray-600'}`}>{category.label}</span>
                      </Link>

                      {/* GOLDEN UNDERLINE INDICATOR */}
                      {activeDropdown === category.id && (
                        <motion.div 
                          layoutId="nav-indicator"
                          className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                   </div>
                ))}
             </div>

             {/* MEGA MENU DROPDOWN */}
             <AnimatePresence>
                {activeDropdown && activeCategoryData && activeCategoryData.subItems?.length > 0 && (
                   <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-full z-50 pt-1"
                   >
                      <div className="bg-white border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] rounded-b-2xl overflow-hidden flex">
                          
                          {/* LEFT: Product Grid */}
                          <div className="flex-1 p-8 bg-white">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                                  <h3 className="font-serif text-xl text-[#2E4F3E] font-bold">
                                      {activeCategoryData.label} Collection
                                  </h3>
                                  <Link to={activeCategoryData.path} onClick={closeAllMenus} className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1">
                                      View All <ArrowRight size={12}/>
                                  </Link>
                              </div>

                              <div className="grid grid-cols-5 gap-6">
                                  {activeCategoryData.subItems.map((item, idx) => (
                                      <Link 
                                        key={idx} 
                                        to={item.link} 
                                        onClick={closeAllMenus} 
                                        className="group/card flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
                                      >
                                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm border border-gray-100 group-hover/card:border-[#C5A059]/40 transition-all">
                                              {item.image ? (
                                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                                              ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">IMG</div>
                                              )}
                                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                                  <ChevronRight size={16} className="text-white drop-shadow-md"/>
                                              </div>
                                          </div>
                                          <span className="text-xs font-bold text-gray-700 text-center leading-tight group-hover/card:text-[#2E4F3E] line-clamp-2">
                                              {item.name}
                                          </span>
                                      </Link>
                                  ))}
                              </div>
                          </div>

                          {/* RIGHT: Wisdom Sidebar */}
                          {activeCategoryData.wisdom && (
                              <div className="w-72 bg-[#FCFBF8] border-l border-[#E5C580]/20 p-8 flex flex-col justify-center relative overflow-hidden">
                                  <div className="relative z-10">
                                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E4F3E]/5 rounded-full text-[#2E4F3E] text-[10px] font-bold uppercase tracking-widest mb-4">
                                          <BookOpen size={12} /> Vedic Wisdom
                                      </div>
                                      <h3 className="font-serif text-xl text-[#2E4F3E] font-bold mb-3 leading-tight">
                                          {activeCategoryData.wisdom.title}
                                      </h3>
                                      <p className="text-xs text-gray-600 italic leading-relaxed mb-6 border-l-2 border-[#C5A059] pl-4">
                                          "{activeCategoryData.wisdom.description}"
                                      </p>
                                      <div className="space-y-2 mb-6">
                                          {activeCategoryData.wisdom.benefits?.slice(0,3).map((benefit, i) => (
                                              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                  <ShieldCheck size={14} className="text-[#C5A059] mt-0.5 shrink-0"/> {benefit}
                                              </div>
                                          ))}
                                      </div>
                                      <Link to={activeCategoryData.path} onClick={closeAllMenus} className="w-full py-3 bg-[#2E4F3E] hover:bg-[#1F362A] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all">
                                          Explore Collection <ArrowRight size={14}/>
                                      </Link>
                                  </div>
                              </div>
                          )}
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      )}

      {/* ==================== 4. MOBILE DRAWER ==================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[190] lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[200] shadow-2xl overflow-y-auto lg:hidden flex flex-col">
               {/* Header */}
               <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-[#F9FAFB]">
                  <BrandLogo className="h-8 text-[#2E4F3E]" />
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white rounded-full shadow-sm"><X size={20} /></button>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
                  
                  {/* Kundali Banner */}
                  <div className="bg-[#2E4F3E] p-4 rounded-xl text-white relative overflow-hidden mb-4 shadow-lg border border-[#C5A059]">
                      <div className="relative z-10">
                          <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><Sparkles size={14} className="text-[#E5C580]"/> Get Your Kundali</h4>
                          <p className="text-[10px] opacity-80 mb-3">Unlock your destiny with Vedic astrology.</p>
                          <Link to="/kundali" onClick={() => setMobileMenuOpen(false)} className="inline-block bg-[#E5C580] text-[#1F362A] text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-white transition-colors">
                              Check Now
                          </Link>
                      </div>
                  </div>

                  {/* Categories */}
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mt-2">Browse Categories</h4>
                  <div className="space-y-2">
                    {categoryData?.map((category) => (
                        <div key={category.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button onClick={() => setMobileCategoryOpen(mobileCategoryOpen === category.id ? null : category.id)} className="w-full flex items-center justify-between p-3 active:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {category.image ? <img src={category.image} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" /> : <div className="w-10 h-10 bg-gray-100 rounded-full"></div>}
                                    <span className="font-bold text-gray-800 text-sm capitalize">{category.label}</span>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileCategoryOpen === category.id ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {mobileCategoryOpen === category.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-gray-50 border-t border-gray-100">
                                        <div className="p-3 grid grid-cols-3 gap-3">
                                            {category.subItems?.map((sub, idx) => (
                                                <Link key={idx} to={sub.link} onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2">
                                                    <div className="w-14 h-14 bg-white rounded-lg border border-gray-200 p-1 flex items-center justify-center overflow-hidden">
                                                        {sub.image ? <img src={sub.image} className="w-full h-full object-cover rounded"/> : <span className="text-[9px] text-gray-400">IMG</span>}
                                                    </div>
                                                    <span className="text-[10px] text-center font-medium leading-tight text-gray-600">{sub.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                        <Link to={category.path} onClick={() => setMobileMenuOpen(false)} className="block text-center py-3 text-xs font-bold text-[#2E4F3E] border-t border-gray-100 uppercase tracking-wide">View All {category.label}</Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                  </div>

                  {/* Support Section */}
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mt-6">Support</h4>
                  <div className="grid grid-cols-2 gap-3">
                      <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#2E4F3E] transition-colors">
                          <Truck size={18} className="text-[#2E4F3E]"/> 
                          <span className="text-xs font-bold text-gray-700">Track Order</span>
                      </Link>
                      <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#2E4F3E] transition-colors">
                          <Phone size={18} className="text-[#2E4F3E]"/> 
                          <span className="text-xs font-bold text-gray-700">Contact Us</span>
                      </Link>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;