import { useState, useEffect } from 'react';
import { X, Clock, Send, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { submitQuiz } from '../../services/quizApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TakeQuizModal({ quiz, onClose, onRefresh }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionId, selectedOption }]
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (questionId, optionIndex) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === questionId);
    if (existingIndex > -1) {
      newAnswers[existingIndex].selectedOption = optionIndex;
    } else {
      newAnswers.push({ questionId, selectedOption: optionIndex });
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);
    try {
      const data = await submitQuiz({ quizId: quiz._id, answers });
      setResult(data);
      toast.success("Test yakunlandi!");
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedOption = answers.find(a => a.questionId === currentQuestion._id)?.selectedOption;

  if (result) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-2">Tabriklaymiz!</h2>
           <p className="text-slate-400 font-medium mb-8">Siz testni muvaffaqiyatli yakunladingiz.</p>
           
           <div className="bg-slate-50 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sizning Ballingiz</div>
                 <div className="text-2xl font-black text-violet-600">{result.score}</div>
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Umumiy Ball</div>
                 <div className="text-2xl font-black text-slate-800">{result.totalPoints}</div>
              </div>
           </div>

           <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Yopish</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-none mb-1">{formatTime(timeLeft)}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qolgan vaqt</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-xs font-black text-slate-800">{currentQuestionIndex + 1} / {quiz.questions.length}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savol</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
               <X size={20} className="text-slate-400" />
             </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-10 overflow-y-auto">
           <div className="mb-10">
              <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-lg uppercase tracking-widest mb-4 inline-block">
                Savol - {currentQuestionIndex + 1}
              </span>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">{currentQuestion.questionText}</h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQuestion._id, idx)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    selectedOption === idx 
                      ? 'border-violet-600 bg-violet-50/50 shadow-lg shadow-violet-100' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                    selectedOption === idx ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-sm font-bold ${selectedOption === idx ? 'text-slate-800' : 'text-slate-500'}`}>{opt}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <button 
             disabled={currentQuestionIndex === 0}
             onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
             className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 disabled:opacity-0 transition-all"
           >
              <ChevronLeft size={16} /> Oldingisi
           </button>

           {currentQuestionIndex === quiz.questions.length - 1 ? (
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center gap-2"
             >
                {isSubmitting ? "Yuborilmoqda..." : <><Send size={16} /> Testni Yakunlash</>}
             </button>
           ) : (
             <button 
               onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
               className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center gap-2"
             >
                Keyingisi <ChevronRight size={16} />
             </button>
           )}
        </div>
      </motion.div>
    </div>
  );
}
