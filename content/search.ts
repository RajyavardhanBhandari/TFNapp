import type { TfnArticle, TfnPagination } from './types';
import { getCached, setCached } from './cache';
import { getArticleById, TfnApiError, TFN_WORDPRESS_BASE_URL } from './wordpress';

const SEARCH_PER_PAGE = 10;
type WpSearchResult = { id: number; title?: string; url?: string; type?: string; subtype?: string };

async function searchIds(query: string, page: number, perPage: number): Promise<{ ids: number[]; pagination: TfnPagination }> {
  const normalizedQuery = query.trim();
  const cacheKey = `search:ids:${normalizedQuery.toLowerCase()}:${page}:${perPage}`;
  const cached = getCached<{ ids: number[]; pagination: TfnPagination }>(cacheKey);
  if (cached) return cached;
  const url = new URL(`${TFN_WORDPRESS_BASE_URL}/search`);
  url.searchParams.set('search', normalizedQuery);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('subtype', 'post');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) throw new TfnApiError(`TFN search request failed (${response.status})`, response.status);
    const data = await response.json() as WpSearchResult[];
    const total = Number(response.headers.get('X-WP-Total') ?? data.length);
    const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? (data.length === perPage ? page + 1 : page));
    const result = { ids: data.map((item) => item.id).filter((id) => Number.isInteger(id)), pagination: { page, perPage, total, totalPages, hasNextPage: page < totalPages } };
    setCached(cacheKey, result);
    return result;
  } catch (error) {
    if (error instanceof TfnApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new TfnApiError('TFN search request timed out');
    throw new TfnApiError('Unable to reach TFN search');
  } finally { clearTimeout(timeout); }
}

export async function searchArticles(query: string, params: { page?: number; perPage?: number } = {}): Promise<{ items: TfnArticle[]; pagination: TfnPagination }> {
  const normalizedQuery = query.trim();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? SEARCH_PER_PAGE;
  if (!normalizedQuery) return { items: [], pagination: { page, perPage, total: 0, totalPages: 0, hasNextPage: false } };
  const { ids, pagination } = await searchIds(normalizedQuery, page, perPage);
  const items = await Promise.all(ids.map((id) => getArticleById(id)));
  return { items, pagination };
}
