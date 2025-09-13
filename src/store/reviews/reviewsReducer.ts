import { ReviewAction, ReviewState } from "../../types/review";
import {
  APPEND_REVIEWS,
  INCREMENT_PAGE,
  RESET_PAGE,
  SET_ERROR,
  SET_FILTERED_REVIEWS,
  SET_LOADING,
  SET_REVIEWS,
} from "./reviewsActionTypes";

export const initialState: ReviewState = {
  reviews: [],
  filteredReviews: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 0,
  hasMore: false,
};

export const initializer = (initialValue = initialState) => {
  return initialValue;
};

export const reviewsReducer = (
  state: ReviewState,
  action: ReviewAction
): ReviewState => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload };
    case SET_REVIEWS:
      return {
        ...state,
        reviews: action.payload.reviews,
        filteredReviews: action.payload.reviews,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        currentPage: 1,
        isLoading: false,
        error: null,
      };
    case APPEND_REVIEWS:
      const newReviews = [...state.reviews, ...action.payload.reviews];
      return {
        ...state,
        reviews: newReviews,
        filteredReviews: newReviews,
        hasMore: action.payload.hasMore,
        isLoading: false,
      };
    case SET_FILTERED_REVIEWS:
      return { ...state, filteredReviews: action.payload };
    case INCREMENT_PAGE:
      return { ...state, currentPage: state.currentPage + 1 };
    case RESET_PAGE:
      return { ...state, currentPage: 1 };
    default:
      return state;
  }
};
