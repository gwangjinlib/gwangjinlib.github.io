export type PostCategory = '전체' | '공지' | '일반' | '질문';

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null; // For nested replies (대댓글)
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: Exclude<PostCategory, '전체'>;
  createdAt: string;
  updatedAt?: string;
  views: number;
  likes: number;
  commentCount: number;
  isPinned?: boolean;
  tags?: string[];
  comments?: Comment[];
}

export interface PostFilterOptions {
  category?: PostCategory;
  search?: string;
  sortBy?: 'latest' | 'views' | 'likes' | 'comments';
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  totalPages?: number;
}
