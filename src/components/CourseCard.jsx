import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight } from 'lucide-react';

export default function CourseCard({ course }) {
  // We use placeholder images based on the course ID to make it look realistic
  const placeholderImg = `https://picsum.photos/seed/${course.id}/600/400`;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 border border-slate-100 flex flex-col group cursor-pointer"
    >
      
      {/* Cover Image */}
      <div className="relative h-52 overflow-hidden">
        <motion.img 
          src={course.image || placeholderImg} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {/* Optional Badge */}
        {course.badge && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-primary rounded-xl shadow-xl shadow-black/10 border border-white/50">
            {course.badge}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-7 flex flex-col flex-grow">
        
        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-[11px] font-bold border border-amber-100">
            <Star size={12} fill="currentColor" />
            {course.rating || '4.8'}
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Users size={12} />
            {course.students || '1.2k'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
          {course.title}
        </h3>
        
        {/* Instructor */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded-full bg-slate-100"></div>
          <p className="text-xs text-slate-500 font-medium">
            By <span className="font-bold text-slate-700">{course.instructor}</span>
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
            <span className="text-xl font-black text-slate-900">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </span>
          </div>
          
          <Link 
            to={`/course/${course.id}`} 
            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
            title="View Course"
          >
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
