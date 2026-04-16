import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/authApi'
import { getGroups } from '../services/groupApi'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-primary">Ro'yxatdan o'tish</h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Platformaga qo'shilish uchun formani to'ldiring
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
             <label className="block text-gray-700 text-sm font-bold mb-2">Kim bo'lib kiryapsiz?</label>
             <select 
               className="border rounded w-full py-2 px-3 focus:ring-2 focus:ring-primary outline-none bg-indigo-50 font-medium text-indigo-700 mb-2"
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

          <div>
             <label className="block text-gray-700 text-sm font-bold mb-2">Ism Familiya</label>
             <input 
               type="text" required placeholder="Ali Valiyev"
               className="border rounded w-full py-2 px-3 focus:ring-2 focus:ring-primary outline-none"
               value={name} onChange={(e) => setName(e.target.value)}
             />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" required placeholder="ali@gmail.com"
              className="border rounded w-full py-2 px-3 focus:ring-2 focus:ring-primary outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Parol</label>
            <input 
              type="password" required placeholder="••••••••"
              className="border rounded w-full py-2 px-3 focus:ring-2 focus:ring-primary outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Falqat Student uchun Guruh tanlash qismi */}
          {role === 'student' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <label className="block text-gray-700 text-sm font-bold mb-2">Qaysi guruhga qo'shilasiz?</label>
               {groups.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold">Hech qanday guruh topilmadi! Admindan guruh yaratishini so'rang yoki O'qituvchi bo'lib kiring.</p>
               ) : (
                  <select 
                    required
                    className="border border-slate-300 rounded w-full py-2 px-3 focus:ring-2 focus:ring-primary outline-none bg-white font-semibold text-slate-800"
                    value={groupId} 
                    onChange={(e) => setGroupId(e.target.value)}
                  >
                     <option value="" disabled>-- Guruhni tanlang --</option>
                     {groups.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                     ))}
                  </select>
               )}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded mt-2 transition"
          >
            {loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan O\'tish'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Akkountingiz bormi? <Link to="/login" className="text-primary font-bold hover:underline">Kirish (Login)</Link>
        </p>
      </div>
    </div>
  )
}
