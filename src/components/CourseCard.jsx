import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  // We use placeholder images based on the course ID to make it look realistic
  const placeholderImg = `https://picsum.photos/seed/${course.id}/600/400`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer hover:-translate-y-1">
      
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image || placeholderImg} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Optional Badge */}
        {course.badge && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary rounded-full shadow">
            {course.badge}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Meta Info */}
        <div className="flex items-center text-xs text-slate-500 space-x-4 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            {course.rating || '4.8'}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            {course.students || '1.2k'} Students
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        {/* Instructor */}
        <p className="text-sm text-slate-500 mb-6">
          By <span className="font-medium text-slate-700">{course.instructor}</span>
        </p>

        {/* Footer actions */}
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
          
          <Link 
            to={`/course/${course.id}`} 
            className="text-sm font-semibold w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors"
            title="View Course"
          >
            →
          </Link>
        </div>
        
      </div>
    </div>
  );
}
