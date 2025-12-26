import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Trash2, Plus, Loader2, X, Edit2, Save, Search, UploadCloud, 
  MoreHorizontal, Filter, ArrowUpDown
} from 'lucide-react';
import { compressImage } from '../../lib/utils'; 
import { motion, AnimatePresence } from 'framer-motion';

// --- DND Imports ---
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableImage = ({ id, url, isNew, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group cursor-grab active:cursor-grabbing hover:border-[#B08D55] transition-all">
      <img src={url} className={`w-full h-full object-cover ${isNew ? 'opacity-90' : ''}`} alt="thumbnail" />
      <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} className="absolute top-1 right-1 bg-white shadow-sm text-red-500 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"><Trash2 size={12} /></button>
    </div>
  );
};

export const ProductManager = () => { 
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [combinedImages, setCombinedImages] = useState([]); 

  const initialState = {
    name: '', sku: '', price: '', comparePrice: '', 
    category: 'Rudraksha', description: '', stock: '',
    mukhi: '', origin: 'Nepal', certification: '',
    deity: '', planet: '', chakra: '', 
    weight: '', beadSize: '', mantra: '',
  };
  const [formData, setFormData] = useState(initialState);
  const categories = ["Rudraksha", "Gemstones", "Yantras", "Malas", "Bracelets", "Idols"];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = await getDownloadURL(ref(storage, 'database/products.json'));
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.log("No existing database file", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredProducts(products.filter(p => 
        p.name?.toLowerCase().includes(lower) || 
        p.category?.toLowerCase().includes(lower)
      ));
    }
  }, [searchQuery, products]);

  const saveToCloud = async (newList) => {
    const jsonString = JSON.stringify(newList);
    const blob = new Blob([jsonString], { type: "application/json" });
    const storageRef = ref(storage, 'database/products.json');
    await uploadBytes(storageRef, blob);
    setProducts(newList);
  };

  const handleImageSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file, i) => ({
        id: `new-${Date.now()}-${i}`, 
        type: 'new', 
        url: URL.createObjectURL(file), 
        file: file
      }));
      setCombinedImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCombinedImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const openDrawer = (product = null) => {
    if (product) {
      setEditMode(true);
      setEditId(product.id);
      setFormData(product);
      setCombinedImages((product.imageUrls || []).map((url, i) => ({ id: `exist-${i}`, type: 'existing', url, file: null })));
    } else {
      setEditMode(false);
      setEditId(null);
      setFormData(initialState);
      setCombinedImages([]);
    }
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (combinedImages.length === 0) return alert("Please upload at least one image.");
    
    setProcessing(true);
    setUploadProgress('Processing...');
    
    try {
      const imageUrls = await Promise.all(combinedImages.map(async (item) => {
        if (item.type === 'existing') return item.url;
        const compressedFile = await compressImage(item.file); 
        const refName = `products/${Date.now()}_${item.id}.webp`;
        const sRef = ref(storage, refName);
        await uploadBytes(sRef, compressedFile);
        return await getDownloadURL(sRef);
      }));

      const newProduct = {
        ...formData,
        id: editMode ? editId : Date.now().toString(),
        price: Number(formData.price),
        comparePrice: Number(formData.comparePrice) || 0,
        stock: Number(formData.stock) || 0,
        imageUrls: imageUrls,
        featuredImageUrl: imageUrls[0],
        fullDescription: formData.description,
        createdAt: editMode ? (products.find(p => p.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
      };

      let updatedList;
      if (editMode) {
        updatedList = products.map(p => p.id === editId ? newProduct : p);
      } else {
        updatedList = [newProduct, ...products];
      }

      setUploadProgress('Saving DB...');
      await saveToCloud(updatedList);

      setIsDrawerOpen(false);
      alert(editMode ? "Saved!" : "Added!");
      
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      const updatedList = products.filter(p => p.id !== id);
      await saveToCloud(updatedList);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* --- ACTION BAR --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Products</h2>
           <p className="text-sm text-gray-500 mt-1">Manage your inventory and catalog.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
             Export
           </button>
           <button onClick={() => openDrawer()} className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#333] flex items-center gap-2">
              <Plus size={16} /> Add Product
           </button>
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
               type="text" 
               placeholder="Search products..." 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-gray-400 outline-none shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
             <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
             <ArrowUpDown size={16} /> Sort
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="p-4 font-medium w-20">Image</th>
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Inventory</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2"/>Loading inventory...</td></tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="p-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="p-4">
                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                      <img src={p.featuredImageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900 cursor-pointer hover:underline" onClick={() => openDrawer(p)}>
                    {p.name}
                  </td>
                  <td className="p-4">
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                       Active
                     </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {p.stock} in stock
                  </td>
                  <td className="p-4 text-gray-500">{p.category}</td>
                  <td className="p-4 font-medium">₹{p.price}</td>
                  <td className="p-4 text-right">
                    <div className="relative">
                       <button className="p-2 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
                         <MoreHorizontal size={16} />
                       </button>
                       {/* Quick Actions (Hidden for simplicity, could be a dropdown) */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
           <span>Showing {filteredProducts.length} items</span>
           <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-100" disabled>Previous</button>
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-100" disabled>Next</button>
           </div>
        </div>
      </div>

      {/* --- ADD/EDIT DRAWER (FIXED Z-INDEX) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* 1. Backdrop (Z-Index 9990) */}
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]" 
               onClick={() => setIsDrawerOpen(false)} 
            />
            
            {/* 2. Drawer (Z-Index 9999) - THIS FIXES THE ISSUE */}
            <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
               transition={{ type: "spring", damping: 25, stiffness: 200 }} 
               className="fixed inset-y-0 right-0 z-[9999] w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-gray-200"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <div>
                   <h3 className="font-bold text-lg text-gray-900">{editMode ? 'Edit Product' : 'Add Product'}</h3>
                   <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">
                      {editMode ? 'Update details' : 'New Item'}
                   </p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Info */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                        <input required placeholder="e.g. 5 Mukhi Rudraksha" className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                           <select className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:border-black outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:border-black outline-none"><option>Active</option><option>Draft</option></select>
                         </div>
                      </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                       <textarea rows="4" className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:border-black outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>

                  {/* Media */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide border-b pb-2 mb-2">Media</h4>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={combinedImages} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-4 gap-4">
                          {combinedImages.map((item) => <SortableImage key={item.id} id={item.id} url={item.url} isNew={item.type === 'new'} onDelete={() => setCombinedImages(prev => prev.filter(i => i.id !== item.id))} />)}
                          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                            <UploadCloud className="text-gray-400 mb-1" size={24} /><span className="text-[10px] font-bold text-gray-500">Add</span>
                          </label>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide border-b pb-2 mb-2">Pricing</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label><div className="relative"><span className="absolute left-3 top-2 text-gray-500">₹</span><input type="number" required className="w-full pl-6 p-2 border border-gray-300 rounded text-sm focus:border-black outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Compare</label><div className="relative"><span className="absolute left-3 top-2 text-gray-500">₹</span><input type="number" className="w-full pl-6 p-2 border border-gray-300 rounded text-sm focus:border-black outline-none" value={formData.comparePrice} onChange={e => setFormData({...formData, comparePrice: e.target.value})} /></div></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label><input type="number" required className="w-full p-2 border border-gray-300 rounded text-sm focus:border-black outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                    </div>
                  </div>
                  
                  {/* Attributes */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide border-b pb-2 mb-2">Attributes</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {['mukhi', 'origin', 'deity', 'planet', 'certification', 'weight'].map(field => (
                          <div key={field}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 capitalize">{field}</label>
                            <input className="w-full p-2 border border-gray-300 rounded text-sm focus:border-black outline-none" value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} />
                          </div>
                        ))}
                    </div>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                 <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                 <button form="product-form" disabled={processing} className="px-6 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg disabled:opacity-70">
                    {processing ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Save size={16} /> Save Product</>}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};