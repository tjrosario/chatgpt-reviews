import {
  APPEND_REVIEWS,
  INCREMENT_PAGE,
  RESET_PAGE,
  SET_ERROR,
  SET_FILTERED_REVIEWS,
  SET_LOADING,
  SET_REVIEWS,
} from "./../store/reviews/reviewsActionTypes";
import { FilterState } from "./filters";

export interface ReviewState {
  reviews: Review[];
  filteredReviews: Review[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
}

// Interface for the actual Appfigures API response structure
export interface AppfiguresReview {
  id: string;
  author: string;
  title: string;
  review: string;
  original_title: string;
  original_review: string;
  stars: string; // API returns as string like "1.00"
  iso: string; // Country code
  version: string;
  date: string; // ISO date string
  deleted: boolean;
  has_response: boolean;
  product: number;
  product_id: number;
  product_name: string;
  vendor_id: string;
  store: string;
  weight: number;
  predicted_langs: string[];
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
  version?: string;
  country?: string;
  store?: string;
  productName?: string;
  hasResponse?: boolean;
  isDeleted?: boolean;
  originalTitle?: string;
  originalReview?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  page: number;
  pages: number;
  total: number
}

export interface AppfiguresResponse {
  reviews: AppfiguresReview[];
  total: number;
  this_page: number;
  pages: number;
}

export type ReviewAction =
  | { type: typeof SET_LOADING; payload: boolean }
  | { type: typeof SET_ERROR; payload: string | null }
  | {
      type: typeof SET_REVIEWS;
      payload: { reviews: Review[]; totalCount: number; hasMore: boolean };
    }
  | {
      type: typeof APPEND_REVIEWS;
      payload: { reviews: Review[]; hasMore: boolean };
    }
  | { type: typeof SET_FILTERED_REVIEWS; payload: Review[] }
  | { type: typeof INCREMENT_PAGE }
  | { type: typeof RESET_PAGE };

export interface ReviewContextType {
  actions: any;
  state: ReviewState;
}
