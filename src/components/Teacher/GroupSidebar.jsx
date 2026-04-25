import { useState } from 'react';

export default function GroupSidebar({ groups, activeGroupId, onSelectGroup }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active'); // 'all', 'active', 'archive'

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const groupStatus = g.status || 'active'; // Default to active if missing
    const matchesFilter = filter === 'all' ? true : groupStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Guruhlar</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Guruhni qidirish..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {['all', 'active', 'archive'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                ${filter === f ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              {f === 'all' ? 'Barchasi' : f === 'active' ? 'Faol' : 'Arxiv'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <div 
              key={group._id}
              onClick={() => onSelectGroup(group)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group
                ${activeGroupId === group._id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeGroupId === group._id ? 'text-indigo-100' : 'text-slate-400 font-bold'}`}>
                  {group.name.split('-')[0] || 'GROUP'}
                </span>
                {group.status === 'active' ? (
                   <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                ) : (
                   <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                )}
              </div>
              <h3 className={`font-bold transition-colors ${activeGroupId === group._id ? 'text-white' : 'text-slate-700'}`}>
                {group.name}
              </h3>
              <p className={`text-xs mt-1 transition-colors ${activeGroupId === group._id ? 'text-indigo-200' : 'text-slate-400 font-medium'}`}>
                O'quvchilar: {group.students?.length || 0}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400 font-medium italic">Guruh topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
