import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTeacherGroups } from '../services/groupApi';
import { getAssignments, createAssignment } from '../services/assignmentApi';
import { getTeacherSubmissions, updateSubmissionStatus } from '../services/submissionApi';
import { saveAttendance, getAttendance } from '../services/attendanceApi';

export default function TeacherDashboard() {
  const { user } = useAuth();
  
  // Core Data State
  const [myGroups, setMyGroups] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Tab Navigation uses location now
  const location = useLocation();
  const activeTab = location.pathname.includes('/groups') ? 'groups' : 'tasks';

  // Task Creation Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedGroupIdForTask, setSelectedGroupIdForTask] = useState('');
  const [loading, setLoading] = useState(false);

  // Grading Modal State
  const [activeGradingSub, setActiveGradingSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [statusInput, setStatusInput] = useState('approved');
  const [gradeLoading, setGradeLoading] = useState(false);

  // Attendance & Group View State
  const [activeGroup, setActiveGroup] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attLoading, setAttLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsData = await getTeacherGroups(user._id);
        setMyGroups(groupsData);

        const assignsData = await getAssignments();
        // Backend orqali ham ishlashi mumkin o'qituvchining o'z vazifalari filteri
        setMyAssignments(assignsData.filter(a => a.teacherId?._id === user._id || a.teacherId === user._id));

        const submsData = await getTeacherSubmissions(user._id);
        setSubmissions(submsData);
      } catch (err) {
        console.error("Ma'lumotlarni tortishda xatolik", err);
      }
    };
    if (user?._id) fetchData();
  }, [user]);
  
  // ----------- TASKS & GRADING LOGIC -----------
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newAssign = await createAssignment({
        title,
        description,
        deadline,
        teacherId: user._id,
        groupId: selectedGroupIdForTask
      });
      setMyAssignments([...myAssignments, newAssign]);
      setTitle('');
      setDescription('');
      setDeadline('');
      setSelectedGroupIdForTask('');
      setShowCreateForm(false);
      alert("Vazifa muvaffaqiyatli saqlandi!");
    } catch (err) {
       alert("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (sub) => {
    setActiveGradingSub(sub);
    setGradeInput(sub.grade || '');
    setFeedbackInput(sub.feedback || '');
    setStatusInput(sub.status !== 'pending' ? sub.status : 'approved');
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    setGradeLoading(true);
    try {
      const payload = { 
         status: statusInput, 
         grade: gradeInput !== '' ? Number(gradeInput) : null, 
         feedback: feedbackInput 
      };
      await updateSubmissionStatus(activeGradingSub._id, payload);
      setSubmissions(submissions.map(s => s._id === activeGradingSub._id ? { ...s, ...payload } : s));
      setActiveGradingSub(null);
    } catch (err) {
      alert("Baholashda xatolik yuz berdi");
    } finally {
      setGradeLoading(false);
    }
  };


  // ----------- ATTENDANCE LOGIC -----------
  useEffect(() => {
     if (activeGroup) {
         fetchGroupAttendance(activeGroup._id, attendanceDate);
     }
  }, [activeGroup, attendanceDate]);

  const fetchGroupAttendance = async (groupId, date) => {
      try {
         const attData = await getAttendance(groupId, date);
         const initialRecords = {};
         
         // Agar bazada bu kun uchun ma'lumot bo'lsa uni yuklaymiz
         if (attData && attData.records && attData.records.length > 0) {
            attData.records.forEach(r => initialRecords[r.studentId] = r.status);
         } else {
            // Agar bo'lmasa, hammada keldi (present) ni by default qilib ko'rsatamiz
            activeGroup.students.forEach(s => initialRecords[s._id] = 'present');
         }
         
         setAttendanceRecords(initialRecords);
      } catch (err) {
         console.error(err);
      }
  };

  const handleAttChange = (studentId, status) => {
      setAttendanceRecords(prev => ({
         ...prev,
         [studentId]: status
      }));
  };

  const handleSaveAttendance = async () => {
      setAttLoading(true);
      try {
         const formattedRecords = Object.keys(attendanceRecords).map(sId => ({
             studentId: sId,
             status: attendanceRecords[sId]
         }));
         
         await saveAttendance({
            groupId: activeGroup._id,
            teacherId: user._id,
            date: attendanceDate,
            records: formattedRecords
         });
         alert("Davomat muvaffaqiyatli saqlandi!");
      } catch(err) {
         alert("Davomatni saqlashda uzilish yuz berdi");
      } finally {
         setAttLoading(false);
      }
  };


  return (
    <div className="w-full h-full pb-10 relative">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">O'qituvchi Paneli</h1>
          <p className="text-slate-500 mt-1">Xush kelibsiz, ustoz {user?.name}.</p>
        </div>
      </div>

  // We now determine tab from URL so Sidebar fully acts as navigation
  // location is defined above, we don't need activeTab state.

      {/* Header Info */}
      {/* Tablarni o'chiramiz chunki Sidebar boshqaradi */}

      {/* ======================= TAB 1: GROUPS & ATTENDANCE ======================= */}
      {activeTab === 'groups' && (
         <div className="space-y-6">
            {!activeGroup ? (
               // Guruhlar ro'yxati
               <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                     Sizning guruhlaringiz ({myGroups.length} ta)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {myGroups.map(g => (
                        <div key={g._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center hover:border-indigo-300 transition cursor-pointer" onClick={() => setActiveGroup(g)}>
                           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black mb-4">
                              {g.name.split('-')[0]}
                           </div>
                           <h3 className="text-xl font-bold text-slate-800 mb-1">{g.name}</h3>
                           <p className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-4">
                              O'quvchilar: {g.students?.length} ta
                           </p>
                           <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-sm transition">
                              Ichiga Kirish (Davomat) →
                           </button>
                        </div>
                     ))}
                     {myGroups.length === 0 && (
                        <p className="col-span-full text-slate-500 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center">
                           Hozircha sizga hech qanday guruh biriktirilmagan.
                        </p>
                     )}
                  </div>
               </div>
            ) : (
               // Tanlangan Guruh ichi (Davomat doskasi)
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-4 gap-4">
                     <div>
                        <button onClick={() => setActiveGroup(null)} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline mb-2">
                           ← Guruhlar ro'yxatiga qaytish
                        </button>
                        <h2 className="text-2xl font-extrabold text-slate-800">{activeGroup.name} - O'quvchilari</h2>
                        <p className="text-slate-500 text-sm">{activeGroup.students?.length} ta o'quvchi ro'yxatdan o'tgan</p>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <input 
                           type="date" 
                           className="border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none font-bold text-slate-600 bg-slate-50 border border-slate-300"
                           value={attendanceDate}
                           onChange={(e) => setAttendanceDate(e.target.value)}
                           max={new Date().toISOString().split('T')[0]} // Bugundan uzoqqa yozolmaydi
                        />
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                              <th className="p-4 font-semibold rounded-l-lg">Talaba Ismi</th>
                              <th className="p-4 font-semibold text-center rounded-r-lg">Davomat (Keldi/Kelmadi)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {activeGroup.students?.map((student, idx) => (
                              <tr key={student._id} className="hover:bg-slate-50 transition">
                                 <td className="p-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-800 flex justify-center items-center font-bold text-xs">
                                          {idx + 1}
                                       </div>
                                       <div>
                                          <div className="font-bold text-slate-800">{student.name}</div>
                                          <div className="text-xs text-slate-500">{student.email}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-4 text-center">
                                    <div className="inline-flex rounded-xl bg-slate-100 p-1">
                                       <button 
                                          onClick={() => handleAttChange(student._id, 'present')}
                                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${attendanceRecords[student._id] === 'present' ? 'bg-white shadow text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
                                       >
                                          Keldi
                                       </button>
                                       <button 
                                          onClick={() => handleAttChange(student._id, 'absent')}
                                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${attendanceRecords[student._id] === 'absent' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
                                       >
                                          Kelmadi
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {(!activeGroup.students || activeGroup.students.length === 0) && (
                              <tr>
                                 <td colSpan="2" className="p-8 text-center text-slate-500">Bu guruhda hali talabalar yo'q.</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  {activeGroup.students && activeGroup.students.length > 0 && (
                     <div className="mt-8 flex justify-end">
                        <button 
                           onClick={handleSaveAttendance}
                           disabled={attLoading}
                           className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition disabled:opacity-50"
                        >
                           {attLoading ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}
                        </button>
                     </div>
                  )}
               </div>
            )}
         </div>
      )}


      {/* ======================= TAB 2: TASKS & SUBMISSIONS ======================= */}
      {activeTab === 'tasks' && (
         <div className="space-y-8">
            <div className="flex justify-end">
               <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
               >
                  {showCreateForm ? 'Bekor qilish' : '+ Yangi Vazifa Yaratish'}
               </button>
            </div>

            {/* Create Task Form */}
            {showCreateForm && (
               <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 md:p-8 overflow-hidden relative transition-all">
               <h2 className="text-xl font-bold text-indigo-900 mb-6">Yangi Vazifa (Assignment) Yaratish</h2>
               <form onSubmit={handleCreateAssignment} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-slate-700 text-sm font-semibold mb-2">Qaysi guruhga yuboramiz?</label>
                        <select 
                           required 
                           className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none bg-white font-bold text-slate-700 text-sm"
                           value={selectedGroupIdForTask}
                           onChange={(e) => setSelectedGroupIdForTask(e.target.value)}
                        >
                           <option value="" disabled>-- Guruhni tanlang --</option>
                           {myGroups.map(g => (
                              <option key={g._id} value={g._id}>{g.name}</option>
                           ))}
                        </select>
                        {myGroups.length === 0 && <p className="text-xs text-red-500 mt-1">Sizga hali guruh biriktirilmagan!</p>}
                     </div>
                     <div>
                        <label className="block text-slate-700 text-sm font-semibold mb-2">Vazifa Mavzusi (Sarlavha)</label>
                        <input 
                        type="text" required
                        placeholder="Masalan: Web Design bo'yicha 1-amaliyot"
                        className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-slate-700 text-sm font-semibold mb-2">Topshirish muddati (Deadline)</label>
                        <input 
                        type="datetime-local" required
                        className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none text-slate-600"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-slate-700 text-sm font-semibold mb-2">To'liq ta'rif / Shartlar</label>
                        <textarea 
                           required rows="4"
                           placeholder="Talabalar qanday vazifa bajarishlari kerakligini batafsil yozing..."
                           className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                     </div>
                  </div>
                  <div className="flex justify-end pt-2">
                     <button 
                        type="submit" 
                        disabled={loading || myGroups.length === 0}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition disabled:opacity-50"
                     >
                        {loading ? 'Yuborilmoqda...' : '+ Tanlangan Guruhga Jo\'natish'}
                     </button>
                  </div>
               </form>
               </div>
            )}

            {/* Submitted Tasks */}
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 mt-8 border-t border-slate-200 pt-8">
               📥 Kelib tushgan yechimlar
               {submissions.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{submissions.length}</span>}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
               <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                     <th className="p-4 font-semibold">O'quvchi</th>
                     <th className="p-4 font-semibold">Qaysi Vazifa (Guruh)</th>
                     <th className="p-4 font-semibold">Javob Linki</th>
                     <th className="p-4 font-semibold text-center">Natija</th>
                     <th className="p-4 font-semibold text-right">Tekshirish</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {submissions.length === 0 ? (
                     <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500">
                           Hali hech kim vazifani bajarib jo'natmadi.
                        </td>
                     </tr>
                     ) : (
                     submissions.map(sub => (
                        <tr key={sub._id} className="hover:bg-indigo-50/50 transition-colors">
                           <td className="p-4">
                           <div className="font-bold text-slate-800">{sub.studentId?.name}</div>
                           <div className="text-xs text-slate-500">{sub.studentId?.email}</div>
                           </td>
                           <td className="p-4">
                              <span className="font-medium text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-xs">{sub.assignmentId?.title}</span>
                              <div className="text-xs text-slate-400 mt-1">Vaqti: {new Date(sub.createdAt).toLocaleString()}</div>
                           </td>
                           <td className="p-4">
                              {sub.solutionLink && (
                              <a href={sub.solutionLink} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold text-sm flex items-center gap-1 mb-1">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                 Qarash
                              </a>
                              )}
                              {sub.fileUrl && (
                              <a href={`http://localhost:5000${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-flex font-semibold text-xs flex items-center gap-1 mb-1">
                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                 Fayl
                              </a>
                              )}
                              {!sub.solutionLink && !sub.fileUrl && <span className="text-xs text-slate-400">Yo'q</span>}
                              {sub.notes && <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={sub.notes}>💬 {sub.notes}</p>}
                           </td>
                           <td className="p-4 text-center">
                              {sub.status === 'pending' && <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">Kutilmoqda</span>}
                              {sub.status === 'approved' && <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Qabul</span>}
                              {sub.status === 'rejected' && <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Rad etildi</span>}
                              
                              {sub.grade !== null && sub.grade !== undefined && (
                                 <div className="mt-2 text-sm font-extrabold text-indigo-700">Baho: {sub.grade}/100</div>
                              )}
                              {sub.feedback && (
                                 <div className="mt-1 text-xs text-slate-500 max-w-[150px] truncate mx-auto" title={sub.feedback}>"{sub.feedback}"</div>
                              )}
                           </td>
                           <td className="p-4 text-right">
                              <button 
                              onClick={() => openGradingModal(sub)} 
                              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
                              >
                                 {sub.status === 'pending' ? 'Tekshirish' : 'O\'zgartirish'}
                              </button>
                           </td>
                        </tr>
                     ))
                     )}
                  </tbody>
               </table>
               </div>
            </div>
         </div>
      )}

      {/* Grading Modal */}
      {activeGradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           {/* Modal qismi bir hil */}
           <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setActiveGradingSub(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Vazifani Baholash</h2>
              <form onSubmit={submitGrade} className="space-y-5">
                 <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Holati (Status)</label>
                    <select className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                       <option value="approved">Qabul qilish</option>
                       <option value="rejected">Rad etish</option>
                       <option value="pending">Kutishda qoldirish</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Baho (0-100 ball)</label>
                    <input type="number" min="0" max="100" className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Izoh (Feedback)</label>
                    <textarea rows="3" className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)}></textarea>
                 </div>
                 <button type="submit" disabled={gradeLoading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition disabled:opacity-50 mt-4">Saqlash</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
