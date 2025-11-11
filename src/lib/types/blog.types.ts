/**
 * Blog Types
 * Type definitions for blog-related data structures
 */

export interface Blog {
  id: string;
  title: string;
  content?: string;
  type: string;
  region: string;
  tag?: string;
  summary?: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListItem {
  id: string;
  title: string;
  type: string;
  region: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types based on API structure
export interface GetManyBlogsRequest {
  title?: string;
  tag?: string;
  type?: string;
  region?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GetManyBlogsResponse {
  blogs: BlogListItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetBlogResponse extends Blog {}

export interface CreateBlogRequest {
  title: string;
  content: string;
  type: string;
  region: string;
  thumbnail: string;
  tag?: string;
  summary?: string;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  type?: string;
  region?: string;
  thumbnail?: string;
  tag?: string;
  summary?: string;
}

export interface DeleteBlogRequest {
  id: string;
}
