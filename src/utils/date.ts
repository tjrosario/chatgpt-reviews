import { Review } from "../types/review";

export const groupReviewsByDate = (reviews: Review[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

  const groups: { [key: string]: Review[] } = {};

  reviews.forEach((review) => {
    const reviewDate = new Date(review.date);
    const reviewDateOnly = new Date(
      reviewDate.getFullYear(),
      reviewDate.getMonth(),
      reviewDate.getDate()
    );

    if (reviewDateOnly.getTime() === today.getTime()) {
      if (!groups["Today"]) groups["Today"] = [];
      groups["Today"].push(review);
    } else if (reviewDateOnly.getTime() === yesterday.getTime()) {
      if (!groups["Yesterday"]) groups["Yesterday"] = [];
      groups["Yesterday"].push(review);
    } else if (reviewDateOnly >= thisWeekStart && reviewDateOnly < today) {
      if (!groups["This week"]) groups["This week"] = [];
      groups["This week"].push(review);
    } else if (
      reviewDateOnly >= lastWeekStart &&
      reviewDateOnly <= lastWeekEnd
    ) {
      if (!groups["Last week"]) groups["Last week"] = [];
      groups["Last week"].push(review);
    } else {
      const monthYear = reviewDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(review);
    }
  });

  return groups;
};
