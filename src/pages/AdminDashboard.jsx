import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, deleteUser, updateUser } from '../services/userApi';
import { getGroups, createGroup, deleteGroup, getGroupStudents } from '../services/groupApi';
import {
  Users, GraduationCap, Shield, FolderOpen, Pencil, Trash2, X,
  Eye, ChevronRight, UserCheck, UserX, Calendar, Mail, Phone, ArrowRightLeft, Settings
} from 'lucide-react';
import { removeStudentFromGroup, moveStudentToGroup, updateGroup } from '../services/groupApi';
import { getAdminStats } from '../services/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const STAT_CARDS = [
  { key: 'students',  label: "O'quvchilar",   icon: GraduationCap, color: 'from-violet-500 to-indigo-600' },
  { key: 'teachers',  label: "O'qituvchilar",  icon: Users,          color: 'from-indigo-500 to-blue-600'  },
  { key: 'admins',    label: 'Adminlar',        icon: Shield,         color: 'from-rose-500 to-pink-600'    },
  { key: 'groups',    label: 'Guruhlar',        icon: FolderOpen,     color: 'from-emerald-500 to-teal-600' },
];

const ROLE_BADGE = {
  teacher: 'bg-violet-50 text-violet-700',
  admin:   'bg-rose-50 text-rose-700',
  student: 'bg-emerald-50 text-emerald-700',
};

