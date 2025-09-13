import { createApi, ApiError } from "./api";

export const api = createApi({
  baseUrl: "/api",
  timeoutMs: 12_000,
  retries: 2, // you can also pass per-request { retries: 1 }
  retryOn: (res: Response | undefined, err: unknown): boolean => {
    if (err instanceof ApiError && err.status) {
      return err.status === 408 || err.status === 429 || err.status >= 500;
    }
    // network errors
    return !!err && (err as Error).name === "TypeError";
  },
});
