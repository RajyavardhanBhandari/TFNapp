import type { TfnArticle } from './types';

/**
 * Remove executable/interactive HTML that should never be interpreted as article content.
 * WordPress remains the source of truth; this only sanitizes the HTML at the rendering boundary.
 */
export function sanitizeArticleHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export function getArticleReadingTime(article: TfnArticle): number {
  const plainText = article.contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plainText ? plainText.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 220));
}

export function getRelatedArticles(current: TfnArticle, candidates: TfnArticle[], limit = 4): TfnArticle[] {
  const categoryIds = new Set(current.categories.map((category) => category.id));
  const tagSet = new Set(current.tags.map((tag) => tag.toLowerCase()));
  return candidates
    .filter((article) => article.id !== current.id)
    .map((article) => {
      const categoryScore = article.categories.filter((category) => categoryIds.has(category.id)).length * 3;
      const tagScore = article.tags.filter((tag) => tagSet.has(tag.toLowerCase())).length;
      const authorScore = current.author?.id && article.author?.id === current.author.id ? 2 : 0;
      const initiativeScore = current.initiative && article.initiative === current.initiative ? 3 : 0;
      return { article, score: categoryScore + tagScore + authorScore + initiativeScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}
