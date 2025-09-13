import { useDebounce } from "../../hooks/useDebouce";
import { useFilters } from "../../store/filters/FiltersProvider";
import { useReviews } from "../../store/reviews/ReviewsProvider";
import { Loader, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export const FilterBar: React.FC = () => {
  const {
    state: filters,
    actions: { updateFilter },
  } = useFilters();
  const {
    state: reviewsState,
    actions: { fetchReviews },
  } = useReviews();

  const [searchTerm, setSearchTerm] = useState(filters.keyword);

  // Debounce the search term with 500ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedSearchTerm !== filters.keyword) {
      updateFilter("keyword", debouncedSearchTerm);
      updateFilter("page", 1);
      fetchReviews({ ...filters, keyword: debouncedSearchTerm, page: 1 });
    }
  }, [debouncedSearchTerm]); // Remove filters, updateFilter, fetchReviews from dependencies

  // Only sync when filters.keyword changes from external source (not from our own updates)
  useEffect(() => {
    setSearchTerm(filters.keyword);
  }, []); // Remove this problematic effect entirely

  const handleRatingChange = useCallback(
    (value: string) => {
      updateFilter("rating", value);
      updateFilter("page", 1);
      fetchReviews({ ...filters, rating: value, page: 1 });
    },
    [filters, updateFilter, fetchReviews],
  );

  // Check if search is pending (user typed but API call hasn't been made yet)
  const isSearchPending = searchTerm !== filters.keyword;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="keyword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="keyword"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={reviewsState.isLoading}
            />
            {(reviewsState.isLoading || isSearchPending) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>
        <div className="md:w-48">
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by rating
          </label>
          <select
            id="rating"
            value={filters.rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={reviewsState.isLoading}
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>
      </div>
    </div>
  );
};
