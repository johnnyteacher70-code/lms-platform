import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTeacherContacts, getMessages } from '../services/chatApi';
import { io } from 'socket.io-client';
import { Send, User as UserIcon } from 'lucide-react';

export default function TeacherChat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputStr, setInputStr] = useState("");
  const endRef = useRef(null);
  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL || 'https://lms-platform-efpp.onrender.com'), []);

  useEffect(() => {
    getTeacherContacts(user._id).then(res => {
      setContacts(res.data);
    });
    return () => socket.disconnect();
  }, [user._id, socket]);

  useEffect(() => {
    if (activeContact) {
      getMessages(user._id, activeContact._id).then(res => setMessages(res.data));
    } else {
      setMessages([]);
    }
  }, [activeContact, user._id]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      if (activeContact && ((msg.senderId === user._id && msg.receiverId === activeContact._id) ||
          (msg.senderId === activeContact._id && msg.receiverId === user._id))) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socket.off('receive_message');
    };
  }, [socket, activeContact, user._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputStr.trim() || !activeContact || !socket) return;
    
    const msgData = {
      senderId: user._id,
      receiverId: activeContact._id,
      text: inputStr
    };
    
    socket.emit('send_message', msgData);
    setInputStr("");
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Sidebar - Contacts */}
      <div className="w-1/3 min-w-[250px] border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="font-bold text-slate-800">O'quvchilar</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(c => (
            <div 
              key={c._id} 
              onClick={() => setActiveContact(c)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${activeContact?._id === c._id ? 'bg-indigo-50 border-l-4 border-l-primary' : 'hover:bg-white border-l-4 border-l-transparent'}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                 {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className={`font-semibold text-sm truncate ${activeContact?._id === c._id ? 'text-primary' : 'text-slate-700'}`}>{c.name}</h3>
                <p className="text-xs text-slate-400 truncate">{c.email}</p>
              </div>
            </div>
          ))}
          {contacts.length === 0 && <div className="p-4 text-sm text-slate-400 text-center">O'quvchilar yo'q</div>}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {!activeContact ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
            <UserIcon size={48} className="opacity-20" />
            <p>Suhbatlashish uchun o'quvchini tanlang</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">
                 {activeContact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{activeContact.name}</h2>
                <p className="text-xs text-slate-500">Talaba</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => {
                const isMe = m.senderId === user._id;
                return (
                  <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm break-words ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={inputStr} 
                onChange={e => setInputStr(e.target.value)} 
                placeholder="Xabar yozing..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white p-2 px-4 rounded-xl shadow-sm transition-all focus:scale-95 flex items-center justify-center">
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
