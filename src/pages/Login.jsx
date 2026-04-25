import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/authApi'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Backenddan ma'lumotlarni tekshirish (Axios orqali /api/auth/login)
      const data = await loginUser(email, password);
      
      login(data.user, data.token);
      
      // Tegishli sahifaga yo'naltirish
      navigate(`/${data.user.role}-dashboard`);

    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
         setError('Backend serverga ulanib bo\'lmadi. Terminalda Node server ishlalayotganini tekshiring.');
      } else {
         setError(err.response?.data?.message || 'Email yoki parol xato!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20"
          >
            U
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Xush kelibsiz!</h1>
          <p className="text-slate-500 font-medium font-semibold">Platformaga kirish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-premium border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Parol</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

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
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-500 font-medium text-sm">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-primary font-black hover:underline underline-offset-4">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
