import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LessonItem from '../components/LessonItem';
import LessonComments from '../components/LessonComments';
import { getStudentModules, getLessonsByModule } from '../services/moduleApi';
import { getYouTubeID } from '../utils/videoHelper';
import { Lock, Play, ChevronLeft, Calendar, FileText, CheckCircle } from 'lucide-react';

export default function LessonPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [modules, setModules] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.groupId) {
      fetchCurriculum();
    }
  }, [user]);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      // 1. Gruppa uchun barcha modullarni olamiz
      const mods = await getStudentModules(user.groupId);
      
      // 2. Har bir modul uchun darslarni va progressni olamiz
      const modulesWithLessons = await Promise.all(mods.map(async (mod) => {
        const lessons = await getLessonsByModule(mod._id, user._id);
        return { ...mod, lessons };
      }));

      setModules(modulesWithLessons);

      // 3. Hammani bitta massivga yig'amiz (navigatsiya va locking uchun)
      const flatLessons = modulesWithLessons.flatMap(m => m.lessons);
      setAllLessons(flatLessons);

      // 4. Default birinchi darsni tanlaymiz
      if (flatLessons.length > 0) {
        setActiveLesson(flatLessons[0]);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const isLocked = (lessonId) => {
    const lessonIndex = allLessons.findIndex(l => l._id === lessonId);
    if (lessonIndex <= 0) return false;

    // Oldingi darslarni tekshiramiz
    for (let i = 0; i < lessonIndex; i++) {
      const prevLesson = allLessons[i];
      // Agar oldingi darsda vazifa bo'lsa
      if (prevLesson.assignment) {
        const submission = prevLesson.assignment.submission;
        const passingGrade = prevLesson.passingGrade || 60;

        // Agar topshirilmagan bo'lsa yoki ball yetarli bo'lmasa - Qulf!
        if (!submission || (submission.grade === null || submission.grade < passingGrade)) {
          return true;
        }
      }
    }
    return false;
  };

  const goBack = () => navigate(-1);

  if (loading) {
     return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Yuklanmoqda...</div>;
  }

  const activeIsLocked = activeLesson ? isLocked(activeLesson._id) : false;
  const youtubeId = activeLesson ? getYouTubeID(activeLesson.videoUrl) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      
      {/* Top Navbar */}
      <nav className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 text-white shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={goBack} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
          <div>
            <h1 className="font-black text-xl tracking-tight truncate max-w-md lg:max-w-xl">
              {activeLesson?.title || "Dars yuklanmoqda..." }
            </h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
               {modules.find(m => m.lessons.some(l => l._id === activeLesson?._id))?.title || "Kurs moduli"}
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden h-[calc(100vh-5rem)]">
        
        {/* Left Side: Video & Info */}
        <div className="flex-grow flex flex-col bg-slate-900 overflow-y-auto custom-scrollbar">
          
          {/* Video Container */}
          <div className="w-full bg-black aspect-video flex-shrink-0 flex items-center justify-center relative shadow-2xl">
            {activeIsLocked ? (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center z-20">
                <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-500/30">
                  <Lock size={40} />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Ushbu dars hozircha qulflangan</h3>
                <p className="text-slate-400 max-w-md leading-relaxed">
                   Darsni ko'rish uchun oldingi dars vazifasini topshirishingiz va kamida 
                   <span className="text-white font-bold mx-1">{allLessons[allLessons.findIndex(l => l._id === activeLesson?._id)-1]?.passingGrade || 60} ball</span> 
                   to'plashingiz kerak.
                </p>
              </div>
            ) : youtubeId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-slate-500 flex flex-col items-center gap-4">
                <Play size={64} className="opacity-20" />
                <span>Video topilmadi</span>
              </div>
            )}
          </div>

          {/* Info Area */}
          <div className="p-8 md:p-12 bg-white min-h-[50vh] rounded-t-[40px] mt-[-30px] relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
            <div className="flex border-b border-slate-100 mb-10 overflow-x-auto hide-scrollbar gap-2">
              {[
                { id: 'overview', label: 'Dars haqida', icon: <FileText size={18}/> },
                { id: 'downloads', label: 'Materiallar', icon: <Calendar size={18}/> },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-8 font-black text-sm uppercase tracking-widest transition-all border-b-4 flex items-center gap-3
                    ${activeTab === tab.id ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`
                  }
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="max-w-4xl">
              {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl font-black text-slate-900 mb-6">{activeLesson?.title}</h2>
                  <div 
                    className="prose prose-slate max-w-none text-slate-600 leading-loose text-lg"
                    dangerouslySetInnerHTML={{ __html: activeLesson?.content || "Ushbu dars uchun qo'shimcha ma'lumot kiritilmagan." }}
                  />

                  {/* Q&A Section */}
                  {activeLesson && (
                    <LessonComments 
                      lessonId={activeLesson._id} 
                      userId={user._id} 
                      userName={user.name} 
                    />
                  )}
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="animate-in fade-in duration-500">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Biriktirilgan fayllar va Vazifalar</h2>
                   <div className="grid gap-4">
                      {activeLesson?.fileUrl && (
                        <a 
                          href={activeLesson.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl group hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                        >
                          <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">Dars Materiali (Yuklab olish)</p>
                            <p className="text-xs text-slate-500">O'qituvchi tomonidan biriktirilgan qo'shimcha fayl</p>
                          </div>
                        </a>
                      )}
                      
                      {activeLesson?.assignment && (
                        <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                           <h3 className="text-2xl font-black mb-2 leading-tight">Dars Vazifasi: {activeLesson.assignment.title}</h3>
                           <p className="text-indigo-100 text-sm mb-6 max-w-md">Ushbu darsni yakunlash uchun vazifani Dashbord orqali topshiring.</p>
                           
                           {activeLesson.assignment.submission ? (
                             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-fit">
                                <CheckCircle size={16} />
                                <span className="text-xs font-black uppercase tracking-wider">
                                   Topshirilgan: {activeLesson.assignment.submission.grade || 0} ball
                                </span>
                             </div>
                           ) : (
                             <button 
                               onClick={() => navigate('/dashboard')}
                               className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg"
                             >
                               Hozir topshirish →
                             </button>
                           )}
                        </div>
                      )}
                      
                      {!activeLesson?.fileUrl && !activeLesson?.assignment && (
                        <p className="text-slate-400 italic">Bu darsda qo'shimcha materiallar yo'q.</p>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Sidebar */}
        <div className="w-full lg:w-[400px] bg-white border-l border-slate-100 flex-shrink-0 flex flex-col h-full overflow-hidden shadow-2xl z-20">
          <div className="p-8 border-b border-slate-100 font-black text-slate-900 text-xl tracking-tight shrink-0 flex items-center justify-between">
            Kurs Mundarijasi
            <span className="text-[10px] px-3 py-1 bg-slate-100 rounded-full text-slate-500 uppercase tracking-widest">{allLessons.length} dars</span>
          </div>
          
          <div className="overflow-y-auto flex-grow bg-slate-50/50 p-4 custom-scrollbar">
            {modules.map((module, mIdx) => (
              <div key={module._id} className="mb-6 animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${mIdx * 100}ms` }}>
                <div className="px-4 py-3 font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-2">
                  {mIdx + 1}. {module.title}
                </div>
                <div className="space-y-2">
                  {module.lessons.map(lesson => {
                    const locked = isLocked(lesson._id);
                    return (
                      <LessonItem 
                        key={lesson._id}
                        title={lesson.title}
                        duration={lesson.duration || "10:00"}
                        isCompleted={lesson.assignment?.submission?.grade >= (lesson.passingGrade || 60)}
                        isPlaying={lesson._id === activeLesson?._id}
                        isLocked={locked}
                        onClick={() => !locked && setActiveLesson(lesson)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
