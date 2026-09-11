import { getCached, setCached } from './cache';
import { getArticles, getCategories } from './wordpress';
import type { TfnArticle, TfnCategory } from './types';
export type HomeContent = { latest: TfnArticle[]; featured?: TfnArticle; forYou: TfnArticle[]; funding: TfnArticle[]; founderStories: TfnArticle[]; startupStories: TfnArticle[]; technology: TfnArticle[]; ai: TfnArticle[]; categories: TfnCategory[] };
function findCategory(categories: TfnCategory[], slugs: string[], names: string[]): TfnCategory | undefined { return categories.find((category) => slugs.includes(category.slug.toLowerCase()) || names.includes(category.name.toLowerCase())); }
function uniqueArticles(articles: TfnArticle[]): TfnArticle[] { const seen = new Set<number>(); return articles.filter((article) => { if (seen.has(article.id)) return false; seen.add(article.id); return true; }); }
const empty = (perPage = 4): Awaited<ReturnType<typeof getArticles>> => ({ items: [], pagination: { page: 1, perPage, total: 0, totalPages: 0, hasNextPage: false } });
export async function getHomeContent(): Promise<HomeContent> {
 const cacheKey='home:content:v1'; const cached=getCached<HomeContent>(cacheKey); if(cached) return cached;
 const categoryPage=await getCategories({perPage:100}); const categories=categoryPage.items;
 const fundingCategory=findCategory(categories,['funding'],['funding']); const founderCategory=findCategory(categories,['founder-first','founder-stories'],['founder first','founder stories']); const startupCategory=findCategory(categories,['startup-stories'],['startup stories']); const technologyCategory=findCategory(categories,['technology'],['technology']); const aiCategory=findCategory(categories,['artificial-intelligence','ai-economy'],['artificial intelligence','ai economy']);
 const requests = [
   getArticles({page:1,perPage:6}),
   fundingCategory?getArticles({page:1,perPage:4,categoryId:fundingCategory.id}):Promise.resolve(empty()),
   founderCategory?getArticles({page:1,perPage:4,categoryId:founderCategory.id}):Promise.resolve(empty()),
   startupCategory?getArticles({page:1,perPage:4,categoryId:startupCategory.id}):Promise.resolve(empty()),
   technologyCategory?getArticles({page:1,perPage:4,categoryId:technologyCategory.id}):Promise.resolve(empty()),
   aiCategory?getArticles({page:1,perPage:4,categoryId:aiCategory.id}):Promise.resolve(empty()),
 ];
 const [latestResult,fundingResult,founderResult,startupResult,technologyResult,aiResult] = await Promise.allSettled(requests);
 if (latestResult.status === 'rejected') throw latestResult.reason;
 const latestPage = latestResult.value;
 const sectionItems = (result: typeof fundingResult) => result.status === 'fulfilled' ? result.value.items : [];
 const latest=uniqueArticles(latestPage.items); const result={latest,featured:latest[0],forYou:latest.slice(1,5),funding:uniqueArticles(sectionItems(fundingResult)),founderStories:uniqueArticles(sectionItems(founderResult)),startupStories:uniqueArticles(sectionItems(startupResult)),technology:uniqueArticles(sectionItems(technologyResult)),ai:uniqueArticles(sectionItems(aiResult)),categories}; setCached(cacheKey,result); return result;
}
