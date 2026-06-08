import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { KnowledgeArticle, KnowledgeVersion, KnowledgeActivity, KnowledgeStats } from "@/types/models/Knowledge";

interface KnowledgeState {
  articles: KnowledgeArticle[];
  favorites: KnowledgeArticle[];
  currentArticle: KnowledgeArticle | null;
  versions: KnowledgeVersion[];
  activities: KnowledgeActivity[];
  related: KnowledgeArticle[];
  stats: KnowledgeStats | null;
  total: number;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: KnowledgeState = {
  articles: [],
  favorites: [],
  currentArticle: null,
  versions: [],
  activities: [],
  related: [],
  stats: null,
  total: 0,
  loading: false,
  detailLoading: false,
  error: null,
};

type ArticlesQuery = { search?: string; category?: string; tag?: string; skip?: number; limit?: number };

const knowledgeSlice = createSlice({
  name: "knowledge",
  initialState,
  reducers: {
    fetchKnowledgeStatsRequest(state, _action: PayloadAction<void>) { state.loading = true; state.error = null; },
    fetchKnowledgeStatsSuccess(state, action: PayloadAction<KnowledgeStats>) { state.loading = false; state.stats = action.payload; },
    fetchKnowledgeStatsFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchArticlesRequest(state, _action: PayloadAction<ArticlesQuery | undefined>) { state.loading = true; state.error = null; },
    fetchArticlesSuccess(state, action: PayloadAction<{ items: KnowledgeArticle[]; total: number }>) { state.loading = false; state.articles = action.payload.items; state.total = action.payload.total; },
    fetchArticlesFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchArticleRequest(state, _action: PayloadAction<string>) { state.detailLoading = true; state.error = null; },
    fetchArticleSuccess(state, action: PayloadAction<KnowledgeArticle>) { state.detailLoading = false; state.currentArticle = action.payload; },
    fetchArticleFailure(state, action: PayloadAction<string>) { state.detailLoading = false; state.error = action.payload; },
    clearCurrentArticle(state) { state.currentArticle = null; state.versions = []; state.activities = []; state.related = []; },

    createArticleRequest(state, _action: PayloadAction<{ title: string; category?: string; tags?: string; content?: string }>) { state.loading = true; state.error = null; },
    createArticleSuccess(state, action: PayloadAction<KnowledgeArticle>) { state.loading = false; state.articles.unshift(action.payload); state.total += 1; },
    createArticleFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    updateArticleRequest(state, _action: PayloadAction<{ id: string; data: { title?: string; category?: string; tags?: string; content?: string } }>) { state.loading = true; state.error = null; },
    updateArticleSuccess(state, action: PayloadAction<KnowledgeArticle>) { state.loading = false; state.currentArticle = action.payload; const idx = state.articles.findIndex((a) => a.id === action.payload.id); if (idx >= 0) state.articles[idx] = action.payload; },
    updateArticleFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    deleteArticleRequest(state, _action: PayloadAction<string>) { state.loading = true; state.error = null; },
    deleteArticleSuccess(state, action: PayloadAction<string>) { state.loading = false; state.articles = state.articles.filter((a) => a.id !== action.payload); state.total -= 1; state.currentArticle = null; },
    deleteArticleFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    toggleFavoriteRequest(state, _action: PayloadAction<string>) { state.error = null; },
    toggleFavoriteSuccess(state, action: PayloadAction<{ id: string; isFavorited: boolean }>) { if (state.currentArticle?.id === action.payload.id) state.currentArticle.isFavorited = action.payload.isFavorited; const idx = state.articles.findIndex((a) => a.id === action.payload.id); if (idx >= 0) state.articles[idx].isFavorited = action.payload.isFavorited; },
    toggleFavoriteFailure(state, action: PayloadAction<string>) { state.error = action.payload; },

    fetchFavoritesRequest(state, _action: PayloadAction<void>) { state.loading = true; state.error = null; },
    fetchFavoritesSuccess(state, action: PayloadAction<KnowledgeArticle[]>) { state.loading = false; state.favorites = action.payload; },
    fetchFavoritesFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchVersionsRequest(state, _action: PayloadAction<string>) { state.loading = true; state.error = null; },
    fetchVersionsSuccess(state, action: PayloadAction<KnowledgeVersion[]>) { state.loading = false; state.versions = action.payload; },
    fetchVersionsFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    restoreVersionRequest(state, _action: PayloadAction<{ id: string; version: number }>) { state.loading = true; state.error = null; },
    restoreVersionSuccess(state, action: PayloadAction<KnowledgeArticle>) { state.loading = false; state.currentArticle = action.payload; },
    restoreVersionFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchActivitiesRequest(state, _action: PayloadAction<string>) { state.loading = true; state.error = null; },
    fetchActivitiesSuccess(state, action: PayloadAction<KnowledgeActivity[]>) { state.loading = false; state.activities = action.payload; },
    fetchActivitiesFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchRelatedRequest(state, _action: PayloadAction<string>) { state.error = null; },
    fetchRelatedSuccess(state, action: PayloadAction<KnowledgeArticle[]>) { state.related = action.payload; },
    fetchRelatedFailure(state, action: PayloadAction<string>) { state.error = action.payload; },
  },
});

export const {
  fetchKnowledgeStatsRequest, fetchKnowledgeStatsSuccess, fetchKnowledgeStatsFailure,
  fetchArticlesRequest, fetchArticlesSuccess, fetchArticlesFailure,
  fetchArticleRequest, fetchArticleSuccess, fetchArticleFailure, clearCurrentArticle,
  createArticleRequest, createArticleSuccess, createArticleFailure,
  updateArticleRequest, updateArticleSuccess, updateArticleFailure,
  deleteArticleRequest, deleteArticleSuccess, deleteArticleFailure,
  toggleFavoriteRequest, toggleFavoriteSuccess, toggleFavoriteFailure,
  fetchFavoritesRequest, fetchFavoritesSuccess, fetchFavoritesFailure,
  fetchVersionsRequest, fetchVersionsSuccess, fetchVersionsFailure,
  restoreVersionRequest, restoreVersionSuccess, restoreVersionFailure,
  fetchActivitiesRequest, fetchActivitiesSuccess, fetchActivitiesFailure,
  fetchRelatedRequest, fetchRelatedSuccess, fetchRelatedFailure,
} = knowledgeSlice.actions;

export default knowledgeSlice.reducer;