// ─── Small helpers ──────────────────────────────────────────────────────────
const Avatar = ({ name, className = '' }) => (
  <div className={`rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center font-black text-violet-600 shrink-0 ${className}`}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

const fmt = (d) => d ? new Date(d).toLocaleDateString('uz-UZ') : '—';

// ─── Group Students Modal ────────────────────────────────────────────────────
function GroupStudentsModal({ groupId, onClose, onRefresh, allGroups }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movingStudentId, setMovingStudentId] = useState(null);
  const [targetGroupId, setTargetGroupId] = useState('');

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = () => {
    setLoading(true);
    getGroupStudents(groupId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  const handleRemove = async (studentId, studentName) => {
    if (!window.confirm(`${studentName} guruhdan chiqarilsinmi?`)) return;
    try {
      await removeStudentFromGroup(studentId);
      toast.success("O'quvchi guruhdan chiqarildi");
      fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleMove = async (e) => {
    e.preventDefault();
    if (!targetGroupId) return;
    try {
      await moveStudentToGroup(movingStudentId, targetGroupId);
      toast.success("O'quvchi boshqa guruhga o'tkazildi");
      setMovingStudentId(null);
      setTargetGroupId('');
      fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {loading ? 'Yuklanmoqda...' : data?.group?.name || 'Guruh'}
            </h2>
            {data && (
              <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                O'qituvchi: <span className="text-violet-600 font-bold">{data.group?.teacherId?.name || '—'}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors mt-0.5">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-center text-slate-400 py-10 text-sm">Ma'lumot yuklanmadi</p>
          ) : data.students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <UserX className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium">Bu guruhda hali o'quvchi yo'q</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.students.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-violet-200 transition-colors group/item"
                >
                  <Avatar name={s.name} className="w-10 h-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-700 truncate">{s.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />{s.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => setMovingStudentId(s._id)}
                      title="Guruhni almashtirish"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(s._id, s.name)}
                      title="Guruhdan chiqarish"
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Move Student UI */}
        <AnimatePresence>
          {movingStudentId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-4 border-t border-indigo-50 bg-indigo-50/30 overflow-hidden"
            >
              <form onSubmit={handleMove} className="flex gap-2">
                <select
                  required
                  value={targetGroupId}
                  onChange={e => setTargetGroupId(e.target.value)}
                  className="flex-1 bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">Yangi guruhni tanlang...</option>
                  {allGroups.filter(g => g._id !== groupId).map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  Ko'chirish
                </button>
                <button
                  type="button"
                  onClick={() => setMovingStudentId(null)}
                  className="bg-white text-slate-400 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-indigo-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {data && (
          <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/60">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Jami: <span className="text-violet-600">{data.students.length}</span> o'quvchi
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();

  const [usersInfo, setUsersInfo]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [groups, setGroups]             = useState([]);
  const [groupNumber, setGroupNumber]   = useState('');
  const [assignedTeacher, setAssignedTeacher] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);
  const [stats, setStats]               = useState({ students: 0, teachers: 0, admins: 0, groups: 0 });

  const [editingUser, setEditingUser]   = useState(null);
  const [editForm, setEditForm]         = useState({ name: '', email: '', role: '' });
  const [editLoading, setEditLoading]   = useState(false);

  const [editingGroup, setEditingGroup] = useState(null);
  const [groupEditForm, setGroupEditForm] = useState({ name: '', teacherId: '' });
  const [groupEditLoading, setGroupEditLoading] = useState(false);

  const [viewGroupId, setViewGroupId] = useState(null); // students modal
  const [assigningStudentId, setAssigningStudentId] = useState(null);
  const [targetGroupIdForNew, setTargetGroupIdForNew] = useState('');
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => { 
    fetchUsers(); 
    fetchGroupsData(); 
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      const data = await getAdminStats();
      setAdminStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsersInfo(data);
      setStats(s => ({
        ...s,
        students: data.filter(u => u.role === 'student').length,
        teachers: data.filter(u => u.role === 'teacher').length,
        admins:   data.filter(u => u.role === 'admin').length,
      }));
    } catch {} finally { setLoading(false); }
  };

  const fetchGroupsData = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
      setStats(s => ({ ...s, groups: data.length }));
    } catch {}
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupLoading(true);
    try {
      await createGroup({ name: `${groupNumber}-Guruh`, teacherId: assignedTeacher });
      setGroupNumber(''); setAssignedTeacher('');
      fetchGroupsData();
      toast.success("Guruh yaratildi");
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
    finally { setGroupLoading(false); }
  };

  const handleDeleteGroup = async (g) => {
    if (!window.confirm(`"${g.name}" guruhini o'chirmoqchimisiz?\nGuruhdagi o'quvchilar guruhsiz qoladi.`)) return;
    try {
      await deleteGroup(g._id);
      fetchGroupsData();
      fetchUsers();
      toast.success("Guruh o'chirildi");
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`"${userName}" o'chirilsinmi? Barcha ma'lumotlari tiklanmaydi.`)) return;
    try { await deleteUser(userId); fetchUsers(); toast.success("Foydalanuvchi o'chirildi"); }
    catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
  };

  const handleOpenEdit = (u) => { setEditingUser(u); setEditForm({ name: u.name, email: u.email, role: u.role }); };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try { await updateUser(editingUser._id, editForm); setEditingUser(null); fetchUsers(); toast.success("Ma'lumotlar yangilandi"); }
    catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
    finally { setEditLoading(false); }
  };

  const handleOpenGroupEdit = (g) => {
    setEditingGroup(g);
    setGroupEditForm({ name: g.name, teacherId: g.teacherId?._id || '' });
  };

  const handleGroupUpdateSubmit = async (e) => {
    e.preventDefault();
    setGroupEditLoading(true);
    try {
      await updateGroup(editingGroup._id, groupEditForm);
      setEditingGroup(null);
      fetchGroupsData();
      toast.success("Guruh yangilandi");
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
    finally { setGroupEditLoading(false); }
  };

  const handleAssignGroup = async (e) => {
    e.preventDefault();
    if (!targetGroupIdForNew) return;
    try {
      await moveStudentToGroup(assigningStudentId, targetGroupIdForNew);
      toast.success("O'quvchi guruhga qo'shildi");
      setAssigningStudentId(null);
      setTargetGroupIdForNew('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const teachersList = usersInfo.filter(u => u.role === 'teacher');
  const newStudents = usersInfo.filter(u => u.role === 'student' && !u.groupId);

  return (
    <div className="w-full pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Admin Paneli</h1>
        <p className="text-sm text-slate-400 mt-1">Platformaning to'liq boshqaruvi va nazorati.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const val = card.key === 'groups'
            ? groups.length
            : stats[card.key];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{loading ? '...' : val}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-slate-800">Guruhlar tahlili</h2>
              <p className="text-xs text-slate-400 font-medium">Har bir guruhdagi o'quvchilar soni</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
              <FolderOpen size={20} />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {adminStats?.groupData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminStats.groupData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]} barSize={40}>
                    {adminStats.groupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">
                Ma'lumotlar yuklanmoqda...
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Tizim holati</h3>
            <p className="text-slate-400 text-sm font-medium">Barcha ko'rsatkichlar joyida. Platforma 100% aktiv.</p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>O'quvchilar sig'imi</span>
                <span>{stats.students}/1000</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-400 to-indigo-400" 
                  style={{ width: `${(stats.students / 1000) * 100}%` }}
                ></div>
              </div>
            </div>
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              Batafsil Hisobot
            </button>
          </div>
        </div>
      </div>

      {/* Group Management */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Create Group Form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-violet-600 rounded-full inline-block" />
            Yangi Guruh
          </h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guruh raqami</label>
              <div className="flex">
                <input
                  type="number" min="1" required value={groupNumber}
                  onChange={e => setGroupNumber(e.target.value)}
                  placeholder="1, 2, 3..."
                  className="flex-grow bg-slate-50 border border-slate-100 rounded-l-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-400"
                />
                <span className="bg-violet-50 text-violet-700 font-black text-sm px-3 flex items-center rounded-r-xl border border-slate-100 border-l-0">-Guruh</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">O'qituvchi</label>
              <select required value={assignedTeacher} onChange={e => setAssignedTeacher(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-400">
                <option value="" disabled>— Tanlang —</option>
                {teachersList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              {teachersList.length === 0 && <p className="text-[10px] text-rose-500 mt-1.5 font-bold">Tizimda o'qituvchi yo'q!</p>}
            </div>
            <button type="submit" disabled={groupLoading || !teachersList.length}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 text-sm">
              {groupLoading ? 'Yaratilmoqda...' : 'Guruh yaratish'}
            </button>
          </form>
        </div>

        {/* Groups List */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full inline-block" />
            Mavjud Guruhlar ({groups.length})
          </h2>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FolderOpen className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-sm font-medium">Hali guruhlar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map(g => (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center font-black text-violet-600 text-sm shrink-0">
                    {g.name.split('-')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-700 text-sm truncate">{g.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {g.teacherId?.name || "O'qituvchi yo'q"}
                    </p>
                  </div>
                  {/* action buttons - visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View students */}
                    {/* View students */}
                    <button
                      onClick={() => setViewGroupId(g._id)}
                      title="O'quvchilarni ko'rish"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* Edit group */}
                    <button
                      onClick={() => handleOpenGroupEdit(g)}
                      title="Guruhni tahrirlash"
                      className="p-2 text-slate-400 hover:text-violet-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {/* Delete group */}
                    <button
                      onClick={() => handleDeleteGroup(g)}
                      title="Guruhni o'chirish"
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Chevron hint */}
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-violet-400 transition-colors shrink-0 hidden sm:block" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Students (Unassigned) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-5 flex items-center gap-2">
          <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
          Yangi O'quvchilar ({newStudents.length})
        </h2>
        
        {newStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <UserCheck className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-sm font-medium">Barcha o'quvchilar guruhlarga biriktirilgan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newStudents.map(s => (
              <motion.div
                key={s._id}
                layout
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} className="w-10 h-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-700 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{s.email}</p>
                  </div>
                </div>
                
                {assigningStudentId === s._id ? (
                  <form onSubmit={handleAssignGroup} className="flex gap-2">
                    <select
                      required
                      value={targetGroupIdForNew}
                      onChange={e => setTargetGroupIdForNew(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Guruhni tanlang...</option>
                      {groups.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition-colors shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssigningStudentId(null)}
                      className="bg-white text-slate-400 p-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setAssigningStudentId(s._id)}
                    className="w-full bg-white border border-slate-200 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-orange-500" />
                    Guruhga qo'shish
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
            Foydalanuvchilar ({usersInfo.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3">Foydalanuvchi</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3 hidden md:table-cell">Ro'yxatdan o'tgan</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Oxirgi kirish</th>
                  <th className="px-6 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersInfo.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} className="w-8 h-8 text-sm" />
                        <div>
                          <div className="text-sm font-bold text-slate-700">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell text-xs text-slate-500 font-medium">
                      {fmt(u.createdAt)}
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell text-xs text-slate-400 font-medium">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('uz-UZ') : 'Hali kirmagan'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleOpenEdit(u)}
                          className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u._id !== user._id ? (
                          <button onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 px-2">Men</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              key="edit-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button onClick={() => setEditingUser(null)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
              <h2 className="text-xl font-black text-slate-800 mb-6">Tahrirlash</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                {[
                  { label: 'Ism Familiya', field: 'name', type: 'text' },
                  { label: 'Email', field: 'email', type: 'email' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                    <input type={type} required value={editForm[field]}
                      onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-400" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rol</label>
                  <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-400">
                    <option value="student">Talaba (Student)</option>
                    <option value="teacher">O'qituvchi (Teacher)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
                <button type="submit" disabled={editLoading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-3 rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 mt-2">
                  {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Group Students Modal */}
        {viewGroupId && (
          <GroupStudentsModal
            key="students-modal"
            groupId={viewGroupId}
            allGroups={groups}
            onClose={() => setViewGroupId(null)}
            onRefresh={fetchUsers}
          />
        )}

        {/* Edit Group Modal */}
        {editingGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button onClick={() => setEditingGroup(null)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
              <h2 className="text-xl font-black text-slate-800 mb-6">Guruhni tahrirlash</h2>
              <form onSubmit={handleGroupUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guruh nomi</label>
                  <input type="text" required value={groupEditForm.name}
                    onChange={e => setGroupEditForm({ ...groupEditForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">O'qituvchi</label>
                  <select value={groupEditForm.teacherId} onChange={e => setGroupEditForm({ ...groupEditForm, teacherId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-400">
                    <option value="">— O'qituvchi yo'q —</option>
                    {teachersList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={groupEditLoading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-3 rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 mt-2">
                  {groupEditLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
