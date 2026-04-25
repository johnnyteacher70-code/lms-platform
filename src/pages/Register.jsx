import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/authApi'
import { getGroups } from '../services/groupApi'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, UserPlus, ArrowRight, BookOpen } from 'lucide-react'

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); 
  const [groupId, setGroupId] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     const fetchGroupsData = async () => {
        try {
          const data = await getGroups();
          setGroups(data);
        } catch(err) {
          console.error("Guruhlarni tortishda muammo", err);
        }
     };
     fetchGroupsData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Agar o'quvchi guruh tanlamagan bo'lsa xato beramiz
    if (role === 'student' && !groupId) {
       setError("Iltimos, guruhni tanlang!");
       return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await registerUser({ 
        name, 
        email, 
        password, 
        role, 
        groupId: role === 'student' ? groupId : null 
      });
      
      if(data.user && data.token) {
        login(data.user, data.token);
        navigate(`/${data.user.role}-dashboard`);
      } else {
        navigate('/login');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Registratsiya o\'xshamadi. Backend serveringiz yoniqmi?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md my-12"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20"
          >
            U
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Ro'yxatdan o'tish</h1>
          <p className="text-slate-500 font-medium">Platformaga qo'shilish uchun formani to'ldiring</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-premium border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kim bo'lib kiryapsiz?</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary"
                value={role} 
                onChange={(e) => {
                  setRole(e.target.value);
                  if(e.target.value !== 'student') setGroupId('');
                }}
              >
                 <option value="student">Talaba (Student)</option>
                 <option value="teacher">O'qituvchi (Teacher)</option>
                 <option value="admin">Administrator (Admin)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ism Familiya</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" required placeholder="Ali Valiyev"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" required placeholder="ali@gmail.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Parol</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Faqat Student uchun Guruh tanlash qismi */}
            <AnimatePresence>
              {role === 'student' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Guruhni tanlang</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    {groups.length === 0 ? (
                      <p className="w-full bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase">Guruhlar mavjud emas</p>
                    ) : (
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 appearance-none"
                        value={groupId} 
                        onChange={(e) => setGroupId(e.target.value)}
                      >
                         <option value="" disabled>-- Tanlang --</option>
                         {groups.map(g => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                         ))}
                      </select>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2"
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50 mt-4"
            >
              {loading ? "Yuborilmoqda..." : "Yaratish"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-500 font-medium text-sm">
          Akkountingiz bormi?{" "}
          <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
            Kirish
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
