// api.ts
// Note: Works in browsers and Node 18+ (global fetch). For older Node, add a fetch polyfill/types.

/** Error thrown for non-2xx responses (and optionally surfaced in retry logic). */
export class ApiError extends Error {
  status?: number;
  body?: unknown;
  url?: string;
  headers: Headers;

  constructor(
    message: string,
    opts: {
      status?: number;
      body?: unknown;
      url?: string;
      headers?: Headers;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.body = opts.body;
    this.url = opts.url;
    this.headers = opts.headers ?? new Headers();
  }
}

type QueryValue = string | number | boolean | null | undefined;
type Query =
  | Record<string, QueryValue | QueryValue[]>
  | URLSearchParams
  | undefined;

type ParseMode = "auto" | "json" | "text" | "blob" | "arrayBuffer" | "none";

export interface RequestOptions {
  /** HTTP method (default: GET via helpers) */
  method?: string;
  /** Request headers */
  headers?: HeadersInit;
  /** Body value; plain objects are JSON-encoded automatically */
  body?: any;
  /** Query string key/values (arrays append multiple) */
  query?: Query;
  /** Abort via caller signal */
  signal?: AbortSignal;
  /** Per-request timeout override (ms) */
  timeoutMs?: number;
  /** Per-request retry override (attempts) */
  retries?: number;
  /** Response parsing behavior (default: 'auto') */
  parse?: ParseMode;
}

export interface CreateApiOptions {
  baseUrl?: string; // "", "/api", or absolute
  defaultHeaders?: HeadersInit;
  timeoutMs?: number; // default 10_000
  retries?: number; // default 0
  retryDelay?:
    | number
    | ((attempt: number, res: Response | undefined, err: unknown) => number);
  retryOn?: (
    res: Response | undefined,
    err: unknown
  ) => boolean | Promise<boolean>;
  onRequest?: (
    url: string,
    init: RequestInit & { headers: Headers }
  ) => void | Promise<void>;
  onResponse?: (res: Response) => void | Promise<void>;
}

export interface ApiClient {
  request<T = unknown>(
    path: string,
    options?: RequestOptions
  ): Promise<T | undefined>;
  get<T = unknown>(
    path: string,
    opts?: Omit<RequestOptions, "method" | "body">
  ): Promise<T | undefined>;
  post<T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method">
  ): Promise<T | undefined>;
  put<T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method">
  ): Promise<T | undefined>;
  patch<T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method">
  ): Promise<T | undefined>;
  del<T = unknown>(
    path: string,
    opts?: Omit<RequestOptions, "method" | "body">
  ): Promise<T | undefined>;
}

