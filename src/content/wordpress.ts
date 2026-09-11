import type {
  TfnArticle,
  TfnArticlePage,
  TfnAuthor,
  TfnCategory,
  TfnImage,
  TfnPagination,
} from './types';
import { getCached, setCached } from './cache';

export const TFN_WORDPRESS_BASE_URL = 'https://thefoundernation.com/wp-json/wp/v2';

type WpPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  author?: number;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  _embedded?: {
    author?: Array<{ id?: number; name?: string; slug?: string; description?: string; link?: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: Array<{ id?: number; source_url?: string; alt_text?: string; media_details?: { width?: number; height?: number } }>;
  };
};

type WpCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
};

type WpTag = { id: number; name: string; slug: string };

export class TfnApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'TfnApiError';
    this.status = status;
  }
}

async function request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<{ data: T; headers: Headers }> {
  const url = new URL(`${TFN_WORDPRESS_BASE_URL}/${path.replace(/^\//, '')}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) throw new TfnApiError(`TFN API request failed (${response.status})`, response.status);
    return { data: (await response.json()) as T, headers: response.headers };
  } catch (error) {
    if (error instanceof TfnApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new TfnApiError('TFN API request timed out');
    throw new TfnApiError(error instanceof Error ? error.message : 'Unable to reach TFN API');
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtml(value = ''): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function imageFromEmbedded(post: WpPost): TfnImage | undefined {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media?.source_url) return undefined;
  return {
    id: media.id ?? null,
    url: media.source_url,
    alt: media.alt_text,
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

function authorFromEmbedded(post: WpPost): TfnAuthor | undefined {
  const author = post._embedded?.author?.[0];
  if (!author?.id || !author.name) return undefined;
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    description: author.description,
    url: author.link,
    avatar: author.avatar_urls?.['96'] ?? author.avatar_urls?.['48'],
  };
}

function normalizePost(post: WpPost, categories: TfnCategory[], tags: WpTag[]): TfnArticle {
  const featuredImage = imageFromEmbedded(post);
  return {
    id: post.id,
    title: stripHtml(post.title?.rendered),
    slug: post.slug,
    canonicalUrl: post.link,
    excerpt: stripHtml(post.excerpt?.rendered),
    contentHtml: post.content?.rendered ?? '',
    publishedAt: post.date,
    updatedAt: post.modified,
    author: authorFromEmbedded(post),
    featuredImage,
    images: featuredImage ? [featuredImage] : [],
    categories,
    tags: tags.map((tag) => tag.name),
    contentType: 'post',
  };
}

export async function getCategories(params: { perPage?: number; page?: number } = {}): Promise<{ items: TfnCategory[]; pagination: TfnPagination }> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 100;
  const cacheKey = `categories:${page}:${perPage}`;
  const cached = getCached<{ items: TfnCategory[]; pagination: TfnPagination }>(cacheKey);
  if (cached) return cached;

  const response = await request<WpCategory[]>('categories', { page, per_page: perPage });
  const total = Number(response.headers.get('X-WP-Total') ?? response.data.length);
  const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);
  const result = {
    items: response.data.map((category) => ({ id: category.id, name: category.name, slug: category.slug, description: category.description, parent: category.parent })),
    pagination: { page, perPage, total, totalPages, hasNextPage: page < totalPages },
  };

  setCached(cacheKey, result);
  return result;
}

export async function getArticles(params: { page?: number; perPage?: number; categoryId?: number } = {}): Promise<TfnArticlePage> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const cacheKey = `articles:${page}:${perPage}:${params.categoryId ?? 'all'}`;
  const cached = getCached<TfnArticlePage>(cacheKey);
  if (cached) return cached;

  const response = await request<WpPost[]>('posts', {
    page,
    per_page: perPage,
    categories: params.categoryId,
    _embed: 1,
  });

  const categoryIds = [...new Set(response.data.flatMap((post) => post.categories ?? []))];
  const tagIds = [...new Set(response.data.flatMap((post) => post.tags ?? []))];
  const [categoryResults, tagResults] = await Promise.all([
    categoryIds.length ? Promise.all(categoryIds.map((id) => request<WpCategory>(`categories/${id}`).then((result) => result.data))) : Promise.resolve([]),
    tagIds.length ? Promise.all(tagIds.map((id) => request<WpTag>(`tags/${id}`).then((result) => result.data))) : Promise.resolve([]),
  ]);

  const categoryMap = new Map(categoryResults.map((category) => [category.id, category]));
  const tagMap = new Map(tagResults.map((tag) => [tag.id, tag]));
  const normalizedCategories = (post: WpPost) => (post.categories ?? []).map((id) => categoryMap.get(id)).filter(Boolean).map((category) => ({ id: category!.id, name: category!.name, slug: category!.slug, description: category!.description, parent: category!.parent }));
  const normalizedTags = (post: WpPost) => (post.tags ?? []).map((id) => tagMap.get(id)).filter(Boolean) as WpTag[];

  const total = Number(response.headers.get('X-WP-Total') ?? response.data.length);
  const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);
  const result = {
    items: response.data.map((post) => normalizePost(post, normalizedCategories(post), normalizedTags(post))),
    pagination: { page, perPage, total, totalPages, hasNextPage: page < totalPages },
  };

  setCached(cacheKey, result);
  return result;
}
