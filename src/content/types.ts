export type TfnImage = { id: number | null; url: string; alt?: string; width?: number; height?: number };
export type TfnAuthor = { id: number; name: string; slug?: string; avatar?: string; description?: string; url?: string };
export type TfnCategory = { id: number; name: string; slug: string; description?: string; parent?: number };
export type TfnArticle = { id: number; title: string; slug: string; canonicalUrl: string; excerpt: string; contentHtml: string; publishedAt: string; updatedAt: string; author?: TfnAuthor; featuredImage?: TfnImage; images: TfnImage[]; categories: TfnCategory[]; tags: string[]; contentType: string; initiative?: string; metadata?: Record<string, unknown> };
export type TfnPagination = { page: number; perPage: number; total: number; totalPages: number; hasNextPage: boolean };
export type TfnArticlePage = { items: TfnArticle[]; pagination: TfnPagination };
