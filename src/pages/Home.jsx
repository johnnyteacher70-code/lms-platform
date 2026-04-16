import CourseCard from '../components/CourseCard';

// Temporary mock data until API is fully implemented
const MOCK_COURSES = [
  { id: 1, title: 'The Complete Masterclass for React & Node.js', instructor: 'John Doe', price: 89.99, rating: 4.9, students: '4.5k', badge: 'Bestseller' },
  { id: 2, title: 'Modern UI/UX Design using Figma', instructor: 'Sarah Smith', price: 49.99, rating: 4.7, students: '3k' },
  { id: 3, title: 'Python Programming from Zero to Hero', instructor: 'Michael Scott', price: 0, rating: 4.8, students: '12k', badge: 'Free' },
  { id: 4, title: 'Advanced Cloud Architecture with AWS', instructor: 'Alex Johnson', price: 120.00, rating: 4.6, students: '1.2k' },
  { id: 5, title: 'Digital Marketing & SEO Strategies', instructor: 'Jessica Lee', price: 59.99, rating: 4.5, students: '800' },
  { id: 6, title: 'Data Science with Machine Learning', instructor: 'David Brown', price: 99.99, rating: 4.9, students: '2.4k', badge: 'Hot' },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* 🔴 HERO SECTION */}
      <section className="relative bg-white overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50/50"></div>
          {/* Decorative blur elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Learn Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Limits.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg mx-auto md:mx-0">
              Build your skills with our constantly growing library of video courses, taught by expert instructors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1">
                Explore Courses
              </button>
              <button className="bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold shadow-sm transition-all">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center md:justify-end">
            {/* Hero Graphic / Image Placeholder */}
            <div className="relative w-full max-w-md">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Students Learning" 
                className="rounded-2xl shadow-2xl relative z-10 border-4 border-white"
              />
              {/* Floating element for aesthetics */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Active Students</p>
                  <p className="text-xl font-extrabold text-slate-800">45,000+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 COURSES GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Featured Courses</h2>
            <p className="text-slate-600">Hand-picked courses by our experts.</p>
          </div>
          <button className="hidden sm:inline-block text-primary font-bold hover:text-primary-hover transition-colors">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_COURSES.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-10 text-center sm:hidden">
          <button className="text-primary font-bold hover:text-primary-hover transition-colors px-6 py-3 border border-primary rounded-xl w-full">
            View All Courses
          </button>
        </div>
      </section>
    </div>
  );
}
