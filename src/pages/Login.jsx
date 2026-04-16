import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/authApi'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-primary">Login</h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Haqiqiy Backend orqali tizimga kirish
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 font-semibold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              required
              placeholder="Sizning emailingiz..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Parol</label>
            <input 
              type="password" 
              required
              placeholder="********"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition disabled:bg-indigo-300 mt-4 cursor-pointer"
          >
            {loading ? 'Tekshirilmoqda...' : 'Kirish (Log in)'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Akkountingiz yo'qmi? <Link to="/register" className="text-primary font-bold hover:underline">Ro'yxatdan o'tish</Link>
        </p>
      </div>
    </div>
  )
}
