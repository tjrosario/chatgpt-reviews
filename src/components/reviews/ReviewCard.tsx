import { Review } from "../../types/review";
import { StarRating } from "../ratings/StarRating";
import { Flag } from "lucide-react";
import { ReactCountryFlag } from "react-country-flag";

export const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const renderCountryFlag = (countryCode: string) => {
    try {
      return (
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{ width: "16px", height: "12px" }}
          title={countryCode}
        />
      );
    } catch (error) {
      return <Flag className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <StarRating rating={review.rating} />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {review.country && (
            <span
              className="flex items-center border border-gray-400"
              title={review.country}
            >
              {renderCountryFlag(review.country)}
            </span>
          )}
          <span>{formatDate(review.date)}</span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
        {review.title}
      </h3>
      <p className="text-gray-700 mb-4 leading-relaxed">{review.body}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-600 font-medium">
            By {review.author}
          </div>
          {review.hasResponse && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Developer responded</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
          {review.version && <span>v{review.version}</span>}
          {review.store && (
            <span className="capitalize">{review.store} Store</span>
          )}
        </div>
      </div>
    </div>
  );
};
