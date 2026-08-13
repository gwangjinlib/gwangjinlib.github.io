import React, { useState } from 'react';
import { Post, Comment } from '../types';
import { formatDate } from '../utils/date';
import { CommentSection } from './CommentSection';
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  Calendar,
  User,
  Edit2,
  Trash2,
  Share2,
  Bookmark,
  Pin,
  Check
} from 'lucide-react';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onLikePost: () => void;
  onEditPost: () => void;
  onDeletePost: () => void;
  onAddComment: (data: { author: string; password: string; content: string; parentId?: string | null }) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const categoryColors: Record<string, string> = {
  '공지': 'bg-rose-100 text-rose-800 border-rose-200',
  '일반': 'bg-slate-100 text-slate-700 border-slate-200',
  '질문': 'bg-amber-100 text-amber-800 border-amber-200',
};

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  onLikePost,
  onEditPost,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    onToast('게시글 링크가 클립보드에 복사되었습니다.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all"
            title="공유하기"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onEditPost}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>수정</span>
          </button>

          <button
            onClick={onDeletePost}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl shadow-2xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>삭제</span>
          </button>
        </div>
      </div>

      {/* Main Post Content Card */}
      <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        {/* Category & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-md shadow-2xs">
              <Pin className="w-3 h-3" />
              고정 공지
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${
              categoryColors[post.category] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-4">
          {post.title}
        </h1>

        {/* Author Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl mb-8 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                {post.author.charAt(0)}
              </div>
              <span className="text-sm">{post.author}</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(post.createdAt)}</span>
            </div>

            {post.updatedAt && (
              <span className="text-slate-400 font-medium">(수정됨)</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5" title="조회수">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>조회 {post.views}</span>
            </span>

            <span className="flex items-center gap-1.5 font-semibold text-rose-600" title="추천">
              <ThumbsUp className="w-4 h-4" />
              <span>추천 {post.likes}</span>
            </span>
          </div>
        </div>

        {/* Body Text Content */}
        <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap min-h-[140px]">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Like Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLikePost}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-2xl font-bold text-sm shadow-xs active:scale-95 transition-all group"
          >
            <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>이 글 추천하기 ({post.likes})</span>
          </button>
        </div>

        {/* Comment Section */}
        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onLikeComment={onLikeComment}
        />
      </article>
    </div>
  );
};
