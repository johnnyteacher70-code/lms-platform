import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, deleteUser, updateUser } from '../services/userApi';
import { getGroups, createGroup } from '../services/groupApi';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Users state
  const [usersInfo, setUsersInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  // Groups state
  const [groups, setGroups] = useState([]);
  const [groupNumber, setGroupNumber] = useState('');
  const [assignedTeacher, setAssignedTeacher] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);

  const [stats, setStats] = useState({
     students: 0,
     teachers: 0,
     admins: 0
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchGroupsData();
  }, []);

  const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsersInfo(data);
        
        const studentCount = data.filter(u => u.role === 'student').length;
        const teacherCount = data.filter(u => u.role === 'teacher').length;
        const adminCount = data.filter(u => u.role === 'admin').length;

        setStats({ students: studentCount, teachers: teacherCount, admins: adminCount });
      } catch (err) {
        console.error("Foydalanuvchilarni olishda xatolik", err);
      } finally {
        setLoading(false);
      }
  };

  const fetchGroupsData = async () => {
     try {
       const data = await getGroups();
       setGroups(data);
     } catch (err) {
       console.error("Guruhlarni olishda xatolik", err);
     }
  };

  const handleCreateGroup = async (e) => {
     e.preventDefault();
     setGroupLoading(true);
     try {
       // Guruh formatini "1-Guruh" shaklida saqlaymiz
       await createGroup({ name: `${groupNumber}-Guruh`, teacherId: assignedTeacher });
       alert("Guruh muvaffaqiyatli yaratildi!");
       setGroupNumber('');
       setAssignedTeacher('');
       fetchGroupsData();
     } catch(err) {
       alert(err.response?.data?.message || "Guruh yaratishda xatolik");
     } finally {
       setGroupLoading(false);
     }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmation = window.confirm(`Diqqat! ${userName} rostdan ham o'chirilsinmi? Uning barcha ma'lumotlari, vazifalari va yechimlari tiklanmaydigan bo'lib ketadi.`);
    if(!confirmation) return;

    try {
      await deleteUser(userId);
      alert("Muvaffaqiyatli o'chirildi.");
      fetchUsers();
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditForm({
       name: userToEdit.name,
       email: userToEdit.email,
       role: userToEdit.role
    });
  };

  const handleUpdateSubmit = async (e) => {
     e.preventDefault();
     setEditLoading(true);
     try {
       await updateUser(editingUser._id, editForm);
       alert("Muvaffaqiyatli tahrirlandi!");
       setEditingUser(null);
       fetchUsers();
     } catch (err) {
       alert("Tahrirlashda xatolik: " + (err.response?.data?.message || err.message));
     } finally {
       setEditLoading(false);
     }
  };

  const teachersList = usersInfo.filter(u => u.role === 'teacher');

  return (
    <div className="w-full relative pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Paneli</h1>
          <p className="text-slate-500 mt-1">Platformaning to'liq boshqaruvi va foydalanuvchilar nazorati.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Jami O'quvchilar</p>
            <p className="text-3xl font-black text-slate-800">{loading ? '...' : stats.students} ta</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">O'qituvchilar</p>
            <p className="text-3xl font-black text-slate-800">{loading ? '...' : stats.teachers} ta</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Adminlar</p>
            <p className="text-3xl font-black text-slate-800">{loading ? '...' : stats.admins} ta</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Guruhlar soni</p>
            <p className="text-3xl font-black text-slate-800">{groups.length} ta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Gruppa Yaratish (Left Column) */}
        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 lg:col-span-1 h-max">
           <h2 className="text-xl font-bold text-indigo-900 mb-6">Yangi Guruh Qo'shish</h2>
           <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                 <label className="block text-slate-700 text-sm font-bold mb-2">Guruh Raqami</label>
                 <div className="flex items-center">
                    <input 
                      type="number" min="1" required
                      className="w-full border-slate-200 rounded-l-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="1, 2, 3..."
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                    />
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-4 py-3 rounded-r-xl border border-indigo-200 border-l-0">-Guruh</span>
                 </div>
              </div>
              
              <div>
                 <label className="block text-slate-700 text-sm font-bold mb-2">Biriktirilgan Ustoz</label>
                 <select 
                   required
                   className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                   value={assignedTeacher}
                   onChange={(e) => setAssignedTeacher(e.target.value)}
                 >
                    <option value="" disabled>-- Ustozni tanlang --</option>
                    {teachersList.map(t => (
                       <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                 </select>
                 {teachersList.length === 0 && <p className="text-xs text-red-500 mt-1">Tizimda o'qituvchi yo'q! Oldin o'qituvchi qo'shing.</p>}
              </div>

              <button 
                type="submit" 
                disabled={groupLoading || teachersList.length === 0}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition disabled:opacity-50 mt-2"
              >
                {groupLoading ? 'Yaratilmoqda...' : 'Guruhni Yaratish'}
              </button>
           </form>
        </div>

        {/* Guruhlar Ro'yxati (Right Column) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
           <h2 className="text-xl font-bold text-slate-800 mb-6">Mavjud Guruhlar</h2>
           {groups.length === 0 ? (
             <p className="text-slate-500 text-center py-8">Hali hech qanday guruh yaratilmagan.</p>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(g => (
                   <div key={g._id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-indigo-200 transition bg-slate-50">
                      <div>
                        <h3 className="font-extrabold text-indigo-900 text-lg mb-1">{g.name}</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          Ustoz: {g.teacherId?.name || "O'chirilgan"}
                        </p>
                      </div>
                      <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                         {g.name.split('-')[0]}
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Foydalanuvchilar ro'yxati (Baza)</h2>
        </div>
        
        {loading ? (
           <div className="p-10 text-center text-slate-500">Ma'lumotlar yuklanmoqda...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5">Foydalanuvchi</th>
                  <th className="p-5">Rol (Role)</th>
                  <th className="p-5">Ro'yxatdan o'tgan</th>
                  <th className="p-5">Oxirgi marta kirdi (Login)</th>
                  <th className="p-5 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usersInfo.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-slate-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                        ${u.role === 'teacher' ? 'bg-purple-100 text-purple-700' 
                          : u.role === 'admin' ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-700'}
                      `}>
                        {u.role}
                      </span>
                    </td>
                    
                    <td className="p-5 font-medium text-slate-600">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Noma\'lum'}
                    </td>

                    <td className="p-5 font-medium text-slate-600">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Hali kirmagan'}
                    </td>
                    
                    <td className="p-5 text-right space-x-2">
                       <button onClick={() => handleOpenEdit(u)} className="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 hover:bg-indigo-50 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                       </button>
                      
                       {u._id !== user._id && (
                        <button 
                           onClick={() => handleDeleteUser(u._id, u.name)}
                           className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                      
                      {u._id === user._id && (
                        <span className="text-xs text-slate-400 font-bold px-2">Men</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative">
             <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
             
             <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Tahrirlash</h2>
             
             <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Ism Familiya</label>
                  <input 
                    type="text" required
                    className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Email</label>
                  <input 
                    type="email" required
                    className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Foydalanuvchi roli</label>
                  <select 
                    className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
                     <option value="student">Talaba (Student)</option>
                     <option value="teacher">O'qituvchi (Teacher)</option>
                     <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition disabled:opacity-50 mt-4"
                >
                  {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}
