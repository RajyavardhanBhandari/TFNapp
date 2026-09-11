import type { TfnArticle, TfnArticlePage, TfnAuthor, TfnCategory, TfnImage, TfnPagination } from './types';
import { getCached, setCached } from './cache';

export const TFN_WORDPRESS_BASE_URL = 'https://thefoundernation.com/wp-json/wp/v2';

export type TfnWordPressCapabilities = {
  postTypes: Array<{ slug: string; name: string; restBase: string; taxonomies: string[] }>;
  taxonomies: Array<{ slug: string; name: string; restBase: string }>;
};

type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
  description?: string;
  parent?: number;
};

type WpMediaSize = { source_url?: string; width?: number; height?: number };

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
    author?: Array<{
      id?: number;
      name?: string;
      slug?: string;
      description?: string;
      link?: string;
      avatar_urls?: Record<string, string>;
    }>;
    'wp:featuredmedia'?: Array<{
      id?: number;
      source_url?: string;
      alt_text?: string;
      media_details?: {
        width?: number;
        height?: number;
        sizes?: Record<string, WpMediaSize>;
      };
    }>;
    'wp:term'?: WpTerm[][];
  };
};

type WpCategory = { id: number; name: string; slug: string; description?: string; parent?: number };
type WpTag = { id: number; name: string; slug: string };
type WpType = { name: string; slug: string; rest_base: string; taxonomies?: string[] };
type WpTaxonomy = { name: string; slug: string; rest_base: string };

const SUMMARY_POST_FIELDS = [
  'id',
  'date',
  'modified',
  'slug',
  'link',
  'title.rendered',
  'excerpt.rendered',
  'author',
  'categories',
  'tags',
  'featured_media',
  '_links',
  '_embedded.author.id',
  '_embedded.author.name',
  '_embedded.author.slug',
  '_embedded.author.description',
  '_embedded.author.link',
  '_embedded.author.avatar_urls',
  '_embedded.wp:featuredmedia.id',
  '_embedded.wp:featuredmedia.source_url',
  '_embedded.wp:featuredmedia.alt_text',
  '_embedded.wp:featuredmedia.media_details.width',
  '_embedded.wp:featuredmedia.media_details.height',
  '_embedded.wp:featuredmedia.media_details.sizes.large.source_url',
  '_embedded.wp:featuredmedia.media_details.sizes.large.width',
  '_embedded.wp:featuredmedia.media_details.sizes.large.height',
  '_embedded.wp:featuredmedia.media_details.sizes.medium_large.source_url',
  '_embedded.wp:featuredmedia.media_details.sizes.medium_large.width',
  '_embedded.wp:featuredmedia.media_details.sizes.medium_large.height',
  '_embedded.wp:featuredmedia.media_details.sizes.medium.source_url',
  '_embedded.wp:featuredmedia.media_details.sizes.medium.width',
  '_embedded.wp:featuredmedia.media_details.sizes.medium.height',
  '_embedded.wp:featuredmedia.media_details.sizes.thumbnail.source_url',
  '_embedded.wp:term.id',
  '_embedded.wp:term.name',
  '_embedded.wp:term.slug',
  '_embedded.wp:term.taxonomy',
  '_embedded.wp:term.description',
  '_embedded.wp:term.parent',
].join(',');

