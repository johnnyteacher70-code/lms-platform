import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getGroupStats } from '../services/groupApi';
import { Trophy, Medal, Target, User as UserIcon, Calendar } from 'lucide-react';

export default function StudentGroupStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.groupId) {
      getGroupStats(user.groupId)
        .then(res => {
          setStats(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user?.groupId]);

  if (loading) return <div className="p-10 text-center text-slate-500">Yuklanmoqda...</div>;
  if (!user?.groupId) return <div className="p-10 text-center text-slate-500">Siz hali guruhga a'zo emassiz.</div>;
  if (!stats) return <div className="p-10 text-center text-slate-500">Ma'lumot topilmadi.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Sizning O'rningiz</p>
            <p className="text-2xl font-bold text-slate-900">
              #{stats.leaderboard.findIndex(s => s._id === user._id) + 1}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-primary">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Umumiy Ballingiz</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.leaderboard.find(s => s._id === user._id)?.totalPoints || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Davomatingiz</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.leaderboard.find(s => s._id === user._id)?.attendancePcnt || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Medal className="text-amber-500" /> Guruh Reytingi (Leaderboard)
          </h2>
          <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Jami darslar: {stats.totalLessons}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">O'rin</th>
                <th className="px-6 py-4 font-bold">Talaba</th>
                <th className="px-6 py-4 font-bold text-center">Topshirilgan</th>
                <th className="px-6 py-4 font-bold text-center">Davomat</th>
                <th className="px-6 py-4 font-bold text-right">Jami Ball</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.leaderboard.map((item, index) => {
                const isMe = item._id === user._id;
                const rank = index + 1;
                
                return (
                  <tr 
                    key={item._id} 
                    className={`transition-colors ${isMe ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {rank === 1 ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200">1</div>
                        ) : rank === 2 ? (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">2</div>
                        ) : rank === 3 ? (
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200">3</div>
                        ) : (
                          <span className="w-8 text-center text-slate-400 font-medium">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isMe ? 'text-primary' : 'text-slate-800'}`}>
                            {item.name} {isMe && <span className="ml-1 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase">Siz</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-slate-600">{item.submissionsCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${item.attendancePcnt >= 80 ? 'text-emerald-600' : item.attendancePcnt >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {item.attendancePcnt}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.attendancePcnt >= 80 ? 'bg-emerald-500' : item.attendancePcnt >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${item.attendancePcnt}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-slate-900">{item.totalPoints}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
