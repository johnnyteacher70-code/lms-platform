import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getAssignments } from '../services/assignmentApi';
import { submitAssignment, getStudentSubmissions } from '../services/submissionApi';
import {
  CheckCircle2, Clock, AlertCircle, Send, X,
  FileText, Link as LinkIcon, MessageSquare, User,
  BookOpen, Sparkles
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [solutionLink, setSolutionLink] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, done

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignsData, submsData] = await Promise.all([
          getAssignments(user.groupId),
          getStudentSubmissions(user._id)
        ]);
        setAssignments(Array.isArray(assignsData) ? assignsData : []);
        setSubmissions(Array.isArray(submsData) ? submsData : []);
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
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 mb-8 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.3),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.2),transparent_60%)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 mb-4">
              <Sparkles className="w-3 h-3 text-violet-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">Talaba Paneli</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight">
              Salom, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">{user?.name}! 👋</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">Bugun ham o'rganishda davom eting.</p>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap gap-3 md:gap-4 shrink-0">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-center flex-1 min-w-[80px]">
              <div className="text-xl md:text-2xl font-black text-emerald-400">{done}</div>
              <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Topshirildi</div>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-center flex-1 min-w-[80px]">
              <div className="text-xl md:text-2xl font-black text-amber-400">{pending}</div>
              <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Kutilmoqda</div>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-center flex-1 min-w-[80px]">
              <div className="text-xl md:text-2xl font-black text-violet-300">{assignments.length}</div>
              <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Jami</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-black text-slate-800">Vazifalar</h2>
        <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm overflow-x-auto custom-scrollbar no-scrollbar">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'pending', label: 'Bajarilmagan' },
            { id: 'done', label: 'Topshirilgan' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-600">Vazifalar yo'q</h3>
          <p className="text-sm text-slate-400 mt-1">Bu bo'limda hozircha ko'rsatadigan narsa yo'q.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filteredAssignments.map((task) => {
            const overdue = isOverdue(task.deadline);
            const mySub = getMySub(task._id);
            return (
              <motion.div
                key={task._id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className={`bg-white rounded-3xl border p-6 flex flex-col transition-all duration-200 group ${
                  mySub ? 'border-slate-100' : 'border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    <User className="w-3 h-3 text-slate-400" strokeWidth={2.5} />
                    <span className="text-[10px] font-black text-slate-500">{task.teacherId?.name || "O'qituvchi"}</span>
                  </div>
                  {mySub ? (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                      mySub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      mySub.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {mySub.status === 'approved' ? '✓ Qabul qilindi' : mySub.status === 'rejected' ? '✗ Rad etildi' : '⏳ Kutilmoqda'}
                    </span>
                  ) : (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${overdue ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                      {overdue ? 'Yopilgan' : 'Bajarish kerak'}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-800 mb-2 leading-tight group-hover:text-violet-700 transition-colors">{task.title}</h3>
                <p className="text-xs text-slate-500 flex-grow mb-4 line-clamp-3 leading-relaxed">{task.description}</p>

                {/* Grade/Feedback */}
                {mySub && (mySub.grade !== null || mySub.feedback) && (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Baholash</p>
                    {mySub.grade !== null && <div className="text-xl font-black text-slate-800">{mySub.grade} <span className="text-slate-300 text-sm font-bold">/ 100</span></div>}
                    {mySub.feedback && <p className="text-xs text-emerald-700 italic mt-1">"{mySub.feedback}"</p>}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-0.5">Muddat</span>
                    <span className={`text-xs font-bold ${overdue && !mySub ? 'text-rose-500' : 'text-slate-600'}`}>
                      {new Date(task.deadline).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  {mySub ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      Topshirilgan
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOpenModal(task)}
                      disabled={overdue}
                      className={`px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all ${
                        overdue ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700'
                      }`}
                    >
                      {overdue ? 'Yopilgan' : 'Topshirish'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

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
    </div>
  );
}
