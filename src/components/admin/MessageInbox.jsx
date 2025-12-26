import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Mail, Trash2, MailOpen, Clock, User, CheckCircle } from 'lucide-react';

export const MessageInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const markRead = async (id, read) => {
    if (!read) await updateDoc(doc(db, 'messages', id), { read: true });
  };

  const deleteMsg = async (e, id) => {
    e.stopPropagation();
    if(confirm('Delete message?')) await deleteDoc(doc(db, 'messages', id));
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading inbox...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Mail className="text-[#B08D55]"/> Customer Inquiries</h2>
       
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {messages.length === 0 ? (
             <div className="p-12 text-center text-gray-400">No messages yet.</div>
          ) : (
             messages.map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => markRead(msg.id, msg.read)}
                  className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors group relative ${!msg.read ? 'bg-blue-50/30' : ''}`}
                >
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${msg.read ? 'bg-gray-100 text-gray-400' : 'bg-[#B08D55] text-white'}`}>
                            {msg.read ? <MailOpen size={16}/> : <Mail size={16}/>}
                         </div>
                         <div>
                            <h4 className={`text-sm ${!msg.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.subject}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><User size={10}/> {msg.name} &lt;{msg.email}&gt;</p>
                         </div>
                      </div>
                      <span className="text-xs text-gray-400">{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Now'}</span>
                   </div>
                   <p className="text-sm text-gray-600 pl-11 leading-relaxed">{msg.message}</p>
                   
                   <button onClick={(e) => deleteMsg(e, msg.id)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                   </button>
                </div>
             ))
          )}
       </div>
    </div>
  );
};