import React from 'react';
import { PostCategory } from '../types';
import { ArrowUpDown, Flame, Clock, Eye, MessageSquare } from 'lucide-react';

interface CategoryFilterProps {
  activeCategory: PostCategory;
  onSelectCategory: (category: PostCategory) => void;
  activeSort: 'latest' | 'views' | 'likes' | 'comments';
  onSelectSort: (sort: 'latest' | 'views' | 'likes' | 'comments') => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORIES: { label: PostCategory; icon: string }[] = [
  { label: '전체', icon: '📌' },
  { label: '공지', icon: '📢' },
  { label: '일반', icon: '💬' },
  { label: '질문', icon: '❓' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
  categoryCounts,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200/60">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {CATEGORIES.map(({ label, icon }) => {
          const isActive = activeCategory === label;
          const count = categoryCounts?.[label];

          return (
            <button
              key={label}
              onClick={() => onSelectCategory(label)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-1 shrink-0 bg-slate-100/80 p-1 rounded-xl">
        <button
          onClick={() => onSelectSort('latest')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeSort === 'latest'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>최신순</span>
        </button>

        <button
          onClick={() => onSelectSort('likes')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeSort === 'likes'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>추천순</span>
        </button>

        <button
          onClick={() => onSelectSort('views')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeSort === 'views'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>조회순</span>
        </button>

        <button
          onClick={() => onSelectSort('comments')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeSort === 'comments'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>댓글순</span>
        </button>
      </div>
    </div>
  );
};