/** Create a small fetch-based API client. */
export function createApi(opts: CreateApiOptions = {}): ApiClient {
  const {
    baseUrl = "",
    defaultHeaders,
    timeoutMs = 10_000,
    retries = 0,
    retryDelay,
    retryOn,
    onRequest,
    onResponse,
  } = opts;

  const defaultRetryOn = (res: Response | undefined, err: unknown): boolean => {
    if (err instanceof ApiError && typeof err.status === "number") {
      return err.status === 408 || err.status === 429 || err.status >= 500;
    }
    // Network errors from fetch commonly surface as TypeError
    if (err && (err as Error).name === "TypeError") return true;
    return false;
  };

  const computeDelay = (
    attempt: number,
    res: Response | undefined,
    err: unknown
  ): number => {
    if (typeof retryDelay === "function") return retryDelay(attempt, res, err);
    if (typeof retryDelay === "number") return retryDelay;
    // exponential backoff with jitter, capped
    const base = Math.min(1000 * 2 ** attempt, 8000);
    return Math.round(base / 2 + Math.random() * (base / 2));
  };

  const buildUrl = (path: string, query?: Query): string => {
    const isAbsolutePath = /^https?:\/\//i.test(String(path));

    // Absolute base for relative paths
    const origin =
      typeof window !== "undefined" && (window as any).location
        ? window.location.origin
        : "http://localhost";

    let absBase: string | undefined;
    if (!isAbsolutePath) {
      if (!baseUrl) {
        absBase = origin + "/";
      } else if (/^https?:\/\//i.test(baseUrl)) {
        absBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
      } else {
        // relative base like "/api" or "api"
        const basePath = String(baseUrl)
          .replace(/^\/+/, "")
          .replace(/\/+$/, "");
        absBase =
          origin.replace(/\/+$/, "") + "/" + (basePath ? basePath + "/" : "");
      }
    }

    const normalizedPath = isAbsolutePath
      ? String(path)
      : String(path).replace(/^\/+/, "");

    const urlObj = isAbsolutePath
      ? new URL(normalizedPath)
      : new URL(normalizedPath, absBase);

    if (query) {
      if (query instanceof URLSearchParams) {
        // Merge provided params
        query.forEach((v, k) => urlObj.searchParams.append(k, v));
      } else {
        Object.entries(query).forEach(([k, v]) => {
          if (v == null) return;
          if (Array.isArray(v)) {
            v.forEach((item) => {
              if (item != null) urlObj.searchParams.append(k, String(item));
            });
          } else {
            urlObj.searchParams.set(k, String(v));
          }
        });
      }
    }
    return urlObj.toString();
  };

  const toBodyAndHeaders = (
    init: RequestInit
  ): { body: BodyInit | null | undefined; headers: Headers } => {
    const headers = new Headers(init.headers || defaultHeaders || {});
    let body = (init as any).body as any;

    const isPlainObject =
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer);

    if (isPlainObject) {
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json, text/plain;q=0.9, */*;q=0.8");
    }
    return { body, headers };
  };

  const parseResponse = async <T>(
    res: Response,
    parse: ParseMode | undefined
  ): Promise<T | undefined> => {
    if (parse === "none") return undefined;
    if (res.status === 204) return undefined;

    const ct = res.headers.get("content-type") || "";
    const auto = parse === undefined || parse === "auto";

    if (parse === "json" || (auto && ct.includes("application/json"))) {
      return (await res.json()) as T;
    }
    if (parse === "text" || (auto && ct.startsWith("text/"))) {
      return (await res.text()) as unknown as T;
    }
    if (parse === "blob") return (await res.blob()) as unknown as T;
    if (parse === "arrayBuffer")
      return (await res.arrayBuffer()) as unknown as T;

    // fallback
    return (await res.text()) as unknown as T;
  };

  const withTimeout = (controller: AbortController, ms: number) => {
    const id = setTimeout(() => controller.abort(), ms);
    return () => clearTimeout(id);
  };

  type AbortControllerWithCleanup = AbortController & { _cleanup?: () => void };

  async function coreFetch<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T | undefined> {
    const url = buildUrl(path, options.query);

    // Merge and manage signals for timeout + caller abort
    const controller: AbortControllerWithCleanup = new AbortController();
    const externalSignal = options.signal;
    if (externalSignal) {
      if (externalSignal.aborted)
        controller.abort((externalSignal as any).reason);
      else {
        const onAbort = () => controller.abort((externalSignal as any).reason);
        externalSignal.addEventListener("abort", onAbort, { once: true });
        controller._cleanup = () =>
          externalSignal.removeEventListener("abort", onAbort);
      }
    }
    const cleanupTimeout = withTimeout(
      controller,
      options.timeoutMs ?? timeoutMs
    );

    const init: RequestInit & { headers?: HeadersInit; body?: any } = {
      method: options.method || "GET",
      ...options,
      signal: controller.signal,
    };

    const { body, headers } = toBodyAndHeaders(init);
    init.body = body;
    init.headers = headers;

    if (onRequest) await onRequest(url, { ...init, headers });

    try {
      const res = await fetch(url, init);
      if (onResponse) await onResponse(res);

      if (!res.ok) {
        let errBody: unknown;
        try {
          const ct = res.headers.get("content-type") || "";
          errBody = ct.includes("application/json")
            ? await res.json()
            : await res.text();
        } catch {
          // ignore parse failure
        }
        const message =
          (errBody && typeof errBody === "object" && (errBody as any).error) ||
          `${res.status} ${res.statusText}`;
        throw new ApiError(message, {
          status: res.status,
          body: errBody,
          url,
          headers: res.headers,
        });
      }

      return await parseResponse<T>(res, options.parse);
    } finally {
      cleanupTimeout();
      controller._cleanup?.();
    }
  }

  async function request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T | undefined> {
    const maxAttempts = 1 + (options.retries ?? retries);
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        return await coreFetch<T>(path, options);
      } catch (err) {
        const abortedByCaller =
          (err as Error | undefined)?.name === "AbortError" &&
          options.signal?.aborted;

        const shouldRetry = await (retryOn ?? defaultRetryOn)(undefined, err);

        if (!shouldRetry || abortedByCaller || attempt === maxAttempts - 1) {
          throw err;
        }
        const delay = computeDelay(attempt, undefined, err);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }

    // unreachable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return undefined;
  }

  const get = <T = unknown>(
    path: string,
    opts?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(path, { ...opts, method: "GET" });

  const post = <T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method">
  ) => request<T>(path, { ...opts, method: "POST", body });

  const put = <T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method">
  ) => request<T>(path, { ...opts, method: "PUT", body });

  const patch = <T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method">
  ) => request<T>(path, { ...opts, method: "PATCH", body });

  const del = <T = unknown>(
    path: string,
    opts?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(path, { ...opts, method: "DELETE" });

  return { request, get, post, put, patch, del };
}
