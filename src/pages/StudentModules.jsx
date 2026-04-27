import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStudentModules, getLessonsByModule } from '../services/moduleApi';

export default function StudentModules() {
  const { user } = useAuth();
  
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
     const fetchModules = async () => {
         if (user.groupId) {
             try {
                const mods = await getStudentModules(user.groupId);
                setModules(mods);
             } catch(err) {
                console.error(err);
             }
         }
     };
     fetchModules();
  }, [user]);

  const openModule = async (mod) => {
      setActiveModule(mod);
      try {
          const less = await getLessonsByModule(mod._id);
          setLessons(less);
      } catch(err) {
          console.error(err);
      }
  };

  return (
    <div className="w-full h-full pb-10">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Darsliklar va Modullar</h1>
          <p className="text-slate-500 mt-1">O'qituvchingiz yuklagan kunlik dars materiallarini shu yerdan topishingiz mumkin.</p>
        </div>
      </div>

      {!activeModule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(mod => (
                <div key={mod._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition cursor-pointer flex flex-col justify-between h-48 group" onClick={() => openModule(mod)}>
                    <div>
                        <div className="text-xs font-bold text-slate-600 bg-slate-100 inline-block px-3 py-1 rounded-full mb-3">
                            Ustoz: {mod.teacherId?.name || 'Noma\'lum Ustoz'}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 line-clamp-2 group-hover:text-primary transition">{mod.title}</h3>
                    </div>
                    <div className="text-sm font-bold text-slate-400 mt-4 flex items-center justify-between">
                        <span>Yuklandi: {new Date(mod.createdAt).toLocaleDateString()}</span>
                        <span className="text-primary group-hover:underline">Darslarga kirish →</span>
                    </div>
                </div>
            ))}
            {modules.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-medium">
                    Sizning guruhingiz uchun hozircha hech qanday Modul yuklanmagan.
                </div>
            )}
        </div>
      ) : (
        /* OCHILGAN MODUL ICHI */
        <div>
            <div className="mb-8">
                <button onClick={() => setActiveModule(null)} className="text-primary font-bold text-sm mb-2 hover:underline flex items-center gap-1">
                    ← Modullar ro'yhatiga qaytish
                </button>
                <h2 className="text-3xl font-extrabold text-slate-800">{activeModule.title}</h2>
            </div>

            <div className="space-y-4">
                {lessons.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                        Bu modulda hali darslar yo'q.
                    </div>
                ) : (
                    lessons.map((les, index) => (
                        <div key={les._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">
                                {index + 1}
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{les.title}</h4>
                                {les.content && <p className="text-slate-600 text-sm mb-4 leading-relaxed">{les.content}</p>}
                                
                                <div className="flex flex-wrap gap-3">
                                   {les.videoUrl && (
                                       <a href={les.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition shadow-sm">
                                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                           Video Darsni ko'rish
                                       </a>
                                   )}
                                   {les.fileUrl && (
                                       <a href={`${import.meta.env.VITE_SOCKET_URL || 'https://lms-platform-efpp.onrender.com'}${les.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-primary bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition shadow-sm">
                                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                           Materialni Yuklash
                                       </a>
                                   )}
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right text-xs text-slate-400 font-medium">
                                Sana: {new Date(les.createdAt).toLocaleDateString()}
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
