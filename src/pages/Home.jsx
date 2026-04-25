import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';
import { ArrowRight, Sparkles, Play, ShieldCheck, Globe } from 'lucide-react';

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
    <div className="w-full bg-background overflow-x-hidden">
      {/* 🔴 HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full filter blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full filter blur-[100px] -ml-64 -mb-64"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-3/5 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/10 mb-8"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Yangi Davr Ta'limi</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
              Bilimga <span className="text-gradient">Cheksiz</span> <br /> 
              Yo'l Oching.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              O'z sohangizning eng yaxshi mutaxassislaridan o'rganing. 10,000 dan ortiq darslar va sertifikatlar bilan karyerangizni yangi bosqichga olib chiqing.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 group"
              >
                Kurslarni Ko'rish
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-slate-900 border border-slate-200 hover:border-primary/30 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-slate-200/50 flex items-center justify-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Play size={14} fill="currentColor" />
                </div>
                Video Tanishtiruv
              </motion.button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <ShieldCheck size={16} /> 100% Xavfsiz
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Globe size={16} /> Dunyo miqyosida
               </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lg:w-2/5 relative"
          >
            <div className="relative z-10 p-4 bg-white rounded-[40px] shadow-2xl border border-white/50">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Students" 
                className="rounded-[32px] w-full"
              />
              {/* Floating Stat Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 glass-card p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4 z-20 shadow-2xl"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                  <Globe size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Faol Talabalar</p>
                  <p className="text-lg md:text-xl font-black text-slate-900 leading-none">45,000+</p>
                </div>
              </motion.div>
            </div>

            {/* Backdrop Ring */}
            <div className="absolute -inset-4 border-2 border-primary/20 rounded-[48px] -z-10 animate-spin-slow"></div>
          </motion.div>
        </div>
      </section>

      {/* 🔴 COURSES GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Mashhur Kurslar</h2>
            <p className="text-slate-500 font-medium text-lg max-w-md">Ekspertlarimiz tomonidan tanlab olingan eng sara video darsliklar.</p>
          </motion.div>
          
          <motion.button 
            whileHover={{ x: 5 }}
            className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2 group"
          >
            Barchasini Ko'rish 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {MOCK_COURSES.map((course, idx) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </motion.div>
      </section>
    </div>
  );
}
