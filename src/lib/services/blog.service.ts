import axiosInstance from "../axios";
import type {
  CreateBlogRequest,
  DeleteBlogRequest,
  GetBlogResponse,
  GetManyBlogsRequest,
  GetManyBlogsResponse,
  UpdateBlogRequest,
} from "../types/blog.types";

/**
 * Blog Service
 * Handles all blog-related API calls
 */

/**
 * Get list of blogs with pagination and filters
 */
export const getManyBlogs = async (
  params?: GetManyBlogsRequest
): Promise<GetManyBlogsResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get("/blog", { params });
};

/**
 * Get a single blog by ID
 */
export const getBlog = async (id: string): Promise<GetBlogResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get(`/blog/${id}`);
};

/**
 * Create a new blog
 */
export const createBlog = async (
  data: CreateBlogRequest
): Promise<GetBlogResponse> => {
  return await axiosInstance.post("/blog", data);
};

/**
 * Update an existing blog
 */
export const updateBlog = async (
  id: string,
  data: UpdateBlogRequest
): Promise<GetBlogResponse> => {
  return await axiosInstance.put(`/blog/${id}`, data);
};

/**
 * Delete a blog
 */
export const deleteBlog = async (params: DeleteBlogRequest): Promise<void> => {
  const { id } = params;
  await axiosInstance.delete(`/blog/${id}`);
};
