import React from 'react';
import { Post } from '../types';
import { formatDate } from '../utils/date';
import { MessageSquare, Eye, ThumbsUp, Pin, Tag, User, ChevronRight, Inbox } from 'lucide-react';

interface PostListProps {
  posts: Post[];
  loading: boolean;
  onSelectPost: (post: Post) => void;
  onOpenNewPost: () => void;
  searchQuery?: string;
}

const categoryColors: Record<string, string> = {
  '공지': 'bg-rose-100 text-rose-700 border-rose-200',
  '일반': 'bg-slate-100 text-slate-700 border-slate-200',
  '질문': 'bg-amber-100 text-amber-800 border-amber-200',
};

export const PostList: React.FC<PostListProps> = ({
  posts,
  loading,
  onSelectPost,
  onOpenNewPost,
  searchQuery,
}) => {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-sm font-medium">게시글을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs my-4">
        <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다` : '등록된 게시글이 없습니다'}
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          {searchQuery
            ? '다른 검색어로 검색해보세요.'
            : '첫 번째 소식이나 질문을 게시판에 남겨보세요!'}
        </p>
        <button
          onClick={onOpenNewPost}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          새 게시글 작성하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden my-4">
      {posts.map((post) => {
        const isNotice = post.isPinned || post.category === '공지';

        return (
          <article
            key={post.id}
            onClick={() => onSelectPost(post)}
            className={`group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors duration-150 ${
              isNotice ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-slate-50/80'
            }`}
          >
            <div className="flex-1 min-w-0">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-md">
                    <Pin className="w-3 h-3" />
                    고정
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                    categoryColors[post.category] || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {post.category}
                </span>

                {post.tags && post.tags.length > 0 && (
                  <div className="hidden md:flex items-center gap-1">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-slate-400 font-medium hover:text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Preview */}
              <div className="flex items-center gap-2">
                <h2
                  className={`text-base font-bold text-slate-800 group-hover:text-slate-900 group-hover:underline decoration-2 underline-offset-4 decoration-slate-300 truncate ${
                    isNotice ? 'font-black text-amber-950' : ''
                  }`}
                >
                  {post.title}
                </h2>
                {post.commentCount > 0 && (
                  <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full shrink-0">
                    [{post.commentCount}]
                  </span>
                )}
              </div>

              {/* Snippet */}
              <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-1">
                {post.content.replace(/[#*`]/g, '')}
              </p>
            </div>

            {/* Post Meta */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs text-slate-400 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                  {post.author.charAt(0)}
                </div>
                <span>{post.author}</span>
              </div>

              <div className="flex items-center gap-3">
                <time>{formatDate(post.createdAt)}</time>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1" title="조회수">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {post.views}
                  </span>

                  <span className="flex items-center gap-1 text-rose-500 font-medium" title="추천">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {post.likes}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
