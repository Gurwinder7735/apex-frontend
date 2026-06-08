import type { RootState } from "@/store";

export const selectKnowledgeStats = (state: RootState) => state.knowledge.stats;
export const selectKnowledgeArticles = (state: RootState) => state.knowledge.articles;
export const selectKnowledgeTotal = (state: RootState) => state.knowledge.total;
export const selectCurrentArticle = (state: RootState) => state.knowledge.currentArticle;
export const selectKnowledgeFavorites = (state: RootState) => state.knowledge.favorites;
export const selectKnowledgeVersions = (state: RootState) => state.knowledge.versions;
export const selectKnowledgeActivities = (state: RootState) => state.knowledge.activities;
export const selectKnowledgeRelated = (state: RootState) => state.knowledge.related;
export const selectKnowledgeLoading = (state: RootState) => state.knowledge.loading;
export const selectKnowledgeDetailLoading = (state: RootState) => state.knowledge.detailLoading;
export const selectKnowledgeError = (state: RootState) => state.knowledge.error;
