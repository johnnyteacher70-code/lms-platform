import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAssignments } from '../services/assignmentApi';
import { submitAssignment, getStudentSubmissions } from '../services/submissionApi';
import { getGroupStats } from '../services/groupApi';
import { getAttendanceMatrix } from '../services/attendanceApi';
import {
  CheckCircle2, Clock, AlertCircle, Send, X,
  FileText, Link as LinkIcon, MessageSquare, User,
  BookOpen, Sparkles, Trophy, Calendar, Medal, ChevronRight, GraduationCap, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getGroupQuizzes, getMyQuizResults } from '../services/quizApi';
import TakeQuizModal from '../components/Student/TakeQuizModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [groupStats, setGroupStats] = useState(null);
  const [attendanceMatrix, setAttendanceMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [solutionLink, setSolutionLink] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, done
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignsData, submsData, statsData, matrixData, quizzesData, resultsData] = await Promise.all([
          getAssignments(user.groupId),
          getStudentSubmissions(user._id),
          user.groupId ? getGroupStats(user.groupId) : Promise.resolve({ data: null }),
          user.groupId ? getAttendanceMatrix(user.groupId) : Promise.resolve([]),
          user.groupId ? getGroupQuizzes(user.groupId) : Promise.resolve([]),
          getMyQuizResults()
        ]);
        setAssignments(Array.isArray(assignsData) ? assignsData : []);
        setSubmissions(Array.isArray(submsData) ? submsData : []);
        setGroupStats(statsData?.data || statsData);
        setAttendanceMatrix(matrixData || []);
        setQuizzes(quizzesData || []);
        setQuizResults(resultsData || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setAssignments([]); setSubmissions([]);
      } finally { setLoading(false); }
    };
    if (user?._id) fetchData();
  }, [user]);

  const isOverdue = (d) => new Date(d) < new Date();

  const handleOpenModal = (task) => { setActiveTask(task); setSolutionLink(''); setNotes(''); setAttachedFile(null); };
  const handleCloseModal = () => { setActiveTask(null); setSolutionLink(''); setNotes(''); setAttachedFile(null); };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      fd.append('assignmentId', activeTask._id);
      fd.append('studentId', user._id);
      fd.append('solutionLink', solutionLink);
      fd.append('notes', notes);
      if (attachedFile) fd.append('file', attachedFile);
      const newSub = await submitAssignment(fd);
      setSubmissions(prev => [newSub, ...prev]);
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi!');
    } finally { setSubmitLoading(false); }
  };

  const getMySub = (taskId) => submissions.find(s => s.assignmentId?._id === taskId || s.assignmentId === taskId);

  const myRank = groupStats?.leaderboard?.findIndex(s => s._id === user._id) + 1 || '—';
  const myPoints = groupStats?.leaderboard?.find(s => s._id === user._id)?.totalPoints || 0;
  const myAttendancePcnt = groupStats?.leaderboard?.find(s => s._id === user._id)?.attendancePcnt || 0;

  const filteredAssignments = assignments.filter(task => {
    if (activeFilter === 'all') return true;
    const mySub = getMySub(task._id);
    if (activeFilter === 'done') return !!mySub;
    if (activeFilter === 'pending') return !mySub;
    return true;
  });

  const done = submissions.length;
  const pending = assignments.filter(a => !getMySub(a._id)).length;

  return (
    <div className="w-full pb-10">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-[2rem] p-8 mb-8 text-white overflow-hidden shadow-2xl shadow-indigo-100"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.3),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.2),transparent_60%)]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 mb-4 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-violet-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">O'quvchi Markazi</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              Salom, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">{user?.name}! 👋</span>
            </h1>
            <p className="text-slate-400 text-base mt-2 font-medium max-w-md">Sizning bugungi natijalaringiz va o'quv jarayoningiz haqida qisqacha ma'lumot.</p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap lg:flex-nowrap gap-4 shrink-0">
            {[
              { label: 'O\'rin', value: `#${myRank}`, icon: Trophy, color: 'text-amber-400' },
              { label: 'Ballar', value: myPoints, icon: Medal, color: 'text-violet-300' },
              { label: 'Davomat', value: `${myAttendancePcnt}%`, icon: Calendar, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px] group hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Progress Chart */}
      {submissions.some(s => s.grade !== null) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800">O'zlashtirish Dinamikasi</h2>
              <p className="text-xs text-slate-400 font-medium">Oxirgi topshirilgan vazifalar bo'yicha ballaringiz</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles size={20} />
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={submissions.filter(s => s.grade !== null).reverse().map(s => ({
                  name: s.assignmentId?.title?.substring(0, 10) + '...',
                  ball: s.grade
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ball" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBall)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ASSIGNMENTS (2/3) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Topshirildi', value: done, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Kutilmoqda', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
              { label: 'Barchasi', value: assignments.length, icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
              { label: 'Guruh', value: user.groupName || 'Active', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-2xl ${stat.color} flex flex-col justify-between h-24`}>
                <stat.icon className="w-5 h-5 opacity-60" />
                <div>
                  <div className="text-xl font-black">{stat.value}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-70">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Assignments Header */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-violet-600 rounded-full"></span>
                Vazifalar
              </h2>
              <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                {['all', 'pending', 'done'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeFilter === f ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'pending' ? 'Kutilmoqda' : 'Bajarilgan'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />)}
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-600">Vazifalar topilmadi</h3>
                <p className="text-sm text-slate-400 mt-1">Siz barcha vazifalarni topshirib bo'lgansiz!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredAssignments.map((task) => {
                  const overdue = isOverdue(task.deadline);
                  const mySub = getMySub(task._id);
                  return (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-3xl border p-6 flex flex-col transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/50 ${
                        mySub ? 'border-slate-100' : 'border-slate-100 hover:border-violet-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500">{task.teacherId?.name || "O'qituvchi"}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                          mySub?.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          mySub?.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          mySub ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          overdue ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                        }`}>
                          {mySub?.status === 'approved' ? '✓ Qabul qilindi' : mySub?.status === 'rejected' ? '✗ Rad etildi' : mySub ? '⏳ Kutilmoqda' : overdue ? 'Yopilgan' : 'Aktiv'}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-800 mb-2 leading-tight group-hover:text-violet-700 transition-colors">{task.title}</h3>
                      <p className="text-xs text-slate-400 flex-grow mb-4 line-clamp-2 leading-relaxed">{task.description}</p>

                      {mySub && (mySub.grade !== null || mySub.feedback) && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Natija</span>
                            {mySub.grade !== null && <span className="text-sm font-black text-emerald-600">{mySub.grade} ball</span>}
                          </div>
                          {mySub.feedback && <p className="text-[11px] text-slate-500 italic">"{mySub.feedback}"</p>}
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-0.5">Muddat</span>
                          <span className={`text-xs font-bold ${overdue && !mySub ? 'text-rose-500' : 'text-slate-600'}`}>
                            {new Date(task.deadline).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                        {mySub ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> Bajarildi
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(task)}
                            disabled={overdue}
                            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                              overdue ? 'bg-slate-100 text-slate-400' : 'bg-violet-600 text-white shadow-lg shadow-violet-100 hover:bg-violet-700 active:scale-95'
                            }`}
                          >
                            {overdue ? 'Yopilgan' : 'Topshirish'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quizzes Section */}
          <div>
             <div className="flex items-center justify-between mb-6 mt-12">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  Testlar
                </h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {quizzes.map((quiz) => {
                  const result = quizResults.find(r => r.quizId?._id === quiz._id || r.quizId === quiz._id);
                  const isClosed = new Date(quiz.deadline) < new Date();
                  
                  return (
                    <motion.div 
                      key={quiz._id}
                      className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                       <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                             <HelpCircle size={20} />
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                            result ? 'bg-emerald-50 text-emerald-600' : isClosed ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {result ? '✓ Yakunlangan' : isClosed ? 'Yopilgan' : '⏳ Kutilmoqda'}
                          </span>
                       </div>
                       
                       <h3 className="text-base font-black text-slate-800 mb-1 leading-tight">{quiz.title}</h3>
                       <p className="text-[10px] font-bold text-slate-400 mb-4">{quiz.questions?.length} ta savol · {quiz.duration} minut</p>
                       
                       {result ? (
                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Natija</span>
                               <span className="text-sm font-black text-indigo-600">{result.score} / {result.totalPoints} ball</span>
                            </div>
                         </div>
                       ) : (
                         <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{quiz.description}</p>
                       )}

                       <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                             Muddat: {new Date(quiz.deadline).toLocaleDateString('uz-UZ')}
                          </div>
                          {!result && !isClosed && (
                            <button 
                              onClick={() => setActiveQuiz(quiz)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
                            >
                               Boshlash
                            </button>
                          )}
                       </div>
                    </motion.div>
                  );
                })}
                {quizzes.length === 0 && (
                   <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <HelpCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-400">Hozircha testlar yo'q</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ATTENDANCE & LEADERBOARD (1/3) */}
        <div className="space-y-8">
          
          {/* Attendance Calendar Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Davomat</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map(d => (
                  <div key={d} className="text-[10px] font-black text-slate-300 text-center">{d}</div>
                ))}
                {/* Visual Placeholder for a small calendar/grid */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (27 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const record = attendanceMatrix.find(d => d.date === dateStr)?.records?.find(r => r.studentId === user._id);
                  const isPresent = record?.status === 'present';
                  const isAbsent = record?.status === 'absent';
                  
                  return (
                    <div 
                      key={i} 
                      title={dateStr}
                      className={`aspect-square rounded-md border transition-all ${
                        isPresent ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-100' : 
                        isAbsent ? 'bg-rose-500 border-rose-500' : 
                        'bg-slate-50 border-slate-100'
                      }`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-slate-400">Kelgan</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> <span className="text-slate-400">Kelmagan</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-100"></div> <span className="text-slate-400">Bo'sh</span></div>
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" /> Guruh Reytingi
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase">Top 5</span>
             </div>
             <div className="p-4 space-y-2">
                {groupStats?.leaderboard?.slice(0, 5).map((student, i) => {
                  const isMe = student._id === user._id;
                  return (
                    <div key={student._id} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isMe ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'hover:bg-slate-50'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${isMe ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className={`text-xs font-black truncate ${isMe ? 'text-white' : 'text-slate-700'}`}>{student.name}</div>
                        <div className={`text-[10px] font-bold ${isMe ? 'text-violet-200' : 'text-slate-400'}`}>{student.totalPoints} ball</div>
                      </div>
                      {isMe && <Sparkles size={14} className="text-amber-300" />}
                    </div>
                  );
                })}
                
                {/* If me not in top 5 */}
                {myRank > 5 && (
                  <>
                    <div className="flex justify-center py-1">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                        {myRank}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-xs font-black truncate">{user.name}</div>
                        <div className="text-[10px] font-bold text-violet-200">{myPoints} ball</div>
                      </div>
                      <Sparkles size={14} className="text-amber-300" />
                    </div>
                  </>
                )}
             </div>
             <div className="p-4 pt-0">
               <button onClick={() => navigate('/student-dashboard/group')} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 To'liq ro'yxat <ChevronRight size={14} />
               </button>
             </div>
          </div>

        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10 overflow-y-auto max-h-[90vh]"
            >
              <button onClick={handleCloseModal} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                  <Send className="w-5 h-5 text-violet-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">Vazifani topshirish</h2>
                <span className="text-xs font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">{activeTask.title}</span>
              </div>
              <form onSubmit={handleSubmitTask} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Fayl biriktirish</label>
                  <input type="file" className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-violet-600 file:text-white hover:file:bg-violet-700 bg-slate-50 border border-slate-100 rounded-2xl p-2 cursor-pointer" onChange={e => setAttachedFile(e.target.files[0])} />
                  <p className="text-[10px] text-slate-400 mt-1">PDF, ZIP yoki rasm formatida</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> Javob linki</label>
                  <input type="text" placeholder="https://github.com/..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 transition-all font-medium" value={solutionLink} onChange={e => setSolutionLink(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Izoh</label>
                  <textarea rows="3" placeholder="Qisqacha xabaringiz..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 transition-all font-medium resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={submitLoading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitLoading ? 'Yuborilmoqda...' : 'Topshirish'}
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Take Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <TakeQuizModal 
            quiz={activeQuiz} 
            onClose={() => setActiveQuiz(null)}
            onRefresh={() => {
              // Refresh results
              getMyQuizResults().then(setQuizResults);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