export class TfnApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'TfnApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<{ data: T; headers: Headers }> {
  const url = new URL(`${TFN_WORDPRESS_BASE_URL}/${path.replace(/^\//, '')}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new TfnApiError(`TFN API request failed (${response.status})`, response.status);
    }
    return { data: (await response.json()) as T, headers: response.headers };
  } catch (error) {
    if (error instanceof TfnApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TfnApiError('TFN API request timed out');
    }
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

  const sizes = media.media_details?.sizes ?? {};
  const preferred =
    sizes.large?.source_url ??
    sizes.medium_large?.source_url ??
    sizes.medium?.source_url ??
    media.source_url;
  const thumbnail = sizes.medium?.source_url ?? sizes.thumbnail?.source_url ?? preferred;
  const selected = sizes.large ?? sizes.medium_large ?? sizes.medium;

  return {
    id: media.id ?? null,
    url: preferred,
    thumbnailUrl: thumbnail,
    alt: media.alt_text,
    width: selected?.width ?? media.media_details?.width,
    height: selected?.height ?? media.media_details?.height,
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

function categoryFromTerm(term: WpTerm): TfnCategory {
  return {
    id: term.id,
    name: term.name,
    slug: term.slug,
    description: term.description,
    parent: term.parent,
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

function pagination(page: number, perPage: number, headers: Headers, fallbackLength: number): TfnPagination {
  const total = Number(headers.get('X-WP-Total') ?? fallbackLength);
  const totalPages = Number(headers.get('X-WP-TotalPages') ?? 1);
  return { page, perPage, total, totalPages, hasNextPage: page < totalPages };
}

export async function getWordPressCapabilities(): Promise<TfnWordPressCapabilities> {
  const cached = getCached<TfnWordPressCapabilities>('capabilities');
  if (cached) return cached;

  const [typesResponse, taxonomiesResponse] = await Promise.all([
    request<Record<string, WpType>>('types'),
    request<Record<string, WpTaxonomy>>('taxonomies'),
  ]);

  const result = {
    postTypes: Object.entries(typesResponse.data).map(([slug, type]) => ({
      slug,
      name: type.name,
      restBase: type.rest_base,
      taxonomies: type.taxonomies ?? [],
    })),
    taxonomies: Object.entries(taxonomiesResponse.data).map(([slug, taxonomy]) => ({
      slug,
      name: taxonomy.name,
      restBase: taxonomy.rest_base,
    })),
  };

  setCached('capabilities', result);
  return result;
}

export async function getCategories(
  params: { perPage?: number; page?: number } = {},
): Promise<{ items: TfnCategory[]; pagination: TfnPagination }> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 100;
  const cacheKey = `categories:${page}:${perPage}`;
  const cached = getCached<{ items: TfnCategory[]; pagination: TfnPagination }>(cacheKey);
  if (cached) return cached;

  const response = await request<WpCategory[]>('categories', {
    page,
    per_page: perPage,
    _fields: 'id,name,slug,description,parent',
  });

  const result = {
    items: response.data.map(categoryFromTerm),
    pagination: pagination(page, perPage, response.headers, response.data.length),
  };

  setCached(cacheKey, result);
  return result;
}

async function normalizePosts(posts: WpPost[]): Promise<TfnArticle[]> {
  const embeddedTerms = posts.map((post) => post._embedded?.['wp:term']?.flat() ?? []);
  const embeddedCategories = new Map<number, WpTerm>();
  const embeddedTags = new Map<number, WpTerm>();

  embeddedTerms.flat().forEach((term) => {
    if (term.taxonomy === 'category') embeddedCategories.set(term.id, term);
    if (term.taxonomy === 'post_tag') embeddedTags.set(term.id, term);
  });

  const categoryIds = [
    ...new Set(posts.flatMap((post) => post.categories ?? []).filter((id) => !embeddedCategories.has(id))),
  ];
  const tagIds = [
    ...new Set(posts.flatMap((post) => post.tags ?? []).filter((id) => !embeddedTags.has(id))),
  ];

  const [categoryResults, tagResults] = await Promise.all([
    categoryIds.length
      ? Promise.all(categoryIds.map((id) => request<WpCategory>(`categories/${id}`).then((result) => result.data)))
      : Promise.resolve([]),
    tagIds.length
      ? Promise.all(tagIds.map((id) => request<WpTag>(`tags/${id}`).then((result) => result.data)))
      : Promise.resolve([]),
  ]);

  categoryResults.forEach((category) => embeddedCategories.set(category.id, category));
  tagResults.forEach((tag) => embeddedTags.set(tag.id, tag));

  return posts.map((post) => {
    const categories = (post.categories ?? [])
      .map((id) => embeddedCategories.get(id))
      .filter(Boolean)
      .map((category) => categoryFromTerm(category!));
    const tags = (post.tags ?? [])
      .map((id) => embeddedTags.get(id))
      .filter(Boolean) as WpTag[];

    return normalizePost(post, categories, tags);
  });
}

export async function getArticles(
  params: { page?: number; perPage?: number; categoryId?: number; includeContent?: boolean } = {},
): Promise<TfnArticlePage> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const includeContent = params.includeContent ?? true;
  const cacheKey = `articles:${page}:${perPage}:${params.categoryId ?? 'all'}:${includeContent ? 'full' : 'summary'}`;
  const cached = getCached<TfnArticlePage>(cacheKey);
  if (cached) return cached;

  const fields = includeContent ? undefined : SUMMARY_POST_FIELDS;
  const response = await request<WpPost[]>('posts', {
    page,
    per_page: perPage,
    categories: params.categoryId,
    status: 'publish',
    _embed: 'author,wp:featuredmedia,wp:term',
    _fields: fields,
  });

  const result = {
    items: await normalizePosts(response.data),
    pagination: pagination(page, perPage, response.headers, response.data.length),
  };

  setCached(cacheKey, result);
  return result;
}

export async function getArticleById(id: number): Promise<TfnArticle> {
  const cacheKey = `article:id:${id}`;
  const cached = getCached<TfnArticle>(cacheKey);
  if (cached) return cached;

  const response = await request<WpPost>(`posts/${id}`, { _embed: 1 });
  const [article] = await normalizePosts([response.data]);
  setCached(cacheKey, article);
  return article;
}

export async function getArticleBySlug(slug: string): Promise<TfnArticle | undefined> {
  const cacheKey = `article:slug:${slug}`;
  const cached = getCached<TfnArticle>(cacheKey);
  if (cached) return cached;

  const response = await request<WpPost[]>('posts', { slug, _embed: 1, per_page: 1 });
  if (!response.data.length) return undefined;

  const [article] = await normalizePosts(response.data);
  setCached(cacheKey, article);
  return article;
}

export async function getRelatedArticlesForArticle(article: TfnArticle, perPage = 12): Promise<TfnArticle[]> {
  const categoryId = article.categories[0]?.id;
  const result = await getArticles({ page: 1, perPage, categoryId, includeContent: false });
  return result.items.filter((candidate) => candidate.id !== article.id);
}
