import React, { useState, useEffect } from 'react';
import { Post, PostCategory } from '../types';
import { X, PenSquare, Tag, Lock, User, Bold, List, Code, AlertCircle } from 'lucide-react';

interface PostFormModalProps {
  isOpen: boolean;
  initialPost?: Post | null;
  onClose: () => void;
  onSubmit: (postData: {
    title: string;
    content: string;
    author: string;
    password: string;
    category: Exclude<PostCategory, '전체'>;
    tags: string[];
  }) => void;
}

const CATEGORIES: Exclude<PostCategory, '전체'>[] = ['일반', '질문', '공지'];

export const PostFormModal: React.FC<PostFormModalProps> = ({
  isOpen,
  initialPost,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<Exclude<PostCategory, '전체'>>('일반');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setContent(initialPost.content || '');
      setAuthor(initialPost.author || '');
      setPassword('');
      setCategory(initialPost.category || '일반');
      setTags(initialPost.tags || []);
    } else {
      setTitle('');
      setContent('');
      setAuthor('');
      setPassword('');
      setCategory('일반');
      setTags([]);
    }
  }, [initialPost, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}${prefix}텍스트${suffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim() || !password.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      password: password.trim(),
      category,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
              <PenSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialPost ? '게시글 수정' : '새 게시글 작성'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">카테고리 선택</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Author & Password Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">작성자 닉네임</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="닉네임 입력"
                  required
                  disabled={Boolean(initialPost)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                비밀번호 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="수정/삭제용 비밀번호"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력해주세요"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            />
          </div>

          {/* Content & Toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600">내용</label>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => handleInsertFormat('**', '**')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="굵게"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('\n- ')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="목록"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('`', '`')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="코드"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="자유롭게 소식이나 궁금한 점을 적어보세요."
              rows={8}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white resize-y transition-all"
            />
          </div>

          {/* Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">태그 입력</label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="태그 입력 후 추가 (예: React, Nodejs)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                태그 추가
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all"
            >
              {initialPost ? '게시글 수정 완료' : '게시글 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
