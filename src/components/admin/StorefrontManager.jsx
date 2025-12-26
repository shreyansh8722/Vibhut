import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Save, Image as ImageIcon, Loader2, LayoutTemplate, MousePointerClick } from 'lucide-react';
import toast from 'react-hot-toast';

export const StorefrontManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('spotlight'); 
  
  const [content, setContent] = useState({
    spotlight: { title: "Divine Energy", subtitle: "Authentic Rudraksha & Gems", buttonText: "Explore Collection", image: "" },
    muse: { image1: "", image2: "", image3: "", image4: "" },
    fabrics: { katan: "", organza: "", georgette: "", tissue: "", tussar: "" }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'storefront', 'home_content'), (snap) => {
      if (snap.exists()) setContent(prev => ({ ...prev, ...snap.data() }));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, 'storefront', 'home_content'), content);
    setSaving(false);
    toast.success("Storefront updated!");
  };

  const uploadImage = async (file, section, field) => {
    const sRef = ref(storage, `storefront/${section}_${field}_${Date.now()}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: url } }));
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
       {/* Sidebar */}
       <div className="col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm p-4 h-full overflow-y-auto">
          <h3 className="font-bold text-gray-900 mb-4 px-2">Theme Sections</h3>
          <nav className="space-y-1">
             {[
               { id: 'spotlight', label: 'Spotlight Hero', icon: LayoutTemplate },
               { id: 'muse', label: 'Muse Gallery', icon: ImageIcon }, // Fixed icon
               { id: 'fabrics', label: 'Featured Categories', icon: MousePointerClick },
             ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeSection === item.id ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
             ))}
          </nav>
       </div>

       {/* Editor */}
       <div className="col-span-9 flex flex-col gap-4 h-full">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 overflow-y-auto">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold capitalize">{activeSection} Configuration</h2>
                <button onClick={handleSave} disabled={saving} className="bg-[#B08D55] text-white px-6 py-2 rounded text-sm font-bold uppercase disabled:opacity-50">
                   {saving ? 'Saving...' : 'Save Changes'}
                </button>
             </div>

             {activeSection === 'spotlight' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold uppercase text-gray-500">Heading</label><input className="w-full border p-2 rounded mt-1" value={content.spotlight.title} onChange={e => setContent({...content, spotlight: {...content.spotlight, title: e.target.value}})} /></div>
                      <div><label className="text-xs font-bold uppercase text-gray-500">Button Label</label><input className="w-full border p-2 rounded mt-1" value={content.spotlight.buttonText} onChange={e => setContent({...content, spotlight: {...content.spotlight, buttonText: e.target.value}})} /></div>
                   </div>
                   <div><label className="text-xs font-bold uppercase text-gray-500">Subheading</label><textarea className="w-full border p-2 rounded mt-1" rows="2" value={content.spotlight.subtitle} onChange={e => setContent({...content, spotlight: {...content.spotlight, subtitle: e.target.value}})} /></div>
                   <ImageUploader label="Main Banner Image" image={content.spotlight.image} onUpload={(f) => uploadImage(f, 'spotlight', 'image')} />
                </div>
             )}

             {activeSection === 'muse' && (
                <div className="grid grid-cols-2 gap-6">
                   {[1,2,3,4].map(n => (
                      <ImageUploader key={n} label={`Gallery Image ${n}`} image={content.muse[`image${n}`]} onUpload={(f) => uploadImage(f, 'muse', `image${n}`)} />
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const ImageUploader = ({ label, image, onUpload }) => (
  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center relative group hover:bg-white hover:border-[#B08D55] transition-all">
     <p className="text-xs font-bold text-gray-400 mb-2 uppercase">{label}</p>
     {image ? (
        <img src={image} className="h-32 w-full object-cover rounded shadow-sm mx-auto" />
     ) : (
        <div className="h-32 flex items-center justify-center text-gray-300"><ImageIcon size={32}/></div>
     )}
     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
     <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs rounded-lg pointer-events-none">Click to Change</div>
  </div>
);