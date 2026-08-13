import React from 'react';
import { MessageSquarePlus, Search, PenSquare, RefreshCw, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewPostModal: () => void;
  onResetToHome: () => void;
  totalPosts: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewPostModal,
  onResetToHome,
  totalPosts,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetToHome}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:bg-slate-800 transition-all">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                forum
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full">
                Node.js Express
              </span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="제목, 내용, 작성자, 태그 검색..."
              className="w-full pl-10 pr-9 py-2 bg-slate-100/80 border border-transparent rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="검색어 초기화"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewPostModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all"
          >
            <PenSquare className="w-4 h-4" />
            <span>글쓰기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
