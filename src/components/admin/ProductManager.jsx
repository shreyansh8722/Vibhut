import React, { useState, useEffect, useMemo } from 'react';
import { db, storage } from '../../lib/firebase';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Plus, Search, Trash2, X, UploadCloud, Download, Loader2, Image as ImageIcon, FileText
} from 'lucide-react';
import { compressImage } from '../../lib/utils'; 
import { motion, AnimatePresence } from 'framer-motion';

export const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 1. LISTEN TO FIREBASE
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // 2. DOWNLOAD JSON
  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "products.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product permanently?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const openDrawer = (product = null) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Product Manager</h2>
          <p className="text-sm text-gray-500">Manage inventory, gallery, and details</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
          >
            <Download size={16} /> Download JSON
          </button>
          <button 
            onClick={() => openDrawer()}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-500">Image</th>
              <th className="p-4 font-bold text-gray-500">Name</th>
              <th className="p-4 font-bold text-gray-500">Stock</th>
              <th className="p-4 font-bold text-gray-500">Price</th>
              <th className="p-4 font-bold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p) => (
              <tr key={p.id} onClick={() => openDrawer(p)} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-4">
                   <div className="w-10 h-10 rounded bg-gray-100 border overflow-hidden relative">
                     {p.imageUrls && p.imageUrls.length > 0 ? (
                        <img src={p.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                     ) : p.featuredImageUrl ? (
                        <img src={p.featuredImageUrl} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16}/></div>
                     )}
                   </div>
                </td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">₹{p.price}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        product={editingProduct} 
      />
    </div>
  );
};

// --- HELPER COMPONENT FOR IMAGE LISTS ---
const ImageListManager = ({ label, existing, pending, onAdd, onRemoveExisting, onRemovePending }) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Images */}
        {existing.map((url, idx) => (
          <div key={`exist-${idx}`} className="aspect-square relative group rounded-lg overflow-hidden border border-gray-200">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(idx)}
              className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        ))}

        {/* Pending Images */}
        {pending.map((entry, idx) => (
          <div key={`new-${idx}`} className="aspect-square relative group rounded-lg overflow-hidden border-2 border-green-500">
            <img src={entry.preview} alt="" className="w-full h-full object-cover opacity-80" />
            <button
              type="button"
              onClick={() => onRemovePending(idx)}
              className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full p-1 shadow-sm"
            >
              <X size={12} strokeWidth={3} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[9px] text-center py-1 uppercase font-bold">New</div>
          </div>
        ))}

        {/* Upload Button */}
        <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-100 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={onAdd}
            className="hidden" 
          />
          <Plus size={24} className="text-gray-400 mb-1" />
          <span className="text-[10px] font-bold uppercase text-gray-500">Add</span>
        </label>
      </div>
    </div>
  );
};

