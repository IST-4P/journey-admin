import axiosInstance from "../axios";

/**
 * Review Service
 * Handles all review-related API calls
 */

export interface Review {
  id: string;
  deviceId?: string;
  bookingId?: string;
  userId: string;
  rating: number;
  title: string;
  type?: number;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  rentalId?: string;
  updateCount?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Get list of reviews with pagination
 */
export const getReviews = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> => {
  const response = await axiosInstance.get("/review", { params });
  return response;
};

/**
 * Get a single review by ID
 */
export const getReview = async (id: string): Promise<Review> => {
  const response = await axiosInstance.get(`/review/${id}`);
  return response.review;
};

/**
 * Delete a review
 */
export const deleteReview = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/review/${id}`);
};
