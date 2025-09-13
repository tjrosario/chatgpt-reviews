import { createContext, FC, ReactNode, useContext, useReducer } from "react";
import { filtersReducer, initialState, initializer } from "./filtersReducer";
import { RESET_FILTERS, UPDATE_FILTER } from "./filtersActionTypes";
import { FilterContextType, FilterState } from "../../types/filters";

export const FiltersContext = createContext<FilterContextType | undefined>(
  undefined
);

export const useFilters = (): FilterContextType => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};

export const FiltersProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(
    filtersReducer,
    initialState,
    initializer
  );

  const actions = {
    resetFilters: () => {
      dispatch({ type: RESET_FILTERS });
    },
    updateFilter: (key: keyof FilterState, value: string | number) => {
      dispatch({ type: UPDATE_FILTER, payload: { key, value } });
    },
  };

  return (
    <FiltersContext.Provider value={{ state, actions }}>
      {children}
    </FiltersContext.Provider>
  );
};