// --- MAIN DRAWER COMPONENT ---
const ProductDrawer = ({ isOpen, onClose, product }) => {
  const isNew = !product;
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // 1. Gallery Images State
  const [galleryExisting, setGalleryExisting] = useState([]);
  const [galleryNew, setGalleryNew] = useState([]);

  // 2. Description/Detail Images State
  const [detailExisting, setDetailExisting] = useState([]);
  const [detailNew, setDetailNew] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm(product || { 
        name: '', price: '', stock: 10, category: 'Rudraksha', description: '' 
      });

      // Init Gallery
      let initGallery = [];
      if (product?.imageUrls && Array.isArray(product.imageUrls)) {
        initGallery = product.imageUrls;
      } else if (product?.featuredImageUrl) {
        initGallery = [product.featuredImageUrl];
      }
      setGalleryExisting(initGallery);
      setGalleryNew([]);

      // Init Details
      let initDetails = [];
      if (product?.detailImageUrls && Array.isArray(product.detailImageUrls)) {
        initDetails = product.detailImageUrls;
      }
      setDetailExisting(initDetails);
      setDetailNew([]);
    }
  }, [isOpen, product]);

  // Handlers for Gallery
  const handleGalleryAdd = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newEntries = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setGalleryNew(prev => [...prev, ...newEntries]);
    }
  };
  const removeGalleryExisting = (idx) => setGalleryExisting(prev => prev.filter((_, i) => i !== idx));
  const removeGalleryNew = (idx) => setGalleryNew(prev => prev.filter((_, i) => i !== idx));

  // Handlers for Details
  const handleDetailAdd = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newEntries = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
      setDetailNew(prev => [...prev, ...newEntries]);
    }
  };
  const removeDetailExisting = (idx) => setDetailExisting(prev => prev.filter((_, i) => i !== idx));
  const removeDetailNew = (idx) => setDetailNew(prev => prev.filter((_, i) => i !== idx));

  // Helper to upload list of files
  const uploadFiles = async (fileEntries) => {
    return Promise.all(
      fileEntries.map(async (entry) => {
        const compressed = await compressImage(entry.file);
        const storageRef = ref(storage, `products/${Date.now()}_${entry.file.name}`);
        await uploadBytes(storageRef, compressed);
        return await getDownloadURL(storageRef);
      })
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload New Files
      const newGalleryUrls = await uploadFiles(galleryNew);
      const newDetailUrls = await uploadFiles(detailNew);

      // Combine
      const finalGallery = [...galleryExisting, ...newGalleryUrls];
      const finalDetails = [...detailExisting, ...newDetailUrls];

      // Payload
      const payload = {
        ...form,
        id: product?.id || `prod_${Date.now()}`,
        price: Number(form.price),
        stock: Number(form.stock),
        
        // Gallery Data
        imageUrls: finalGallery,
        featuredImageUrl: finalGallery.length > 0 ? finalGallery[0] : '',
        
        // Detail Images Data
        detailImageUrls: finalDetails,

        updatedAt: serverTimestamp()
      };

      if (isNew) payload.createdAt = serverTimestamp();

      await setDoc(doc(db, 'products', payload.id), payload, { merge: true });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* High Z-Index to stay above Navbar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]" />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[210] flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{isNew ? 'New Product' : 'Edit Product'}</h3>
              <button onClick={onClose}><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="product-form" onSubmit={handleSave} className="space-y-6">
                
                {/* 1. Main Gallery Images */}
                <ImageListManager 
                  label="Main Gallery Images" 
                  existing={galleryExisting}
                  pending={galleryNew}
                  onAdd={handleGalleryAdd}
                  onRemoveExisting={removeGalleryExisting}
                  onRemovePending={removeGalleryNew}
                />

                {/* 2. Basic Info */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                  <input required className="w-full p-3 border rounded-lg text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price (₹)</label>
                    <input type="number" required className="w-full p-3 border rounded-lg text-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stock Qty</label>
                    <input type="number" required className="w-full p-3 border rounded-lg text-sm" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select className="w-full p-3 border rounded-lg text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="Rudraksha">Rudraksha</option>
                    <option value="Gemstones">Gemstones</option>
                    <option value="Yantra">Yantra</option>
                    <option value="Mala">Mala</option>
                    <option value="Parad">Parad</option>
                  </select>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description Text</label>
                  <textarea rows={4} className="w-full p-3 border rounded-lg text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                {/* 4. Description Images (NEW) */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                   <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-gray-500"/>
                      <label className="text-xs font-bold uppercase text-gray-500">Description Images</label>
                   </div>
                   <p className="text-[10px] text-gray-400 mb-3">These images will appear below the description text (e.g. Benefits chart, Size guide).</p>
                   
                   <ImageListManager 
                    label="" 
                    existing={detailExisting}
                    pending={detailNew}
                    onAdd={handleDetailAdd}
                    onRemoveExisting={removeDetailExisting}
                    onRemovePending={removeDetailNew}
                  />
                </div>

              </form>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <button 
                type="submit" 
                form="product-form"
                disabled={saving}
                className="w-full py-3 bg-black text-white rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                Save Product
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};