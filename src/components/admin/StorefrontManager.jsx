import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Save, Image as ImageIcon, LayoutTemplate, Menu, Loader2, 
  ChevronRight, Upload, Trash2, Download, Wand2, Plus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_NAV_DATA } from '../../data/navbarData';

export default function StorefrontManager() {
  const [content, setContent] = useState({ spotlight: { title: "", subtitle: "", buttonText: "", image: "" } });
  const [navData, setNavData] = useState(DEFAULT_NAV_DATA);
  const [products, setProducts] = useState([]); 
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('spotlight'); 
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  useEffect(() => {
    // 1. Fetch CMS Content
    const unsubHome = onSnapshot(doc(db, 'storefront', 'home_content'), (snap) => {
      if (snap.exists()) setContent(prev => ({ ...prev, ...snap.data() }));
    });

    // 2. Fetch Navigation & MERGE with Code Defaults
    const unsubNav = onSnapshot(doc(db, 'storefront', 'navigation'), (snap) => {
      if (snap.exists() && snap.data().categories && snap.data().categories.length > 0) {
        
        // INTELLIGENT MERGE (Fixes missing 'Support' section in Admin)
        const merged = DEFAULT_NAV_DATA.map((defaultCat) => {
            const dbCat = snap.data().categories.find(c => c.id === defaultCat.id);
            if (dbCat) {
                return {
                    ...defaultCat, 
                    ...dbCat,
                    wisdom: dbCat.wisdom || defaultCat.wisdom, 
                    subItems: (dbCat.subItems && dbCat.subItems.length > 0) ? dbCat.subItems : defaultCat.subItems
                };
            }
            return defaultCat; 
        });
        setNavData(merged);
      }
    });

    // 3. Fetch Products
    const fetchProducts = async () => {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchProducts();

    return () => { unsubHome(); unsubNav(); };
  }, []);

  // --- HELPER: Auto-Resize Image ---
  const resizeImage = (file, maxWidth = 300) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.85); 
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleNavImageUpload = async (file, type, subItemIndex = null) => {
    toast.loading("Optimizing & Uploading...", { id: "upload" });
    try {
      const resizedFile = await resizeImage(file, 300);
      const sRef = ref(storage, `navigation/${Date.now()}_${resizedFile.name}`);
      await uploadBytes(sRef, resizedFile);
      const url = await getDownloadURL(sRef);
      
      const updatedNav = [...navData];
      if (type === 'category') {
        updatedNav[selectedCategoryIndex].image = url;
      } else if (type === 'subitem' && subItemIndex !== null) {
        updatedNav[selectedCategoryIndex].subItems[subItemIndex].image = url;
      }
      
      setNavData(updatedNav);
      toast.success("Image updated!", { id: "upload" });
    } catch (e) {
      console.error(e);
      toast.error("Upload failed", { id: "upload" });
    }
  };

  const autoFillImage = (subItemIndex) => {
    const item = navData[selectedCategoryIndex].subItems[subItemIndex];
    const match = products.find(p => p.name.toLowerCase().includes(item.name.split('(')[0].trim().toLowerCase()));
    
    if (match && (match.featuredImageUrl || match.image)) {
        const updatedNav = [...navData];
        updatedNav[selectedCategoryIndex].subItems[subItemIndex].image = match.featuredImageUrl || match.image;
        setNavData(updatedNav);
        toast.success(`Found image from: ${match.name}`);
    } else {
        toast.error("No matching product image found.");
    }
  };

  const downloadJson = () => {
    const dataStr = "export const DEFAULT_NAV_DATA = " + JSON.stringify(navData, null, 2) + ";";
    const blob = new Blob([dataStr], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "navbarData.js";
    link.click();
    toast.success("Downloaded! Replace src/data/navbarData.js with this.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeSection === 'spotlight') {
         await setDoc(doc(db, 'storefront', 'home_content'), content, { merge: true });
      } else if (activeSection === 'navigation') {
         await setDoc(doc(db, 'storefront', 'navigation'), { categories: navData }, { merge: true });
      }
      toast.success("Changes saved live!");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-fade-in">
       {/* SIDEBAR */}
       <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 px-2 uppercase text-xs tracking-wider">Storefront</h3>
          <nav className="space-y-1 flex-1">
             <button onClick={() => setActiveSection('spotlight')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'spotlight' ? 'bg-[#2E4F3E] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                <LayoutTemplate size={16} /> Hero Section
             </button>
             <button onClick={() => setActiveSection('navigation')} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'navigation' ? 'bg-[#2E4F3E] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Menu size={16} /> Mega Menu
             </button>
          </nav>
          
          {activeSection === 'navigation' && (
             <button onClick={downloadJson} className="mt-4 w-full py-2 border-2 border-dashed border-[#2E4F3E] text-[#2E4F3E] rounded-lg text-xs font-bold uppercase hover:bg-[#2E4F3E] hover:text-white transition-colors flex items-center justify-center gap-2">
                <Download size={14}/> Download Config
             </button>
          )}
       </div>

       {/* EDITOR AREA */}
       <div className="col-span-9 flex flex-col gap-4 h-full">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 overflow-y-auto relative custom-scrollbar">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold capitalize">{activeSection} Editor</h2>
                <button onClick={handleSave} disabled={saving} className="bg-[#B08D55] text-white px-6 py-2 rounded-lg text-sm font-bold uppercase disabled:opacity-50 flex items-center gap-2 hover:bg-[#967645] transition-colors shadow-lg">
                   {saving ? <Loader2 className="animate-spin" size={14}/> : <Save size={16}/>} Publish Changes
                </button>
             </div>

             {activeSection === 'spotlight' && (
                <div className="space-y-6 max-w-2xl">
                   {/* HERO EDITOR */}
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Heading</label><input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" value={content.spotlight?.title} onChange={e => setContent({...content, spotlight: {...content.spotlight, title: e.target.value}})} /></div>
                      <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Button Text</label><input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" value={content.spotlight?.buttonText} onChange={e => setContent({...content, spotlight: {...content.spotlight, buttonText: e.target.value}})} /></div>
                   </div>
                   <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Subheading</label><textarea className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" rows="3" value={content.spotlight?.subtitle} onChange={e => setContent({...content, spotlight: {...content.spotlight, subtitle: e.target.value}})} /></div>
                   
                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative hover:bg-gray-50 transition-colors group">
                      {content.spotlight?.image ? <img src={content.spotlight.image} className="h-40 w-full object-cover rounded-lg shadow-sm" /> : <div className="h-40 flex items-center justify-center text-gray-400 flex-col gap-2"><ImageIcon size={32}/><span className="text-xs font-bold uppercase">Upload Banner</span></div>}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                          if(!e.target.files[0]) return;
                          toast.loading("Uploading...");
                          const url = await uploadImage(e.target.files[0], `spotlight/hero_${Date.now()}`);
                          setContent(prev => ({ ...prev, spotlight: { ...prev.spotlight, image: url } }));
                          toast.dismiss(); toast.success("Uploaded!");
                      }} />
                   </div>
                </div>
             )}

             {activeSection === 'navigation' && (
                <div className="flex gap-6 h-full">
                    {/* Category List */}
                    <div className="w-1/3 border-r border-gray-100 pr-4 space-y-2 overflow-y-auto max-h-[600px]">
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Select Category</h4>
                        {navData.map((cat, idx) => (
                            <button key={idx} onClick={() => setSelectedCategoryIndex(idx)} 
                                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-bold flex items-center justify-between ${selectedCategoryIndex === idx ? 'bg-gray-100 text-[#2E4F3E] border-l-4 border-[#2E4F3E]' : 'text-gray-600 hover:bg-gray-50'}`}>
                                {cat.label} <ChevronRight size={14} className="opacity-50"/>
                            </button>
                        ))}
                    </div>

                    {/* Editor Area */}
                    <div className="w-2/3 pl-2 overflow-y-auto custom-scrollbar">
                        
                        {/* 1. Category Main Image */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Navbar Circle Image</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-full border border-gray-200 overflow-hidden flex items-center justify-center relative group shadow-sm">
                                    {navData[selectedCategoryIndex].image ? 
                                        <img src={navData[selectedCategoryIndex].image} className="w-full h-full object-cover"/> : 
                                        <ImageIcon size={20} className="text-gray-300"/>
                                    }
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files[0] && handleNavImageUpload(e.target.files[0], 'category')} />
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>Main icon for {navData[selectedCategoryIndex].label}.</p>
                                    <p className="text-[10px] text-green-600">Auto-resized to 300px width.</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Wisdom Data Editor */}
                        <div className="mb-6 border border-gray-200 rounded-xl p-4">
                            <h4 className="text-xs font-bold uppercase text-[#B08D55] mb-3 flex items-center gap-2"><Sparkles size={12}/> Dropdown Wisdom Card</h4>
                            <div className="space-y-3">
                                <input 
                                    className="w-full border border-gray-300 p-2 rounded text-sm font-bold" 
                                    placeholder="Wisdom Title"
                                    value={navData[selectedCategoryIndex].wisdom?.title || ""}
                                    onChange={e => {
                                        const updated = [...navData];
                                        if(!updated[selectedCategoryIndex].wisdom) updated[selectedCategoryIndex].wisdom = {};
                                        updated[selectedCategoryIndex].wisdom.title = e.target.value;
                                        setNavData(updated);
                                    }}
                                />
                                <textarea 
                                    className="w-full border border-gray-300 p-2 rounded text-sm" 
                                    placeholder="Description..."
                                    rows={2}
                                    value={navData[selectedCategoryIndex].wisdom?.description || ""}
                                    onChange={e => {
                                        const updated = [...navData];
                                        updated[selectedCategoryIndex].wisdom.description = e.target.value;
                                        setNavData(updated);
                                    }}
                                />
                                <input 
                                    className="w-full border border-gray-300 p-2 rounded text-xs" 
                                    placeholder="Benefits (comma separated)..."
                                    value={navData[selectedCategoryIndex].wisdom?.benefits?.join(", ") || ""}
                                    onChange={e => {
                                        const updated = [...navData];
                                        updated[selectedCategoryIndex].wisdom.benefits = e.target.value.split(",").map(s => s.trim());
                                        setNavData(updated);
                                    }}
                                />
                            </div>
                        </div>

                        {/* 3. Sub-Items Editor */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold uppercase text-gray-400">Dropdown Items</h4>
                                <button onClick={() => {
                                    const updated = [...navData];
                                    updated[selectedCategoryIndex].subItems.push({ name: "New Item", link: "/shop", image: "" });
                                    setNavData(updated);
                                }} className="text-xs text-[#2E4F3E] font-bold hover:underline flex items-center gap-1"><Plus size={12}/> Add Item</button>
                            </div>

                            <div className="space-y-3">
                                {navData[selectedCategoryIndex].subItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-white border border-gray-200 p-3 rounded-lg shadow-sm group">
                                        <div className="w-12 h-12 bg-gray-50 rounded border border-gray-200 flex-shrink-0 relative hover:border-[#B08D55] transition-colors cursor-pointer overflow-hidden">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <Upload size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400"/>}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Image" onChange={(e) => e.target.files[0] && handleNavImageUpload(e.target.files[0], 'subitem', idx)} />
                                        </div>
                                        
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <input className="flex-1 text-xs font-bold border-b border-gray-200 focus:border-[#B08D55] outline-none pb-1" 
                                                    value={item.name} 
                                                    onChange={(e) => {
                                                        const updated = [...navData];
                                                        updated[selectedCategoryIndex].subItems[idx].name = e.target.value;
                                                        setNavData(updated);
                                                    }}
                                                />
                                                <button onClick={() => autoFillImage(idx)} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                                                    <Wand2 size={10}/> Auto
                                                </button>
                                            </div>
                                            <input className="w-full text-[10px] text-gray-500 border-b border-gray-200 focus:border-[#B08D55] outline-none pb-1" 
                                                value={item.link} 
                                                onChange={(e) => {
                                                    const updated = [...navData];
                                                    updated[selectedCategoryIndex].subItems[idx].link = e.target.value;
                                                    setNavData(updated);
                                                }}
                                            />
                                        </div>

                                        <button onClick={() => {
                                            const updated = [...navData];
                                            updated[selectedCategoryIndex].subItems.splice(idx, 1);
                                            setNavData(updated);
                                        }} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}