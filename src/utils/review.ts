import { AppfiguresReview, Review } from "../types/review";

// Transform API/mock response to our internal format
export const transformReview = (apiReview: AppfiguresReview): Review => ({
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
