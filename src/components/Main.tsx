import { useEffect } from "react";
import { FilterBar } from "./filters/FilterBar";
import { ReviewsList } from "./reviews/ReviewsList";
import { useFilters } from "../store/filters/FiltersProvider";
import { useReviews } from "../store/reviews/ReviewsProvider";

function Main() {
  const {
    actions: { fetchReviews },
  } = useReviews();
  const { state: filters } = useFilters();

  useEffect(() => {
    fetchReviews(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ChatGPT Reviews Explorer
          </h1>
          <p className="text-gray-600">
            Explore user reviews for the ChatGPT iOS app
          </p>
        </header>

        <FilterBar />
        <ReviewsList />
      </div>
    </div>
  );
}

export default Main;
