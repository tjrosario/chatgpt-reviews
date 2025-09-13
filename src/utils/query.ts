import { FilterState } from "../types/filters";

// Build query parameters for API request
export const buildQueryParams = (filters: FilterState): string => {
  const params = new URLSearchParams();

  // Add keyword search
  if (filters.keyword) {
    params.append("q", filters.keyword);
  }

  // Add rating filter
  if (filters.rating && filters.rating !== "all") {
    params.append("rating", filters.rating);
  }

  // Add pagination
  params.append("page", filters.page.toString());
  params.append("count", "25"); // 25 reviews per page as specified

  // Sort by date (most recent first)
  params.append("sort", "-date");

  return params.toString();
};
