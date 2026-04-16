import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAssignments } from '../services/assignmentApi';
import { submitAssignment, getStudentSubmissions } from '../services/submissionApi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submitting modal states
  const [activeTask, setActiveTask] = useState(null);
  const [solutionLink, setSolutionLink] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
       try {
         const [assignsData, submsData] = await Promise.all([
            getAssignments(user.groupId),
            getStudentSubmissions(user._id)
         ]);
         
         setAssignments(assignsData);
         setSubmissions(submsData);
       } catch (err) {
         console.error('Failed to fetch data', err);
       } finally {
         setLoading(false);
       }
    };
    if (user?._id) fetchData();
  }, [user]);

  const isOverdue = (dateString) => new Date(dateString) < new Date();

  const handleOpenModal = (task) => {
    setActiveTask(task);
  };

  const handleCloseModal = () => {
    setActiveTask(null);
    setSolutionLink('');
    setNotes('');
    setAttachedFile(null);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('assignmentId', activeTask._id);
      submitData.append('studentId', user._id);
      submitData.append('solutionLink', solutionLink);
      submitData.append('notes', notes);
      
      if (attachedFile) {
        submitData.append('file', attachedFile);
      }

      const newSub = await submitAssignment(submitData);
      alert('Javobingiz muvaffaqiyatli jo\'natildi!');
      
      // Mahalliy stateni yangilaymiz yuborilgandan keyin srazi ko'rinishi uchun
      setSubmissions([newSub, ...submissions]);
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary to-indigo-800 rounded-3xl p-8 mb-10 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Qaytganingiz bilan, {user?.name}! 👋</h1>
          <p className="text-indigo-100 max-w-lg mb-6">
            Sizda bajarilishi kutilayotgan muhim vazifalar (deadlines) bor. Ularni o'z vaqtida topshirishni unutmang.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl font-bold text-slate-800">Barcha Vazifalar</h2>
         <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-4 py-1 rounded-full">Jami: {assignments.length} ta</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">Yuklanmoqda...</div>
      ) : assignments.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hozircha hech qanday vazifa yuklanmagan.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {assignments.map((task) => {
            const overdue = isOverdue(task.deadline);
            // Ushbu vazifa bo'yicha talabaning javobi bormi tekshiramiz
            const mySub = submissions.find(s => 
               (s.assignmentId?._id === task._id) || (s.assignmentId === task._id)
            );

            return (
              <div key={task._id} className={`p-6 rounded-2xl border shadow-sm flex flex-col hover:shadow-lg transition duration-300 ${mySub ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                     {task.teacherId?.name || "O'qituvchi"}
                   </div>
                   
                   {/* Status Badge */}
                   {mySub ? (
                     <div className={`text-xs font-bold px-3 py-1 rounded border 
                        ${mySub.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 
                          mySub.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 
                          'bg-orange-50 text-orange-600 border-orange-200'}`}
                     >
                        {mySub.status === 'approved' ? 'A\'lo (Qabul)' : 
                         mySub.status === 'rejected' ? 'Rad etildi' : 
                         'Tekshirilmoqda'}
                     </div>
                   ) : (
                     <div className={`text-xs font-bold px-3 py-1 rounded border ${overdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                       {overdue ? 'Muddati o\'tgan' : 'Bajarilmagan'}
                     </div>
                   )}
                </div>
                
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">{task.title}</h3>
                <p className="text-slate-500 text-sm flex-grow mb-4 line-clamp-4">{task.description}</p>
                
                {/* Baholash Natijasi (Agar o'qituvchi baholagan bo'lsa) */}
                {mySub && (mySub.grade !== null || mySub.feedback) && (
                   <div className="bg-white rounded-xl p-3 border border-indigo-100 mb-4 shadow-sm">
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">O'qituvchi xulosasi</p>
                      {mySub.grade !== null && (
                         <div className="text-lg font-extrabold text-slate-800 mb-1">
                            Baho: <span className={mySub.grade >= 70 ? 'text-green-600' : mySub.grade >= 50 ? 'text-orange-500' : 'text-red-500'}>{mySub.grade}</span> / 100
                         </div>
                      )}
                      {mySub.feedback && (
                         <p className="text-sm text-slate-600 italic">"{mySub.feedback}"</p>
                      )}
                   </div>
                )}

                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                   <div>
                     <p className="text-xs text-slate-400 font-semibold mb-1">Dedlayn</p>
                     <p className={`font-bold text-sm ${overdue && !mySub ? 'text-red-500' : 'text-slate-800'}`}>
                        ⏳ {new Date(task.deadline).toLocaleString()}
                     </p>
                   </div>
                   
                   {/* Yuborilgan bo'lsa tugmani o'chiramiz */}
                   {mySub ? (
                      <span className="text-sm font-bold py-2 px-4 rounded-lg bg-green-500 text-white flex items-center gap-1 cursor-default">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                         Yuborilgan
                      </span>
                   ) : (
                      <button 
                        onClick={() => handleOpenModal(task)}
                        disabled={overdue}
                        className={`text-sm font-bold py-2 px-4 rounded-lg transition-colors
                          ${overdue ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}
                        `}
                      >
                        {overdue ? 'Yopilgan' : 'Bajarish'}
                      </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {activeTask && (
        // ... (Modal remains same)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative overflow-y-auto max-h-[90vh]">
             <button onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
             
             <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Vazifani jo'natish</h2>
             <p className="text-sm font-bold text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded">{activeTask.title}</p>
             
             <form onSubmit={handleSubmitTask} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Qo'shimcha Fayl (Ixtiyoriy yuklash)</label>
                  <input 
                    type="file"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl cursor-pointer"
                    onChange={(e) => setAttachedFile(e.target.files[0])}
                  />
                </div>
                
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Javob Linki (Shart emas bo'lsa xat yozing)</label>
                  <input 
                    type="text" 
                    placeholder="https://github.com/profile... yoki oddiy matn"
                    className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={solutionLink}
                    onChange={(e) => setSolutionLink(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Qisqacha Izoh (Ustoz uchun)</label>
                  <textarea 
                    rows="3"
                    placeholder="Vazifa bo'yicha qisqacha xabaringiz yoki sharhingiz..."
                    className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition disabled:opacity-50 mt-4"
                >
                  {submitLoading ? 'Jo\'natilmoqda...' : 'Topshirish (Submit)'}
                </button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}
