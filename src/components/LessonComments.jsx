import { useState, useEffect } from 'react';
import { getLessonComments, postComment } from '../services/commentApi';

export default function LessonComments({ lessonId, userId, userName }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchComments();
    }
  }, [lessonId]);

  const fetchComments = async () => {
    try {
      const data = await getLessonComments(lessonId);
      setComments(data);
    } catch (err) {
      console.error("Savollarni yuklashda xato:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const savedComment = await postComment({
        lessonId,
        userId,
        text: newComment
      });
      setComments([...comments, savedComment]);
      setNewComment('');
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 py-10 border-t border-slate-100">
      <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </span>
        Dars yuzasidan savol-javoblar
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 group">
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-100 focus-within:border-indigo-500/50 transition-all duration-300 shadow-sm focus-within:shadow-indigo-100/50">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Dars haqida savolingiz bo'lsa qoldiring..."
            className="w-full p-5 bg-white outline-none text-slate-700 min-h-[120px] resize-none"
          />
          <div className="flex justify-between items-center p-3 bg-slate-50 border-t border-slate-100">
            <span className="text-xs text-slate-400">Markaz qoidalariga rioya qiling</span>
            <button
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {loading ? 'Yuborilmoqda...' : 'Savol yuborish'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">Hozircha savollar yo'q. Birinchi bo'lib savol bering!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                {comment.userId?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{comment.userId?.name}</span>
                  {comment.userId?.role === 'teacher' && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-full">
                      O'qituvchi
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none border border-slate-100 text-slate-700 leading-relaxed shadow-sm group-hover:shadow-md transition-shadow">
                  {comment.text}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
