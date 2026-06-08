export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  authorId?: string;
  authorName?: string;
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  version: number;
  isDeleted: boolean;
  viewCount: number;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeVersion {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
}

export interface KnowledgeActivity {
  id: string;
  articleId: string;
  articleTitle?: string;
  action: string;
  description?: string;
  performedBy?: string;
  performedByName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface KnowledgeStats {
  totalArticles: number;
  totalVersions: number;
  totalFavorites: number;
  byCategory: Record<string, number>;
}

export interface ArticleCreate {
  title: string;
  category?: string;
  tags?: string;
  content?: string;
}

export interface ArticleUpdate {
  title?: string;
  category?: string;
  tags?: string;
  content?: string;
}
