import { getArticles } from './wordpress';
import type { TfnArticle } from './types';

export async function getQuickFeed(perPage = 24): Promise<TfnArticle[]> {
  const page = await getArticles({ page: 1, perPage });
  const seen = new Set<number>();
  return page.items.filter((article) => {
    if (!article.id || !article.title || seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}
