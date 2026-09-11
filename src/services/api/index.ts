export type ApiRequestOptions = {
  signal?: AbortSignal;
};

export const api = {
  // Phase 1 will add the WordPress-backed content services here.
  async healthCheck(_options?: ApiRequestOptions) {
    return { ok: true as const };
  },
};
