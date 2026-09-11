import { getCached, setCached } from './cache';
import { getArticles, getCategories } from './wordpress';
import type { TfnArticle, TfnCategory } from './types';

export type HomeContent = {
  latest: TfnArticle[];
  featured?: TfnArticle;
  forYou: TfnArticle[];
  funding: TfnArticle[];
  founderStories: TfnArticle[];
  startupStories: TfnArticle[];
  technology: TfnArticle[];
  ai: TfnArticle[];
  categories: TfnCategory[];
};

export type HomeBaseContent = Pick<HomeContent, 'latest' | 'featured' | 'forYou' | 'categories'>;
export type HomeSections = Pick<HomeContent, 'funding' | 'founderStories' | 'startupStories' | 'technology' | 'ai'>;

function findCategory(categories: TfnCategory[], slugs: string[], names: string[]): TfnCategory | undefined {
  return categories.find(
    (category) => slugs.includes(category.slug.toLowerCase()) || names.includes(category.name.toLowerCase()),
  );
}

function uniqueArticles(articles: TfnArticle[]): TfnArticle[] {
  const seen = new Set<number>();
  return articles.filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

const empty = (perPage = 2): Awaited<ReturnType<typeof getArticles>> => ({
  items: [],
  pagination: { page: 1, perPage, total: 0, totalPages: 0, hasNextPage: false },
});

export async function getHomeBaseContent(): Promise<HomeBaseContent> {
  const cacheKey = 'home:base:v1';
  const cached = getCached<HomeBaseContent>(cacheKey);
  if (cached) return cached;

  const [latestResult, categoryResult] = await Promise.allSettled([
    getArticles({ page: 1, perPage: 5, includeContent: false }),
    getCategories({ perPage: 100 }),
  ]);

  if (latestResult.status === 'rejected') throw latestResult.reason;

  const latest = uniqueArticles(latestResult.value.items);
  const result: HomeBaseContent = {
    latest,
    featured: latest[0],
    forYou: latest.slice(1),
    categories: categoryResult.status === 'fulfilled' ? categoryResult.value.items : [],
  };

  setCached(cacheKey, result);
  return result;
}

export async function getHomeSections(categories: TfnCategory[]): Promise<HomeSections> {
  const cacheKey = 'home:sections:v1';
  const cached = getCached<HomeSections>(cacheKey);
  if (cached) return cached;

  const fundingCategory = findCategory(categories, ['funding'], ['funding']);
  const founderCategory = findCategory(categories, ['founder-first', 'founder-stories'], ['founder first', 'founder stories']);
  const startupCategory = findCategory(categories, ['startup-stories'], ['startup stories']);
  const technologyCategory = findCategory(categories, ['technology'], ['technology']);
  const aiCategory = findCategory(categories, ['artificial-intelligence', 'ai-economy'], ['artificial intelligence', 'ai economy']);

  const requests = [
    fundingCategory ? getArticles({ page: 1, perPage: 2, categoryId: fundingCategory.id, includeContent: false }) : Promise.resolve(empty()),
    founderCategory ? getArticles({ page: 1, perPage: 2, categoryId: founderCategory.id, includeContent: false }) : Promise.resolve(empty()),
    startupCategory ? getArticles({ page: 1, perPage: 2, categoryId: startupCategory.id, includeContent: false }) : Promise.resolve(empty()),
    technologyCategory ? getArticles({ page: 1, perPage: 2, categoryId: technologyCategory.id, includeContent: false }) : Promise.resolve(empty()),
    aiCategory ? getArticles({ page: 1, perPage: 2, categoryId: aiCategory.id, includeContent: false }) : Promise.resolve(empty()),
  ];

  const [fundingResult, founderResult, startupResult, technologyResult, aiResult] = await Promise.allSettled(requests);
  const sectionItems = (result: typeof fundingResult) => result.status === 'fulfilled' ? result.value.items : [];

  const result: HomeSections = {
    funding: uniqueArticles(sectionItems(fundingResult)),
    founderStories: uniqueArticles(sectionItems(founderResult)),
    startupStories: uniqueArticles(sectionItems(startupResult)),
    technology: uniqueArticles(sectionItems(technologyResult)),
    ai: uniqueArticles(sectionItems(aiResult)),
  };

  setCached(cacheKey, result);
  return result;
}

export async function getHomeContent(): Promise<HomeContent> {
  const base = await getHomeBaseContent();
  const sections = await getHomeSections(base.categories);
  return { ...base, ...sections };
}
