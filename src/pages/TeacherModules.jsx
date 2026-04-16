import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTeacherGroups } from '../services/groupApi';
import { createModule, getTeacherModules, createLesson, getLessonsByModule } from '../services/moduleApi';

export default function TeacherModules() {
  const { user } = useAuth();
  
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Create Module State
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [modLoading, setModLoading] = useState(false);

  // Active Module State (viewing its lessons)
  const [activeModule, setActiveModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  
  // Create Lesson State
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [lesLoading, setLesLoading] = useState(false);

  useEffect(() => {
     fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
      try {
         const mods = await getTeacherModules(user._id);
         setModules(mods);

         const grps = await getTeacherGroups(user._id);
         setGroups(grps);
      } catch(err) {
         console.error(err);
      }
  };

  const handleCreateModule = async (e) => {
      e.preventDefault();
      setModLoading(true);
      try {
          const newMod = await createModule({ title: moduleTitle, teacherId: user._id, groupId: selectedGroup });
          setModules([newMod, ...modules]);
          setModuleTitle('');
          setSelectedGroup('');
          setShowModuleForm(false);
      } catch(err) {
          alert('Xatolik yuz berdi');
      } finally {
          setModLoading(false);
      }
  };

  const openModule = async (mod) => {
      setActiveModule(mod);
      setShowLessonForm(false);
      try {
          const less = await getLessonsByModule(mod._id);
          setLessons(less);
      } catch(err) {
          console.error(err);
      }
  };

  const handleCreateLesson = async (e) => {
      e.preventDefault();
      setLesLoading(true);
      try {
          const formData = new FormData();
          formData.append('moduleId', activeModule._id);
          formData.append('title', lessonTitle);
          formData.append('content', lessonContent);
          formData.append('videoUrl', videoUrl);
          if (file) {
             formData.append('material', file); // multer assumes 'material' field
          }
          
          const newLes = await createLesson(formData);
          setLessons([...lessons, newLes]);
          
          // Reset form
          setLessonTitle('');
          setLessonContent('');
          setVideoUrl('');
          setFile(null);
          setShowLessonForm(false);
      } catch(err) {
          alert("Dars qoshishda xato. Barcha maydonlarni tekshiring.");
      } finally {
          setLesLoading(false);
      }
  };

  return (
    <div className="w-full h-full pb-10">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Modullar va Darslar</h1>
          <p className="text-slate-500 mt-1">O'quv rejangiz va kunlik nazariy materiallarni boshqaring.</p>
        </div>
      </div>

      {!activeModule ? (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Sizning Modullaringiz ({modules.length})</h2>
                <button 
                  onClick={() => setShowModuleForm(!showModuleForm)}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-bold shadow-sm transition"
                >
                   {showModuleForm ? 'Bekor qilish' : '+ Yangi Modul'}
                </button>
            </div>

            {showModuleForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl">
                    <form onSubmit={handleCreateModule} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Modul nomi</label>
                            <input 
                              type="text" required placeholder="Masalan: Frontend 1-oy (HTML/CSS)" 
                              className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                              value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Qaysi Guruh uchun?</label>
                            <select 
                              required
                              className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                              value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
                            >
                                <option value="" disabled>-- Guruh tanlang --</option>
                                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                            {groups.length === 0 && <p className="text-xs text-red-500 mt-1">Afsuski, sizda hech qanday guruh yo'q</p>}
                        </div>
                        <button type="submit" disabled={modLoading} className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl mt-2">
                           {modLoading ? 'Yaratilmoqda...' : 'Modulni Saqlash'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(mod => (
                    <div key={mod._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between h-48" onClick={() => openModule(mod)}>
                        <div>
                            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full mb-3">
                                {mod.groupId?.name || 'Noma\'lum Guruh'}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 line-clamp-2">{mod.title}</h3>
                        </div>
                        <div className="text-sm font-bold text-slate-400 mt-4 flex items-center justify-between">
                            <span>Sana: {new Date(mod.createdAt).toLocaleDateString()}</span>
                            <span className="text-primary group-hover:underline">Kirish →</span>
                        </div>
                    </div>
                ))}
                {modules.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        Hozircha bironta ham Modul yaratmagansiz.
                    </div>
                )}
            </div>
        </>
      ) : (
        /* OCHILGAN MODUL ICHI (DARSLAR) */
        <div>
            <div className="mb-6">
                <button onClick={() => setActiveModule(null)} className="text-indigo-600 font-bold text-sm mb-2 hover:underline flex items-center gap-1">
                    ← Orqaga (Modullar ro'yhatiga)
                </button>
                <div className="flex justify-between items-end">
                   <div>
                       <div className="text-xs font-bold text-slate-500 mb-1">Modul:</div>
                       <h2 className="text-3xl font-extrabold text-slate-800">{activeModule.title}</h2>
                       <p className="text-primary font-bold">{activeModule.groupId?.name}</p>
                   </div>
                   <button 
                      onClick={() => setShowLessonForm(!showLessonForm)}
                      className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-5 py-2.5 rounded-xl font-bold transition"
                   >
                       {showLessonForm ? 'Yopish' : '+ Kunlik Dars Qo\'shish'}
                   </button>
                </div>
            </div>

            {showLessonForm && (
                <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 mb-8 relative">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Yang dars materialini yuklash</h3>
                    <form onSubmit={handleCreateLesson} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Dars mavzusi</label>
                                <input 
                                  type="text" required placeholder="1-Dars: HTML ga kirish" 
                                  className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                  value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">YouTube Video Link (Ixtiyoriy)</label>
                                <input 
                                  type="url" placeholder="https://youtu.be/..." 
                                  className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                  value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nazariy qism yoki Izoh</label>
                                <textarea 
                                  rows="3" placeholder="Bugungi darsda nimalar o'tilgani xulosasi..." 
                                  className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                  value={lessonContent} onChange={(e) => setLessonContent(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Material (.pdf, .pptx, .zip)</label>
                                <input 
                                  type="file" 
                                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                                  onChange={(e) => setFile(e.target.files[0])}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={lesLoading} className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-4">
                           {lesLoading ? 'Yuklanmoqda...' : 'Darsni Saqlash'}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {lessons.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                        Bu modulda hali darslar yo'q.
                    </div>
                ) : (
                    lessons.map((les, index) => (
                        <div key={les._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition">
                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">
                                {index + 1}
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{les.title}</h4>
                                {les.content && <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-4 rounded-lg">{les.content}</p>}
                                
                                <div className="flex flex-wrap gap-3">
                                   {les.videoUrl && (
                                       <a href={les.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition">
                                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                           Video Dars
                                       </a>
                                   )}
                                   {les.fileUrl && (
                                       <a href={`http://localhost:5000${les.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-primary bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition">
                                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                           Material
                                       </a>
                                   )}
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right text-xs text-slate-400 font-medium">
                                {new Date(les.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
}
