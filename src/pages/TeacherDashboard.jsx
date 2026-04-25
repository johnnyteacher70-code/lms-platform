import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAttendanceMatrix, saveAttendance } from '../services/attendanceApi';
import { getTeacherGroups } from '../services/groupApi';
import { getAssignments, createAssignment } from '../services/assignmentApi';
import { getTeacherSubmissions, updateSubmissionStatus } from '../services/submissionApi';
import ScoringModal from '../components/Teacher/ScoringModal';
import TeacherModules from './TeacherModules';
import TeacherChat from './TeacherChat';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Bell, Users, LayoutGrid, BookOpen, MessageSquare, Search, ChevronRight, GraduationCap, Layers, Menu, X, Plus, Calendar } from 'lucide-react';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [myGroups, setMyGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('guruhim');
  const [scoringStudent, setScoringStudent] = useState(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [gradSub, setGradSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [fdbInput, setFdbInput] = useState('');
  const [gradeLoading, setGradeLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const groupsData = await getTeacherGroups(user._id);
        const activeGroups = groupsData.filter(g => g.status === 'active' || !g.status);
        setMyGroups(groupsData);
        if (activeGroups.length > 0) setActiveGroup(activeGroups[0]);

        const assignsData = await getAssignments();
        setMyAssignments(assignsData.filter(a => a.teacherId?._id === user._id || a.teacherId === user._id));

        const subsData = await getTeacherSubmissions(user._id);
        setSubmissions(subsData);
      } catch (err) {
        console.error("Ma'lumotlar yuklanmadi:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (activeGroup) fetchMatrix(activeGroup._id);
  }, [activeGroup]);

  const fetchMatrix = async (groupId) => {
    try {
      const data = await getAttendanceMatrix(groupId);
      setMatrixData(data || []);
    } catch (err) {
      console.error("Matritsa yuklanmadi:", err);
    }
  };

  const handleCellAction = (student, dateStr) => {
    setScoringStudent({ ...student, dateStr });
  };

  const handleSaveScoring = async (studentId, category, value) => {
    const dateStr = scoringStudent.dateStr || new Date().toISOString().split('T')[0];
    const existingDay = matrixData.find(d => d.date === dateStr) || { records: [] };
    let rec = existingDay.records.find(r => r.studentId === studentId);
    if (!rec) rec = { studentId, status: 'present', scores: [] };
    rec.scores.push({ category, value });
    rec.status = 'present';
    const updatedRecords = [...existingDay.records.filter(r => r.studentId !== studentId), rec];
    try {
      await saveAttendance({ groupId: activeGroup._id, teacherId: user._id, date: dateStr, records: updatedRecords });
      fetchMatrix(activeGroup._id);
    } catch { alert("Saqlashda xatolik"); }
  };

  const toggleAttendance = async (studentId, dateStr) => {
    const existingDay = matrixData.find(d => d.date === dateStr) || { records: [] };
    let rec = existingDay.records.find(r => r.studentId === studentId);
    const newStatus = rec?.status === 'present' ? 'absent' : 'present';
    if (rec) { rec.status = newStatus; } else { rec = { studentId, status: newStatus, scores: [] }; }
    const updatedRecords = [...existingDay.records.filter(r => r.studentId !== studentId), rec];
    try {
      await saveAttendance({ groupId: activeGroup._id, teacherId: user._id, date: dateStr, records: updatedRecords });
      fetchMatrix(activeGroup._id);
    } catch { alert("Xatolik"); }
  };

  const getStudentCoins = (studentId) => {
    return matrixData.reduce((total, day) => {
      const rec = day.records.find(r => r.studentId === studentId);
      return total + (rec?.scores?.reduce((a, b) => a + b.value, 0) || 0);
    }, 0);
  };

  const getStudentAttendancePercent = (studentId) => {
    if (!matrixData.length) return 100;
    const present = matrixData.filter(day => day.records.find(r => r.studentId === studentId)?.status === 'present').length;
    return Math.round((present / matrixData.length) * 100);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);
    try {
      const newAssign = await createAssignment({ title, description: desc, deadline, teacherId: user._id, groupId: activeGroup._id });
      setMyAssignments(prev => [...prev, newAssign]);
      setTitle(''); setDesc(''); setDeadline('');
      setShowCreateForm(false);
    } catch { alert("Xatolik yuz berdi"); }
    finally { setCreatingTask(false); }
  };

  const startGrading = (sub) => { setGradSub(sub); setGradeInput(sub.grade || ''); setFdbInput(sub.feedback || ''); };

  const submitGrade = async (e) => {
    e.preventDefault();
    setGradeLoading(true);
    try {
      const payload = { status: 'approved', grade: gradeInput !== '' ? Number(gradeInput) : null, feedback: fdbInput };
      await updateSubmissionStatus(gradSub._id, payload);
      setSubmissions(prev => prev.map(s => s._id === gradSub._id ? { ...s, ...payload } : s));
      setGradSub(null);
    } catch { alert("Baholashda xatolik"); }
    finally { setGradeLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredGroups = myGroups.filter(g => g.name.toLowerCase().includes(sidebarSearch.toLowerCase()));

  const GLOBAL_NAV = [
    { id: 'guruhim', label: "Dashboard", icon: LayoutGrid },
    { id: 'materiallar', label: "Darsliklar", icon: Layers },
    { id: 'chat', label: "Chat", icon: MessageSquare }
  ];

  const NAV_SECTIONS = [
     { id: 'materiallar', label: 'Darslik Materiallar', icon: Layers },
  ];

  const TABS = [
    { id: 'guruhim', label: 'Umumiy', icon: LayoutGrid },
    { id: 'jadval', label: 'Davomat', icon: Calendar },
    { id: 'oquvchilar', label: "O'quvchilar", icon: GraduationCap },
    { id: 'homework', label: 'Vazifalar', icon: BookOpen },
    { id: 'darslar', label: 'Chat', icon: MessageSquare },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-200 animate-pulse">
          <span className="text-white font-black text-2xl">J</span>
        </div>
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
        </div>
      </div>
    </div>
  );


  return (
    <>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F0F2F8] font-sans">
      
      {/* ═══════════════════ TOP NAVBAR ═══════════════════ */}
      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-3">
          {/* Menu Toggle */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <span className="text-white font-black text-sm">J</span>
          </div>
          <span className="font-black text-slate-800 tracking-tight text-base">Junior IT</span>
          <span className="text-slate-200 mx-2 hidden sm:inline">|</span>
          <span className="text-xs font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-md hidden sm:inline">Teacher</span>
        </div>


        {/* Right: User Info */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
          <div className="w-px h-6 bg-slate-100"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 font-black text-sm border border-violet-100">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-black text-slate-700 leading-none">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">O'qituvchi</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══════════════════ MAIN BODY ═══════════════════ */}
      <div className="flex-grow flex overflow-hidden">

       {/* ─── TRIPLE-PANE LAYOUT ─── */}
       <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden">
         
         {/* 1. FAR-LEFT: GLOBAL ICON SIDEBAR (PDP Style) */}
         <aside className="hidden lg:flex w-16 bg-slate-900 flex-col items-center py-6 gap-6 shrink-0 z-50">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg mb-4">J</div>
            <div className="flex-grow flex flex-col items-center gap-4">
              {GLOBAL_NAV.map(item => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => item.path ? navigate(item.path) : setActiveTab(item.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title={item.label}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
            <button onClick={logout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut size={20} />
            </button>
         </aside>

         {/* 2. MIDDLE: GROUP SELECTION SIDEBAR (PDP Style) */}
         <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col shrink-0">
           <div className="p-5 border-b border-slate-50">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guruhlarim</h2>
               <div className="flex items-center gap-1">
                 <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Active</span>
                 <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{myGroups.length}</span>
               </div>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
               <input
                 type="text"
                 placeholder="Qidirish..."
                 value={sidebarSearch}
                 onChange={e => setSidebarSearch(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
               />
             </div>
           </div>

           <div className="flex-grow overflow-y-auto p-3 space-y-2">
             {filteredGroups.map((group, idx) => {
               const isSelected = activeGroup?._id === group._id;
               return (
                 <motion.button
                   key={group._id}
                   onClick={() => { setActiveGroup(group); setActiveTab('guruhim'); }}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className={`w-full p-4 rounded-2xl border transition-all text-left relative group ${
                     isSelected 
                      ? 'bg-white border-violet-200 shadow-lg shadow-violet-100/50' 
                      : 'bg-transparent border-transparent hover:bg-slate-50/50 hover:border-slate-100'
                   }`}
                 >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-black tracking-tight ${isSelected ? 'text-violet-600' : 'text-slate-800'}`}>{group.name}</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Active</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                      <GraduationCap size={12} />
                      {group.students?.length || 0} o'quvchi
                    </div>
                    {isSelected && (
                      <motion.div layoutId="active-indicator" className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600"></div>
                      </motion.div>
                    )}
                 </motion.button>
               );
             })}
           </div>
         </aside>

         {/* 3. RIGHT: MAIN CONTENT AREA */}
         <main className="flex-grow flex flex-col min-w-0 bg-slate-50/30 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'materiallar' ? (
              <motion.div
                key="materiallar"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex-grow overflow-auto bg-white p-6"
              >
                <TeacherModules />
              </motion.div>
            ) : activeTab === 'chat' ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex-grow overflow-auto bg-white p-6"
              >
                <TeacherChat />
              </motion.div>
            ) : activeGroup ? (
              <motion.div
                key={activeGroup._id + activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex-grow flex flex-col overflow-hidden"
              >
                {/* Content Header */}
                <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-md">
                          {activeTab === 'guruhim' ? 'Dashboard' : activeTab === 'davomat' ? 'Davomat' : activeTab === 'oquvchilar' ? "O'quvchilar" : activeTab}
                        </span>
                      </div>
                      <h1 className="text-lg font-black text-slate-800 mt-0.5">
                        {activeGroup.name}
                        {activeTab === 'guruhim' && <span className="text-slate-300 font-medium ml-2">· Umumiy Ma'lumotlar</span>}
                        {activeTab === 'davomat' && <span className="text-slate-300 font-medium ml-2">· Davomat Jadvali</span>}
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab === 'davomat' && (
                      <span className="text-xs text-slate-400 font-bold hidden md:block">{new Date().toLocaleDateString('uz-UZ')}</span>
                    )}
                    {activeTab === 'guruhim' && (
                      <button className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-black px-5 py-2 rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        DARS BOSHLASH
                      </button>
                    )}
                    {activeTab === 'homework' && (
                      <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className={`text-xs font-black px-5 py-2 rounded-xl transition-all ${showCreateForm ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white shadow-lg'}`}
                      >
                        {showCreateForm ? 'Bekor qilish' : '+ Yangi vazifa'}
                      </button>
                    )}
                  </div>
                </div>

                {/* ─── PERSISTENT NAVIGATION HUB (Top Bar Style) ─── */}
                <div className="px-6 py-2 bg-white border-b border-slate-100 flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'guruhim', label: 'Umumiy Ma\'lumot', icon: LayoutGrid },
                    { id: 'davomat', label: 'Davomat Jadvali', icon: Calendar },
                    { id: 'oquvchilar', label: "O'quvchilar", icon: GraduationCap },
                    { id: 'homework', label: 'Vazifalar', icon: BookOpen },
                    { id: 'chat', label: 'Chat', icon: MessageSquare },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => tab.path ? navigate(tab.path) : setActiveTab(tab.id)}
                        className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                          isActive ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab.label}
                        {isActive && (
                          <motion.div 
                            layoutId="activeTabUnderline" 
                            className="absolute bottom-0 left-4 right-4 h-0.5 bg-violet-600 rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ─── TAB: DAVOMAT (PDP Redesign) ─── */}
                {activeTab === 'davomat' && (
                  <div className="flex-grow flex flex-col overflow-hidden p-6 relative">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col  flex-grow">
                      
                      {/* Session Header (PDP Style) */}
                      <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/20 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">O'qituvchi</span>
                              <div className="flex items-center gap-2 text-slate-700">
                                <Users size={14} className="text-violet-500" />
                                <span className="text-sm font-black italic">{user.name}</span>
                              </div>
                           </div>
                           <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Dars Vaqti</span>
                              <div className="flex items-center gap-2 text-slate-700">
                                <Calendar size={14} className="text-emerald-500" />
                                <span className="text-sm font-black">17:30 / 19:00</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="text-xs font-black text-slate-600">{new Date().toLocaleDateString('uz-UZ')}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex-grow overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-100">
                            <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                              <th className="px-6 py-4 text-center w-16">#</th>
                              <th className="px-1 py-4 text-left min-w-[250px]">O'quvchi</th>
                              <th className="px-4 py-4 text-center w-32">Davomat %</th>
                              <th className="px-4 py-4 text-center w-32">Tangalar</th>
                              <th className="px-6 py-4 text-center w-40">Holat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {activeGroup.students?.map((student, idx) => {
                              const pct = getStudentAttendancePercent(student._id);
                              const coins = getStudentCoins(student._id);
                              const isPresent = matrixData.find(d => d.date === new Date().toISOString().split('T')[0])?.records?.find(r => r.studentId === student._id)?.status === 'present';
                              
                              return (
                                <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-5 text-center text-sm font-black text-slate-300">{idx + 1}</td>
                                  <td className="px-1 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm border-2 border-white shadow-sm">
                                        {student.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="text-sm font-black text-slate-700 mb-0.5">{student.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                          <Search size={10} /> {student.phone || '+998XXXXXXXXX'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-5 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-emerald-50 text-[11px] font-black text-emerald-600 shadow-sm bg-white">
                                      {pct}%
                                    </div>
                                  </td>
                                  <td className="px-4 py-5 text-center">
                                    <span className="text-sm font-black text-slate-700 tracking-tight">{coins}</span>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => toggleAttendance(student._id, new Date().toISOString().split('T')[0])}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                          isPresent
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                                            : 'bg-slate-100 text-slate-300 hover:bg-rose-100 hover:text-rose-500'
                                        }`}
                                      >
                                        {isPresent ? <span className="text-xs font-black">✓</span> : <X size={14} strokeWidth={3} />}
                                      </button>
                                      <button
                                        onClick={() => handleCellAction(student, new Date().toISOString().split('T')[0])}
                                        className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                                      >
                                        <Plus size={16} strokeWidth={3} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* PDP Style Finish Button */}
                    <div className="flex justify-end mt-4">
                       <button className="bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-400 text-xs font-black px-10 py-3 rounded-2xl transition-all uppercase tracking-widest shadow-sm">
                          Finish
                       </button>
                    </div>
                  </div>
                )}

                {/* ─── TAB: HOMEWORK ─── */}
                {activeTab === 'homework' && (
                  <div className="flex-grow overflow-auto p-6">
                    <AnimatePresence>
                      {showCreateForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-black text-slate-700 mb-4 uppercase tracking-wider">Yangi Vazifa Yaratish</h3>
                            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sarlavha</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-violet-400 outline-none transition-all" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Muddat</label>
                                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-500 outline-none" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tavsif</label>
                                <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows="3" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none resize-none" />
                              </div>
                              <div className="md:col-span-2 flex justify-end">
                                <button type="submit" disabled={creatingTask} className="bg-violet-600 hover:bg-violet-700 text-white font-black px-8 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all text-sm">
                                  {creatingTask ? 'Saqlanmoqda...' : 'Yuborish'}
                                </button>
                              </div>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Assignments */}
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BookOpen className="w-3 h-3" /> Aktiv Vazifalar
                        </h3>
                        <div className="space-y-3">
                          {myAssignments.filter(a => a.groupId?._id === activeGroup._id || a.groupId === activeGroup._id).map(a => (
                            <div key={a._id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{a.description}</p>
                                </div>
                                <span className="text-[10px] font-black bg-violet-50 text-violet-600 px-2 py-1 rounded-lg whitespace-nowrap shrink-0">
                                  {new Date(a.deadline).toLocaleDateString('uz-UZ')}
                                </span>
                              </div>
                            </div>
                          ))}
                          {myAssignments.filter(a => a.groupId?._id === activeGroup._id || a.groupId === activeGroup._id).length === 0 && (
                            <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                              <p className="text-xs font-medium">Hali vazifalar yo'q</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submissions */}
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Kelib tushgan yechimlar
                        </h3>
                        <div className="space-y-3">
                          {submissions.filter(s => s.assignmentId?.groupId === activeGroup._id || s.assignmentId?.groupId?._id === activeGroup._id).map(s => (
                            <div key={s._id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                              <div>
                                <span className="text-sm font-bold text-slate-700">{s.studentId?.name || 'Talaba'}</span>
                                <p className="text-[10px] text-slate-400 mt-0.5">{s.assignmentId?.title}</p>
                                {s.grade && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">Baho: {s.grade}</span>}
                              </div>
                              <button
                                onClick={() => startGrading(s)}
                                className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase ${s.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white hover:bg-violet-600'}`}
                              >
                                {s.status === 'approved' ? 'Baholangan' : 'Tekshirish'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB: MENING GURUHIM ─── */}
                {activeTab === 'guruhim' && (
                  <div className="flex-grow overflow-auto p-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1 h-4 bg-violet-600 rounded-full"></span>
                          Guruh Ma'lumotlari
                        </h2>
                        <button className="bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black px-6 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center gap-2 uppercase tracking-widest">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Dars Boshlash
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "O'quvchilar", value: activeGroup.students?.length || 0, color: 'bg-violet-50 text-violet-600' },
                          { label: 'Darslar soni', value: matrixData.length, color: 'bg-indigo-50 text-indigo-600' },
                          { label: "O'rtacha davomat", value: `${activeGroup.students?.length > 0 ? Math.round(activeGroup.students.reduce((acc, s) => acc + getStudentAttendancePercent(s._id), 0) / activeGroup.students.length) : 0}%`, color: 'bg-emerald-50 text-emerald-600' },
                          { label: 'Vazifalar', value: myAssignments.filter(a => a.groupId?._id === activeGroup._id || a.groupId === activeGroup._id).length, color: 'bg-amber-50 text-amber-600' },
                        ].map((item, i) => (
                          <div key={i} className={`rounded-2xl p-4 ${item.color}`}>
                            <div className="text-2xl font-black">{item.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Reyting jadvali</h3>
                      <div className="space-y-3">
                        {[...(activeGroup.students || [])]
                          .sort((a, b) => getStudentCoins(b._id) - getStudentCoins(a._id))
                          .map((student, idx) => {
                            const coins = getStudentCoins(student._id);
                            const pct = getStudentAttendancePercent(student._id);
                            return (
                              <div key={student._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <span className={`text-xs font-black w-6 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                                  {idx + 1}
                                </span>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center font-black text-violet-600 text-sm shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="text-sm font-bold text-slate-700 truncate">{student.name}</div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(coins, 100)}%` }}></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${pct >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{pct}%</span>
                                  <span className="text-xs font-black bg-violet-50 text-violet-600 px-2.5 py-1 rounded-lg">{coins} ball</span>
                                </div>
                              </div>
                            );
                          })}
                        {(!activeGroup.students || activeGroup.students.length === 0) && (
                          <div className="text-center py-10 text-slate-400">
                            <Users className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                            <p className="text-xs font-medium">Bu guruhda o'quvchilar yo'q</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB: O'QUVCHILAR ─── */}
                {activeTab === 'oquvchilar' && (
                  <div className="flex-grow overflow-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(activeGroup.students || []).map((student, idx) => {
                        const coins = getStudentCoins(student._id);
                        const pct = getStudentAttendancePercent(student._id);
                        return (
                          <motion.div
                            key={student._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-violet-200 transition-all"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center font-black text-violet-600 text-lg shrink-0">
                                {student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-slate-700 text-sm truncate">{student.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{student.phone || student.email || '—'}</div>
                              </div>
                              <span className="ml-auto text-[10px] font-black text-slate-300">#{idx + 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-50 rounded-xl p-3 text-center">
                                <div className={`text-lg font-black ${pct >= 80 ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Davomat</div>
                              </div>
                              <div className="bg-violet-50 rounded-xl p-3 text-center">
                                <div className="text-lg font-black text-violet-600">{coins}</div>
                                <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-0.5">Ball</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCellAction(student, new Date().toISOString().split('T')[0])}
                              className="w-full mt-3 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-violet-600 hover:text-white text-slate-400 rounded-xl transition-all border border-slate-100 hover:border-violet-600"
                            >
                              Ball qo'shish
                            </button>
                          </motion.div>
                        );
                      })}
                      {(!activeGroup.students || activeGroup.students.length === 0) && (
                        <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
                          <GraduationCap className="w-12 h-12 text-slate-200 mb-3" />
                          <p className="text-slate-400 font-bold">Bu guruhda hali o'quvchilar yo'q</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {/* ─── TAB: OTHER (fallback) ─── */}
                {activeTab !== 'davomat' && activeTab !== 'homework' && activeTab !== 'guruhim' && activeTab !== 'oquvchilar' && activeTab !== 'materiallar' && activeTab !== 'chat' && (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-20">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-lg font-black text-slate-600 uppercase tracking-widest">{activeTab}</h2>
                    <p className="text-slate-400 text-sm mt-1">Bu bo'lim tayyorlanmoqda</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-grow flex flex-col items-center justify-center text-center p-10"
              >
                <div className="w-24 h-24 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-xl font-black text-slate-500 uppercase tracking-widest">Guruh tanlanmagan</h2>
                <p className="text-slate-400 text-sm mt-2">Ish boshlash uchun chap paneldan guruhni tanlang</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 flex"
            >
              {/* 1. FAR-LEFT: GLOBAL ICON SIDEBAR (PDP Style) */}
              <aside className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-6 shrink-0 z-50 overflow-y-auto">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg mb-4">J</div>
                  <div className="flex-grow flex flex-col items-center gap-4">
                    {GLOBAL_NAV.map(item => {
                      const Icon = item.icon;
                      return (
                        <button 
                          key={item.id}
                          onClick={() => {
                            if (item.path) navigate(item.path);
                            else setActiveTab(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                          title={item.label}
                        >
                          <Icon size={20} strokeWidth={2.5} />
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={logout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                    <LogOut size={20} />
                  </button>
              </aside>

              {/* 2. MIDDLE: GROUP SELECTION SIDEBAR (PDP Style) */}
              <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guruhlarim</h2>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Active</span>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{myGroups.length}</span>
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-5 pt-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <input
                      type="text"
                      placeholder="Qidirish..."
                      value={sidebarSearch}
                      onChange={e => setSidebarSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                    />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto p-3 space-y-2">
                  {filteredGroups.map((group, idx) => {
                    const isSelected = activeGroup?._id === group._id;
                    return (
                      <motion.button
                        key={group._id}
                        onClick={() => { setActiveGroup(group); setActiveTab('guruhim'); setSidebarOpen(false); }}
                        className={`w-full p-4 rounded-2xl border transition-all text-left relative group ${
                          isSelected 
                            ? 'bg-white border-violet-200 shadow-lg shadow-violet-100/50' 
                            : 'bg-transparent border-transparent hover:bg-slate-50/50 hover:border-slate-100'
                        }`}
                      >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-black tracking-tight ${isSelected ? 'text-violet-600' : 'text-slate-800'}`}>{group.name}</span>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Active</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                            <GraduationCap size={12} />
                            {group.students?.length || 0} o'quvchi
                          </div>
                      </motion.button>
                    );
                  })}
                </div>
              </aside>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scoring Modal */}
      {scoringStudent && (
        <ScoringModal student={scoringStudent} onClose={() => setScoringStudent(null)} onSave={handleSaveScoring} />
      )}

      {/* Grading Modal */}
      {gradSub && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setGradSub(null)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-black text-slate-800 mb-1">Vazifani Baholash</h2>
            <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest">{gradSub.studentId?.name} · {gradSub.assignmentId?.title}</p>
            <form onSubmit={submitGrade} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Baho (0–100)</label>
                <input type="number" value={gradeInput} onChange={e => setGradeInput(e.target.value)} required min="0" max="100" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-black text-violet-600 text-lg focus:ring-2 focus:ring-violet-400 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Feedback</label>
                <textarea value={fdbInput} onChange={e => setFdbInput(e.target.value)} rows="3" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-medium text-slate-700 outline-none resize-none" />
              </div>
              <button type="submit" disabled={gradeLoading} className="w-full bg-slate-900 hover:bg-violet-600 text-white font-black py-3.5 rounded-xl shadow-lg transition-all">
                {gradeLoading ? 'Saqlanmoqda...' : 'Tasdiqlash'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
