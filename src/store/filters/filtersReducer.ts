import { FilterAction, FilterState } from "../../types/filters";
import { RESET_FILTERS, UPDATE_FILTER } from "./filtersActionTypes";

export const initialState: FilterState = {
  keyword: "",
  rating: "all",
  page: 1,
};

export const initializer = (initialValue = initialState) => {
  return initialValue;
};

export const filtersReducer = (
  state: FilterState,
  action: FilterAction
): FilterState => {
  switch (action.type) {
    case UPDATE_FILTER:
      return { ...state, [action.payload.key]: action.payload.value };

    case RESET_FILTERS:
      return { ...state, keyword: "", rating: "all", page: 1 };

    default:
      return state;
  }
};
