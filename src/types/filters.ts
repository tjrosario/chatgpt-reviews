import {
  RESET_FILTERS,
  UPDATE_FILTER,
} from "./../store/filters/filtersActionTypes";

export interface FilterState {
  keyword: string;
  rating: string;
  page: number;
}

export type FilterAction =
  | {
      type: typeof UPDATE_FILTER;
      payload: { key: keyof FilterState; value: string | number };
    }
  | { type: typeof RESET_FILTERS };

export interface FilterContextType {
  actions: any;
  state: FilterState;
}
