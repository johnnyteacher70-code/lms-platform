import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LessonItem from '../components/LessonItem';

export default function LessonPage() {
  const navigate = useNavigate();
  
  // Fake mock data for the lesson
  const courseTitle = "The Complete Masterclass for React & Node.js";
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLessonId, setActiveLessonId] = useState(1);

  const curriculum = [
    {
      section: '1-Modul: Asoslarni Organish',
      lessons: [
        { id: 1, title: 'Kirish so\'zi va Kurs Rejasi', duration: '05:30', isCompleted: true },
        { id: 2, title: 'Atrof-muhitni o\'rnatish (Node & Git)', duration: '12:45', isCompleted: false },
        { id: 3, title: 'Ilk React komponentimizni yozamiz', duration: '18:20', isCompleted: false },
      ]
    },
    {
      section: '2-Modul: Chuqur tushunchalar',
      lessons: [
        { id: 4, title: 'State va Props nima?', duration: '22:15', isCompleted: false },
        { id: 5, title: 'Context API orqali proyektni boshqarish', duration: '35:00', isCompleted: false },
      ]
    }
  ];

  const goBack = () => {
    navigate(-1); // Takes the user back to their dashboard or previous page
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      
      {/* Immersive Top Navbar */}
      <nav className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 text-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="w-px h-6 bg-slate-800"></div>
          <h1 className="font-bold text-lg md:text-xl truncate max-w-xl">
            {courseTitle}
          </h1>
        </div>
        <div>
          <button className="text-sm bg-primary hover:bg-primary-hover px-4 py-2 rounded font-bold transition">
            Kursni Tugatish
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* Left Side: Video Player & Info (Takes 70%) */}
        <div className="flex-grow flex flex-col bg-slate-900 overflow-y-auto">
          
          {/* Black Video Container */}
          <div className="w-full bg-black aspect-video flex-shrink-0 flex items-center justify-center relative">
            {/* Fake Video Player Placeholder */}
            <div className="absolute inset-0 bg-slate-800 opacity-50 flex flex-col items-center justify-center"></div>
            <img 
              src="https://picsum.photos/seed/lesson/1920/1080" 
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-60"
            />
            {/* Play Button Mock */}
            <button className="absolute w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-110 hover:bg-primary transition-all duration-300">
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
            </button>
            {/* Fake Controls */}
            <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center px-4 gap-4 text-white text-sm">
              <svg className="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
              <div className="w-full h-1 bg-white/30 rounded-full"><div className="w-1/3 h-full bg-primary rounded-full"></div></div>
              <span>05:30 / 12:45</span>
            </div>
          </div>

          {/* Lesson Metadata Below Video */}
          <div className="p-6 md:p-10 bg-white min-h-[50vh] rounded-t-3xl mt-[-20px] relative z-10">
            {/* Tab Links */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 font-bold whitespace-nowrap transition-colors border-b-2 
                  ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`
                }
              >
                Dars haqida (Overview)
              </button>
              <button 
                onClick={() => setActiveTab('live')}
                className={`py-4 px-6 font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2
                  ${activeTab === 'live' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`
                }
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Jonli Efir (Zoom/Meet)
              </button>
              <button 
                onClick={() => setActiveTab('downloads')}
                className={`py-4 px-6 font-bold whitespace-nowrap transition-colors border-b-2 
                  ${activeTab === 'downloads' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`
                }
              >
                Qo'shimcha Fayllar
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Kirish so'zi va Kurs Rejasi</h2>
                <div className="prose max-w-none text-slate-600">
                  <p className="mb-4">Bu darsda biz siz bilan kurs davomida qanday bilimlarni o'rganishimiz haqida gaplashamiz. Video ustiga bosib tomoshani boshlang!</p>
                  <p>Har bir videoda aytilgan vazifalarni to'liq bajarib borishingiz kerak. Dars yakuniga yetgach, yon menyudan ikkinchi darsga o'tishingiz mumkin.</p>
                </div>
              </div>
            )}

            {activeTab === 'live' && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Jonli Efir Havolasi</h2>
                <p className="text-slate-600 mb-6">O'qituvchingiz tomonidan belgilangan vaqtda quyidagi havola orqali Zoom/Google Meet guruhiga qo'shilishingiz mumkin.</p>
                <a href="#" className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-red-200">
                  Join Live Class →
                </a>
              </div>
            )}

            {activeTab === 'downloads' && (
              <div>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">Biriktirilgan fayllar</h2>
                 <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-sm cursor-pointer hover:bg-slate-100 transition">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Homework_Requirements.pdf</p>
                      <p className="text-xs text-slate-500">2.4 MB</p>
                    </div>
                 </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Course Curriculum Drawer (Takes 30%) */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex-shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-extrabold text-slate-800 shadow-sm z-10 shrink-0 bg-white">
            Darslar Ro'yxati (Curriculum)
          </div>
          
          <div className="overflow-y-auto flex-grow bg-slate-50">
            {curriculum.map((module, index) => (
              <div key={index} className="mb-2">
                {/* Module Header */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 border-t sticky top-0 font-bold text-sm text-slate-700">
                  {module.section}
                </div>
                {/* Module Lessons */}
                <div className="bg-white">
                  {module.lessons.map(lesson => (
                    <LessonItem 
                      key={lesson.id}
                      title={lesson.title}
                      duration={lesson.duration}
                      isCompleted={lesson.isCompleted}
                      isPlaying={lesson.id === activeLessonId}
                      onClick={() => setActiveLessonId(lesson.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
