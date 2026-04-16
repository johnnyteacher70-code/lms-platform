import { useParams, Link } from 'react-router-dom';

export default function CourseDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-4rem)]">
      
      <div className="mb-6">
        <Link to="/" className="text-primary font-medium hover:underline flex items-center gap-2">
          ← Orqaga (Katalogga qaytish)
        </Link>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 mb-10">
        
        {/* Header / Banner */}
        <div className="relative h-64 md:h-96 bg-slate-900 overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/${id}/1920/1080`}
            alt="Course Concept" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
            <div className="flex gap-2 mb-4">
              <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Development</span>
              <span className="bg-white/20 text-white backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full">Bestseller</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 max-w-3xl leading-tight">
              Ajoyib Kurs nomi (ID: {id})
            </h1>
            <p className="text-slate-300 max-w-2xl text-lg">
              Bu sahifada kelajakda kurs haqida to'liq ma'lumotlar, video darslar ro'yxati va obuna bo'lish (Sotib olish) tugmasi bo'ladi.
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex flex-col md:flex-row p-8 md:p-12 gap-12">
          
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What you'll learn</h2>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  Build modern web apps from scratch
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  Master React and Context API
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Content</h2>
            <p className="text-slate-600 mb-4">Modules goes here...</p>
          </div>
          
          {/* Fixed Action Box (Sidebar for detail) */}
          <div className="md:w-1/3">
            <div className="bg-white border rounded-2xl p-6 shadow-xl shadow-slate-200/50 sticky top-24">
              <div className="text-4xl font-extrabold text-slate-900 mb-4">$89.99</div>
              
              <button className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg mb-3 shadow transition-colors">
                Enrol Now
              </button>
              
              <p className="text-xs text-center text-slate-500 mb-6">30-Day Money-Back Guarantee</p>
              
              <div className="space-y-3 pt-6 border-t font-medium text-sm text-slate-700">
                <div className="flex justify-between"><span>Includes</span></div>
                <div className="flex items-center gap-3"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 40 hours video</div>
                <div className="flex items-center gap-3"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Lifetime access</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
