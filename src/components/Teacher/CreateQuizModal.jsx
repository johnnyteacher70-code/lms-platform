import { useState } from 'react';
import { X, Plus, Trash2, Save, Clock, HelpCircle } from 'lucide-react';
import { createQuiz } from '../../services/quizApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateQuizModal({ groupId, onClose, onRefresh }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 5 }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 5 }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return toast.error("Kamida bitta savol qo'shing");
    
    setLoading(true);
    try {
      await createQuiz({ title, description, groupId, questions, duration, deadline });
      toast.success("Test yaratildi!");
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Yangi Test Yaratish</h2>
            <p className="text-xs text-slate-400 font-medium">O'quvchilar uchun interaktiv imtihon tizimi</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Test Sarlavhasi</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Masalan: JavaScript Basic Quiz" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tavsif</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Test haqida qisqacha..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 h-24 resize-none" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Davomiyligi (minut)</label>
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="number" required value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Topshirish muddati (Deadline)</label>
                <input type="datetime-local" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <HelpCircle size={18} className="text-violet-600" /> Savollar ({questions.length})
              </h3>
              <button type="button" onClick={addQuestion} className="flex items-center gap-2 text-violet-600 font-black text-[10px] uppercase tracking-widest hover:bg-violet-50 px-4 py-2 rounded-xl transition-all">
                <Plus size={16} /> Savol qo'shish
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <motion.div 
                key={qIndex} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group"
              >
                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Savol - {qIndex + 1}</label>
                    <input required value={q.questionText} onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)} placeholder="Savolni yozing..." className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`} 
                          checked={q.correctAnswer === oIndex} 
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          className="w-4 h-4 text-violet-600 accent-violet-600"
                        />
                        <input required value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} placeholder={`${oIndex+1}-variant`} className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-violet-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Bekor qilish</button>
          <button onClick={handleSubmit} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 disabled:opacity-50 flex items-center gap-2">
            {loading ? "Saqlanmoqda..." : <><Save size={16} /> Testni Saqlash</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
