import { useState } from 'react';

export default function ScoringModal({ student, onClose, onSave }) {
  const [category, setCategory] = useState('classwork');
  const [points, setPoints] = useState(5);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'homework', label: 'Uy vazifasi', icon: '🏠', color: 'bg-amber-100 text-amber-700' },
    { id: 'classwork', label: 'Sinfdagi faolligi', icon: '📝', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'helping', label: 'Sherigiga yordam', icon: '🤝', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'other', label: 'Boshqa', icon: '✨', color: 'bg-slate-100 text-slate-700' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(student._id, category, parseInt(points));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Tanga Berish</h2>
              <p className="text-slate-500 font-medium">Talaba: <span className="text-indigo-600 font-bold">{student?.name}</span></p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Kategoriya tanlang</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <div 
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl cursor-pointer border-2 transition-all duration-200 flex flex-col items-center text-center
                      ${category === cat.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}
                    `}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Tanga miqdori</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  className="flex-grow accent-indigo-600"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
                <span className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                  {points}
                </span>
              </div>
              <div className="flex justify-between mt-2 px-1">
                 <span className="text-[10px] font-bold text-slate-400">1</span>
                 <span className="text-[10px] font-bold text-slate-400">50</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Tasdiqlash'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
