import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStudentTeacher, getMessages } from '../services/chatApi';
import { io } from 'socket.io-client';
import { Send, User as UserIcon } from 'lucide-react';

export default function StudentChat() {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputStr, setInputStr] = useState("");
  const endRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    setConnected(true);
    
    getStudentTeacher(user._id).then(res => {
      setTeacher(res.data);
      if (res.data) {
        getMessages(user._id, res.data._id).then(m => setMessages(m.data));
      }
    });

    return () => {
      socketRef.current?.disconnect();
      setConnected(false);
    };
  }, [user._id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on('receive_message', (msg) => {
        if ((msg.senderId === user._id && msg.receiverId === teacher?._id) ||
            (msg.senderId === teacher?._id && msg.receiverId === user._id)) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }
    return () => {
      socket?.off('receive_message');
    };
  }, [connected, teacher, user._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!inputStr.trim() || !teacher || !socket) return;
    
    const msgData = {
      senderId: user._id,
      receiverId: teacher._id,
      text: inputStr
    };
    
    socket.emit('send_message', msgData);
    setInputStr("");
  };

  if (!teacher) return <div className="p-8 text-center text-slate-500">Iltimos, avval guruhga qo'shiling. O'qituvchi topilmadi.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">
           <UserIcon size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">{teacher.name}</h2>
          <p className="text-xs text-slate-500">Sizning O'qituvchingiz</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
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
    </div>
  );
}
