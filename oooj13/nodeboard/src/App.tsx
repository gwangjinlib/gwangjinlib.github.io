import React, { useState, useEffect, useCallback } from 'react';
import { Post, PostCategory, ApiResponse } from './types';
import { Navbar } from './components/Navbar';
import { CategoryFilter } from './components/CategoryFilter';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { PostFormModal } from './components/PostFormModal';
import { PasswordModal } from './components/PasswordModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Layers, Sparkles, MessageSquare, ListFilter, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [activeCategory, setActiveCategory] = useState<PostCategory>('전체');
  const [activeSort, setActiveSort] = useState<'latest' | 'views' | 'likes' | 'comments'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Password Confirm Modal state
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    isDanger?: boolean;
    onConfirm?: (password: string) => void;
  }>({
    isOpen: false,
    title: '',
  });

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Post List
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        search: searchQuery,
        sortBy: activeSort,
        page: String(page),
        limit: '10',
      });

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data: ApiResponse<Post[]> = await res.json();

      if (data.success && data.data) {
        setPosts(data.data);
        setTotalPosts(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        addToast(data.message || '게시글 목록을 불러오지 못했습니다.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('서버와의 통신 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, activeSort, page, addToast]);

  // Fetch Single Post Detail
  const fetchPostDetail = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data: ApiResponse<Post> = await res.json();

      if (data.success && data.data) {
        setSelectedPost(data.data);
      } else {
        addToast(data.message || '게시글을 찾을 수 없습니다.', 'error');
        setSelectedPostId(null);
      }
    } catch (err) {
      console.error(err);
      addToast('게시글 세부 정보를 가져오는 데 실패했습니다.', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (selectedPostId) {
      fetchPostDetail(selectedPostId);
    } else {
      setSelectedPost(null);
    }
  }, [selectedPostId, fetchPostDetail]);

  // Handle Post Creation or Update Submission
  const handlePostSubmit = async (formData: {
    title: string;
    content: string;
    author: string;
    password: string;
    category: Exclude<PostCategory, '전체'>;
    tags: string[];
  }) => {
    try {
      if (editingPost) {
        // Update Post
        const res = await fetch(`/api/posts/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            password: formData.password,
            category: formData.category,
            tags: formData.tags,
          }),
        });

        const data: ApiResponse<Post> = await res.json();

        if (res.status === 401) {
          addToast('비밀번호가 일치하지 않습니다.', 'error');
          return;
        }

        if (data.success) {
          addToast('게시글이 수정되었습니다.', 'success');
          setIsFormModalOpen(false);
          setEditingPost(null);
          if (selectedPostId === editingPost.id) {
            fetchPostDetail(editingPost.id);
          }
          fetchPosts();
        } else {
          addToast(data.message || '수정에 실패했습니다.', 'error');
        }
      } else {
        // Create Post
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data: ApiResponse<Post> = await res.json();

        if (data.success) {
          addToast('새 게시글이 작성되었습니다.', 'success');
          setIsFormModalOpen(false);
          fetchPosts();
        } else {
          addToast(data.message || '게시글 작성에 실패했습니다.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('요청 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  // Handle Post Delete with Password Prompt
  const handleDeletePostPrompt = (postId: string) => {
    setPasswordModal({
      isOpen: true,
      title: '게시글 삭제 확인',
      description: '게시글 작성 시 입력하셨던 비밀번호를 입력해주세요.',
      isDanger: true,
      onConfirm: async (password: string) => {
        try {
          const res = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
          });

          const data: ApiResponse<null> = await res.json();

          if (res.status === 401) {
            addToast('비밀번호가 일치하지 않습니다.', 'error');
            return;
          }

          if (data.success) {
            addToast('게시글이 삭제되었습니다.', 'success');
            setPasswordModal((prev) => ({ ...prev, isOpen: false }));
            setSelectedPostId(null);
            fetchPosts();
          } else {
            addToast(data.message || '삭제에 실패했습니다.', 'error');
          }
        } catch (err) {
          console.error(err);
          addToast('삭제 요청 실패', 'error');
        }
      },
    });
  };

  // Handle Post Like
  const handleLikePost = async () => {
    if (!selectedPost) return;
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSelectedPost((prev) => (prev ? { ...prev, likes: data.likes } : null));
        addToast('게시글을 추천했습니다!', 'success');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment or Reply
  const handleAddComment = async (commentData: {
    author: string;
    password: string;
    content: string;
    parentId?: string | null;
  }) => {
    if (!selectedPost) return;
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      const data = await res.json();

      if (data.success) {
        addToast('댓글이 작성되었습니다.', 'success');
        fetchPostDetail(selectedPost.id);
        fetchPosts();
      } else {
        addToast(data.message || '댓글 등록 실패', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('댓글 작성 실패', 'error');
    }
  };

  // Delete Comment
  const handleDeleteCommentPrompt = (commentId: string) => {
    if (!selectedPost) return;

    setPasswordModal({
      isOpen: true,
      title: '댓글 삭제 확인',
      description: '댓글 작성 시 설정한 비밀번호를 입력해주세요.',
      isDanger: true,
      onConfirm: async (password: string) => {
        try {
          const res = await fetch(`/api/posts/${selectedPost.id}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
          });

          const data = await res.json();

          if (res.status === 401) {
            addToast('비밀번호가 일치하지 않습니다.', 'error');
            return;
          }

          if (data.success) {
            addToast('댓글이 삭제되었습니다.', 'success');
            setPasswordModal((prev) => ({ ...prev, isOpen: false }));
            fetchPostDetail(selectedPost.id);
            fetchPosts();
          } else {
            addToast(data.message || '댓글 삭제 실패', 'error');
          }
        } catch (err) {
          console.error(err);
          addToast('댓글 삭제 실패', 'error');
        }
      },
    });
  };

  // Like Comment
  const handleLikeComment = async (commentId: string) => {
    if (!selectedPost) return;
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/comments/${commentId}/like`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        fetchPostDetail(selectedPost.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset filter & return to home
  const handleResetToHome = () => {
    setSelectedPostId(null);
    setActiveCategory('전체');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 flex flex-col antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        onOpenNewPostModal={() => {
          setEditingPost(null);
          setIsFormModalOpen(true);
        }}
        onResetToHome={handleResetToHome}
        totalPosts={totalPosts}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {selectedPost ? (
          /* Detailed View */
          <PostDetail
            post={selectedPost}
            onBack={() => setSelectedPostId(null)}
            onLikePost={handleLikePost}
            onEditPost={() => {
              setEditingPost(selectedPost);
              setIsFormModalOpen(true);
            }}
            onDeletePost={() => handleDeletePostPrompt(selectedPost.id)}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteCommentPrompt}
            onLikeComment={handleLikeComment}
            onToast={addToast}
          />
        ) : (
          /* List View */
          <div className="space-y-4">
            {/* Category Filter & Sorting */}
            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setPage(1);
              }}
              activeSort={activeSort}
              onSelectSort={setActiveSort}
            />

            {/* Posts List */}
            <PostList
              posts={posts}
              loading={loading}
              onSelectPost={(post) => setSelectedPostId(post.id)}
              onOpenNewPost={() => {
                setEditingPost(null);
                setIsFormModalOpen(true);
              }}
              searchQuery={searchQuery}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 rounded-xl transition-all shadow-2xs"
                >
                  이전
                </button>
                <span className="text-xs font-bold text-slate-600 px-3">
                  {page} / {totalPages} 페이지
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 rounded-xl transition-all shadow-2xs"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Community Board. Express & React Web Application.</p>
          <p className="flex items-center gap-1.5 font-medium text-slate-500">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>총 {totalPosts}개의 등록된 게시글</span>
          </p>
        </div>
      </footer>

      {/* New / Edit Post Modal */}
      <PostFormModal
        isOpen={isFormModalOpen}
        initialPost={editingPost}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handlePostSubmit}
      />

      {/* Password Confirmation Modal */}
      <PasswordModal
        isOpen={passwordModal.isOpen}
        title={passwordModal.title}
        description={passwordModal.description}
        isDanger={passwordModal.isDanger}
        onClose={() => setPasswordModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={(pwd) => {
          if (passwordModal.onConfirm) {
            passwordModal.onConfirm(pwd);
          }
        }}
      />
    </div>
  );
}
