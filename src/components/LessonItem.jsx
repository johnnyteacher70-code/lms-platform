export default function LessonItem({ title, duration, isPlaying, isCompleted, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-slate-100 last:border-0
        ${isPlaying ? 'bg-indigo-50' : 'hover:bg-slate-50'}
      `}
    >
      {/* Icon: Checkmark if completed, Play if playing, or empty square/play icon */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        ) : isPlaying ? (
          <div className="w-5 h-5 text-primary">
            {/* Animated bars icon for playing */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="12" width="4" height="8" rx="1"></rect>
              <rect x="10" y="6" width="4" height="14" rx="1"></rect>
              <rect x="17" y="10" width="4" height="10" rx="1"></rect>
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-slate-300 rounded text-transparent flex items-center justify-center"></div>
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
