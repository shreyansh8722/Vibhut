import React, { useState } from 'react';
import { Plus, Check, MapPin, Trash2, Edit2 } from 'lucide-react';

export const AddressSelector = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'Rahul Kumar',
      line1: 'B-12, Heritage Apartments',
      line2: 'Assi Ghat Road',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      zip: '221005',
      phone: '+91 98765 43210',
      isDefault: true
    }
  ]);
  
  const [selectedId, setSelectedId] = useState(1);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Mock form state for new address
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const handleAddNew = (e) => {
    e.preventDefault();
    const id = Date.now();
    setAddresses([...addresses, { ...newAddress, id, isDefault: false }]);
    setSelectedId(id);
    setIsAddingNew(false);
    // Reset form
    setNewAddress({ type: 'Home', name: '', line1: '', line2: '', city: '', state: '', zip: '', phone: '' });
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setAddresses(addresses.filter(addr => addr.id !== id));
    if (selectedId === id && addresses.length > 1) {
      setSelectedId(addresses.find(a => a.id !== id).id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div 
            key={addr.id}
            onClick={() => setSelectedId(addr.id)}
            className={`relative p-6 border rounded-sm cursor-pointer transition-all ${
              selectedId === addr.id 
                ? 'border-heritage-gold bg-heritage-paper ring-1 ring-heritage-gold' 
                : 'border-heritage-border hover:border-heritage-charcoal'
            }`}
          >
            {selectedId === addr.id && (
              <div className="absolute top-2 right-2 bg-heritage-gold text-white rounded-full p-1">
                <Check size={12} />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-heritage-mist px-2 py-1 text-heritage-grey rounded">
                {addr.type}
              </span>
              <div className="flex gap-2">
                <button className="text-heritage-grey hover:text-heritage-charcoal p-1">
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => handleDelete(addr.id, e)}
                  className="text-heritage-grey hover:text-red-600 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h4 className="font-cormorant text-lg font-bold text-heritage-charcoal mb-1">{addr.name}</h4>
            <p className="text-sm text-heritage-grey font-montserrat leading-relaxed">
              {addr.line1}<br />
              {addr.line2 && <>{addr.line2}<br /></>}
              {addr.city}, {addr.state} - {addr.zip}
            </p>
            <p className="text-sm text-heritage-grey mt-2 font-montserrat flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest">Phone:</span> {addr.phone}
            </p>
          </div>
        ))}

        {/* Add New Button */}
        <button 
          onClick={() => setIsAddingNew(true)}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-heritage-border rounded-sm hover:border-heritage-gold hover:bg-heritage-paper transition-all text-heritage-grey hover:text-heritage-gold min-h-[200px]"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-xs uppercase tracking-widest font-bold">Add New Address</span>
        </button>
      </div>

      {/* Add New Modal/Form Area */}
      {isAddingNew && (
        <div className="bg-heritage-mist/30 p-6 rounded-sm border border-heritage-border animate-fade-in mt-6">
          <h3 className="font-cormorant text-xl text-heritage-charcoal mb-6">Add New Delivery Address</h3>
          <form onSubmit={handleAddNew} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={newAddress.name}
                onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat"
                required
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Phone Number" 
                value={newAddress.phone}
                onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat"
                required
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Pincode" 
                value={newAddress.zip}
                onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat"
                required
              />
            </div>
            <div className="md:col-span-2">
              <input 
                type="text" 
                placeholder="Address Line 1 (House No, Building, Street)" 
                value={newAddress.line1}
                onChange={e => setNewAddress({...newAddress, line1: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat"
                required
              />
            </div>
            <div className="md:col-span-2">
              <input 
                type="text" 
                placeholder="Address Line 2 (Area, Landmark)" 
                value={newAddress.line2}
                onChange={e => setNewAddress({...newAddress, line2: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="City" 
                value={newAddress.city}
                onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat"
                required
              />
            </div>
            <div>
              <select 
                value={newAddress.state}
                onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                className="w-full p-3 border border-heritage-border focus:border-heritage-gold outline-none text-sm font-montserrat bg-white"
                required
              >
                <option value="">Select State</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="MH">Maharashtra</option>
                <option value="DL">Delhi</option>
                {/* Add more states */}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button 
                type="button" 
                onClick={() => setIsAddingNew(false)}
                className="px-6 py-2 text-xs uppercase tracking-widest font-bold text-heritage-grey hover:text-heritage-charcoal"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-heritage-charcoal text-white text-xs uppercase tracking-widest font-bold hover:bg-heritage-gold transition-colors"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;