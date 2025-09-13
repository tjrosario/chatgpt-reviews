import { createContext, FC, ReactNode, useContext, useReducer } from "react";
import { reviewsReducer, initialState, initializer } from "./reviewsReducer";
import {
  APPEND_REVIEWS,
  INCREMENT_PAGE,
  SET_ERROR,
  SET_LOADING,
  SET_REVIEWS,
} from "./reviewsActionTypes";
import { FilterState } from "../../types/filters";
import {
  AppfiguresResponse,
  AppfiguresReview,
  Review,
  ReviewContextType,
  ReviewsResponse,
} from "../../types/review";
import { api } from "../../utils/apiClient";
import { buildQueryParams } from "../../utils/query";

export const ReviewsContext = createContext<ReviewContextType | undefined>(
  undefined
);

export const useReviews = (): ReviewContextType => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};

// Appfigures API configuration
const API_BASE_URL = "https://appfigures.com/_u/careers/api/reviews";

// Transform API/mock response to our internal format
const transformReview = (apiReview: AppfiguresReview): Review => ({
  id: apiReview.id,
  rating: Math.round(parseFloat(apiReview.stars)), // Convert "1.00" to 1
  title: apiReview.title,
  body: apiReview.review,
  author: apiReview.author,
  date: apiReview.date.split("T")[0], // Extract date part from ISO string
  version: apiReview.version,
  country: apiReview.iso,
  store: apiReview.store,
  productName: apiReview.product_name,
  hasResponse: apiReview.has_response,
  isDeleted: apiReview.deleted,
  originalTitle: apiReview.original_title,
  originalReview: apiReview.original_review,
});

async function fetchReviews(filters: FilterState): Promise<ReviewsResponse> {
  try {
    const queryParams = buildQueryParams(filters);
    const url = `${API_BASE_URL}?${queryParams}`;

    const data: AppfiguresResponse | undefined = await api.get(url);

    if (data) {
      // Transform API response to our internal format
      const transformedReviews = data.reviews.map(transformReview);

      return {
        reviews: transformedReviews,
        total: data.total,
        page: data.this_page,
        pages: data.pages,
      };
    }

    return {
      reviews: [],
      total: 0,
      page: 0,
      pages: 0,
    };
  } catch (error) {
    console.error("API Error:", error);

    return {
      reviews: [],
      total: 0,
      page: 0,
      pages: 0,
    };
  }
}

export const ReviewsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(
    reviewsReducer,
    initialState,
    initializer
  );

  const actions = {
    fetchReviews: async (filters: FilterState, append = false) => {
      try {
        dispatch({ type: SET_LOADING, payload: true });
        dispatch({ type: SET_ERROR, payload: null });

        const response = await fetchReviews(filters);

        if (append) {
          dispatch({
            type: APPEND_REVIEWS,
            payload: {
              reviews: response.reviews,
              hasMore: response.page < response.pages,
            },
          });
        } else {
          dispatch({
            type: SET_REVIEWS,
            payload: {
              reviews: response.reviews,
              totalCount: response.total,
              hasMore: response.page < response.pages,
            },
          });
        }
      } catch (error) {
        dispatch({
          type: SET_ERROR,
          payload:
            error instanceof Error ? error.message : "Failed to fetch reviews",
        });
      }
    },
    incrementPage: () => dispatch({ type: INCREMENT_PAGE }),
  };

  return (
    <ReviewsContext.Provider value={{ state, actions }}>
      {children}
    </ReviewsContext.Provider>
  );
};
