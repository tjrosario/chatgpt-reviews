import { FC, ReactNode } from "react";
import { ReviewsProvider } from "./reviews/ReviewsProvider";
import { FiltersProvider } from "./filters/FiltersProvider";

const Store: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ReviewsProvider>
      <FiltersProvider>{children}</FiltersProvider>
    </ReviewsProvider>
  );
};

export default Store;
