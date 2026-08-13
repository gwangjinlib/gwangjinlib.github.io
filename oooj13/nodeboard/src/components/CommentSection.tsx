import React, { useState } from 'react';
import { Comment } from '../types';
import { formatDate } from '../utils/date';
import { MessageSquare, ThumbsUp, Trash2, CornerDownRight, Send, Lock, User } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (data: { author: string; password: string; content: string; parentId?: string | null }) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
}) => {
  // Main comment form state
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');

  // Reply state
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyPassword, setReplyPassword] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !password.trim() || !content.trim()) return;

    onAddComment({
      author: author.trim(),
      password: password.trim(),
      content: content.trim(),
      parentId: null,
    });

    setContent('');
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyPassword.trim() || !replyContent.trim()) return;

    onAddComment({
      author: replyAuthor.trim(),
      password: replyPassword.trim(),
      content: replyContent.trim(),
      parentId,
    });

    setReplyContent('');
    setReplyParentId(null);
  };

  // Group comments into root comments and their child replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <section className="mt-10 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-700" />
          <span>댓글</span>
          <span className="text-rose-600 font-extrabold">{comments.length}</span>
        </h3>
      </div>

      {/* Main New Comment Form */}
      <form onSubmit={handleMainSubmit} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="작성자 닉네임"
              required
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 쓰세요."
            rows={2}
            required
            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-xs flex flex-col items-center justify-center gap-1 shrink-0 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>등록</span>
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            아직 작성된 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isReplying = replyParentId === comment.id;

            return (
              <div key={comment.id} className="space-y-3">
                {/* Root Comment Box */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        {comment.author.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{comment.author}</span>
                      <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLikeComment(comment.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{comment.likes}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (isReplying) {
                            setReplyParentId(null);
                          } else {
                            setReplyParentId(comment.id);
                            setReplyAuthor(author);
                            setReplyPassword(password);
                          }
                        }}
                        className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        답글
                      </button>

                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="댓글 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed pl-9">
                    {comment.content}
                  </p>
                </div>

                {/* Reply Input Form if active */}
                {isReplying && (
                  <form
                    onSubmit={(e) => handleReplySubmit(e, comment.id)}
                    className="ml-6 sm:ml-8 p-3.5 bg-slate-100/80 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                      <CornerDownRight className="w-4 h-4 text-slate-400" />
                      <span>{comment.author} 님에게 대댓글 작성</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={replyAuthor}
                        onChange={(e) => setReplyAuthor(e.target.value)}
                        placeholder="닉네임"
                        required
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-800"
                      />
                      <input
                        type="password"
                        value={replyPassword}
                        onChange={(e) => setReplyPassword(e.target.value)}
                        placeholder="비밀번호"
                        required
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-800"
                      />
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글 을 쓰세요."
                        rows={2}
                        required
                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-slate-800"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          등록
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyParentId(null)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Render Child Replies */}
                {replies.length > 0 && (
                  <div className="ml-6 sm:ml-8 space-y-2.5 border-l-2 border-slate-200 pl-3 sm:pl-4">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                            <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center">
                              {reply.author.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{reply.author}</span>
                            <span className="text-[11px] text-slate-400">{formatDate(reply.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onLikeComment(reply.id)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{reply.likes}</span>
                            </button>

                            <button
                              onClick={() => onDeleteComment(reply.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="답글 삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-5">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
