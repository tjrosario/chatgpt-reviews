import { Loader, AlertCircle, Search } from "lucide-react";
import { useFilters } from "../../store/filters/FiltersProvider";
import { useReviews } from "../../store/reviews/ReviewsProvider";
import { groupReviewsByDate } from "../../utils/date";
import { ReviewCard } from "./ReviewCard";

export const ReviewsList: React.FC = () => {
  const {
    state: reviewsState,
    actions: { fetchReviews, incrementPage },
  } = useReviews();
  const { state: filters } = useFilters();

  const groupedReviews = groupReviewsByDate(reviewsState.filteredReviews);

  const handleLoadMore = () => {
    incrementPage();
    fetchReviews({ ...filters, page: reviewsState.currentPage + 1 }, true);
  };

  if (reviewsState.isLoading && reviewsState.reviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  if (reviewsState.error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-600">
        <AlertCircle className="w-8 h-8 mb-2" />
        <span className="text-center">{reviewsState.error}</span>
        <button
          onClick={() => fetchReviews(filters)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviewsState.filteredReviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No reviews found matching your criteria.</p>
        <p className="text-sm mt-1">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {reviewsState.filteredReviews.length} of{" "}
          {reviewsState.totalCount} reviews
        </span>
      </div>

      {Object.entries(groupedReviews).map(([dateGroup, reviews]) => (
        <div key={dateGroup} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center justify-between">
            <span>{dateGroup}</span>
            <span className="text-sm font-normal text-gray-500">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </h2>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      ))}

      {reviewsState.hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={reviewsState.isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
          >
            {reviewsState.isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
