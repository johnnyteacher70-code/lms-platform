export default function LessonItem({ title, duration, isPlaying, isCompleted, isLocked, onClick }) {
  return (
    <div 
      onClick={!isLocked ? onClick : undefined}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-300 border-b border-slate-50 last:border-0 rounded-xl
        ${isPlaying ? 'bg-indigo-50/80 shadow-sm border-indigo-100' : 'hover:bg-slate-50'}
        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 flex items-center justify-center w-6 min-w-6">
        {isLocked ? (
          <div className="text-slate-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
        ) : isCompleted ? (
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
          </div>
        ) : isPlaying ? (
          <div className="w-6 h-6 text-indigo-600 animate-pulse">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="12" width="4" height="8" rx="1"></rect>
              <rect x="10" y="6" width="4" height="14" rx="1"></rect>
              <rect x="17" y="10" width="4" height="10" rx="1"></rect>
            </svg>
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-slate-200 rounded-lg text-transparent flex items-center justify-center group-hover:border-indigo-300 transition-colors"></div>
        )}
      </div>

      {/* Details */}
      <div className="flex-grow">
        <p className={`text-sm ${isPlaying ? 'font-bold text-primary' : 'font-medium text-slate-700'}`}>
          {title}
        </p>
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 text-xs font-semibold text-slate-400">
        {duration}
      </div>
    </div>
  );
}
