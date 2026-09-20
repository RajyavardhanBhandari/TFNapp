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

function findCategory(categories: TfnCategory[], slugs: string[], names: string[]): TfnCategory | undefined {
  return categories.find((category) => slugs.includes(category.slug.toLowerCase()) || names.includes(category.name.toLowerCase()));
}

function uniqueArticles(articles: TfnArticle[]): TfnArticle[] {
  const seen = new Set<number>();
  return articles.filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

export async function getHomeContent(): Promise<HomeContent> {
  const cacheKey = 'home:content:v1';
  const cached = getCached<HomeContent>(cacheKey);
  if (cached) return cached;

  let categories: TfnCategory[] = [];
  try {
    categories = (await getCategories({ perPage: 100 })).items;
  } catch {
    // Categories are enrichment data. The latest feed should still load if the taxonomy endpoint is unavailable.
  }

  const fundingCategory = findCategory(categories, ['funding'], ['funding']);
  const founderCategory = findCategory(categories, ['founder-first', 'founder-stories'], ['founder first', 'founder stories']);
  const startupCategory = findCategory(categories, ['startup-stories'], ['startup stories']);
  const technologyCategory = findCategory(categories, ['technology'], ['technology']);
  const aiCategory = findCategory(categories, ['artificial-intelligence', 'ai-economy'], ['artificial intelligence', 'ai economy']);

  const empty = {
    items: [],
    pagination: { page: 1, perPage: 4, total: 0, totalPages: 0, hasNextPage: false },
  };

  const safeArticles = async (params: Parameters<typeof getArticles>[0]) => {
    try {
      return await getArticles(params);
    } catch {
      return empty;
    }
  };

  const [latestPage, fundingPage, founderPage, startupPage, technologyPage, aiPage] = await Promise.all([
    getArticles({ page: 1, perPage: 8 }),
    fundingCategory ? safeArticles({ page: 1, perPage: 4, categoryId: fundingCategory.id }) : Promise.resolve(empty),
    founderCategory ? safeArticles({ page: 1, perPage: 4, categoryId: founderCategory.id }) : Promise.resolve(empty),
    startupCategory ? safeArticles({ page: 1, perPage: 4, categoryId: startupCategory.id }) : Promise.resolve(empty),
    technologyCategory ? safeArticles({ page: 1, perPage: 4, categoryId: technologyCategory.id }) : Promise.resolve(empty),
    aiCategory ? safeArticles({ page: 1, perPage: 4, categoryId: aiCategory.id }) : Promise.resolve(empty),
  ]);

  const latest = uniqueArticles(latestPage.items);
  const result: HomeContent = {
    latest,
    featured: latest[0],
    forYou: latest.slice(1, 5),
    funding: uniqueArticles(fundingPage.items),
    founderStories: uniqueArticles(founderPage.items),
    startupStories: uniqueArticles(startupPage.items),
    technology: uniqueArticles(technologyPage.items),
    ai: uniqueArticles(aiPage.items),
    categories,
  };

  setCached(cacheKey, result);
  return result;
}
