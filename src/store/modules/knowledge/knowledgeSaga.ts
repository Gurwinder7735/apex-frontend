import { call, put, takeLatest } from "redux-saga/effects";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { KnowledgeArticle, KnowledgeVersion, KnowledgeActivity, KnowledgeStats } from "@/types/models/Knowledge";
import {
  fetchKnowledgeStatsRequest,
  fetchKnowledgeStatsSuccess,
  fetchKnowledgeStatsFailure,
  fetchArticlesRequest,
  fetchArticlesSuccess,
  fetchArticlesFailure,
  fetchArticleRequest,
  fetchArticleSuccess,
  fetchArticleFailure,
  createArticleRequest,
  createArticleSuccess,
  createArticleFailure,
  updateArticleRequest,
  updateArticleSuccess,
  updateArticleFailure,
  deleteArticleRequest,
  deleteArticleSuccess,
  deleteArticleFailure,
  toggleFavoriteRequest,
  toggleFavoriteSuccess,
  toggleFavoriteFailure,
  fetchFavoritesRequest,
  fetchFavoritesSuccess,
  fetchFavoritesFailure,
  fetchVersionsRequest,
  fetchVersionsSuccess,
  fetchVersionsFailure,
  restoreVersionRequest,
  restoreVersionSuccess,
  restoreVersionFailure,
  fetchActivitiesRequest,
  fetchActivitiesSuccess,
  fetchActivitiesFailure,
  fetchRelatedRequest,
  fetchRelatedSuccess,
  fetchRelatedFailure,
} from "./knowledgeSlice";

function* handleFetchStats() {
  try {
    const response: ApiResponse<KnowledgeStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.stats, method: "GET",
    });
    yield put(fetchKnowledgeStatsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchKnowledgeStatsFailure(error.message));
  }
}

function* handleFetchArticles(action: any) {
  try {
    const response: ApiResponse<KnowledgeArticle[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.list, method: "GET", params: action.payload || {},
    });
    yield put(fetchArticlesSuccess({ items: response.data, total: response.data.length }));
  } catch (error: any) {
    yield put(fetchArticlesFailure(error.message));
  }
}

function* handleFetchArticle(action: any) {
  try {
    const response: ApiResponse<KnowledgeArticle> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.detail(action.payload), method: "GET",
    });
    yield put(fetchArticleSuccess(response.data));
  } catch (error: any) {
    yield put(fetchArticleFailure(error.message));
  }
}

function* handleCreateArticle(action: any) {
  try {
    const response: ApiResponse<KnowledgeArticle> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.create, method: "POST", data: action.payload,
    });
    yield put(createArticleSuccess(response.data));
  } catch (error: any) {
    yield put(createArticleFailure(error.message));
  }
}

function* handleUpdateArticle(action: any) {
  try {
    const { id, data } = action.payload;
    const response: ApiResponse<KnowledgeArticle> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.update(id), method: "PUT", data,
    });
    yield put(updateArticleSuccess(response.data));
  } catch (error: any) {
    yield put(updateArticleFailure(error.message));
  }
}

function* handleDeleteArticle(action: any) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.delete(action.payload), method: "DELETE",
    });
    yield put(deleteArticleSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteArticleFailure(error.message));
  }
}

function* handleToggleFavorite(action: any) {
  try {
    const response: ApiResponse<{ isFavorited: boolean }> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.favorite(action.payload), method: "POST",
    });
    yield put(toggleFavoriteSuccess({ id: action.payload, isFavorited: response.data.isFavorited }));
  } catch (error: any) {
    yield put(toggleFavoriteFailure(error.message));
  }
}

function* handleFetchFavorites() {
  try {
    const response: ApiResponse<KnowledgeArticle[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.favorites, method: "GET",
    });
    yield put(fetchFavoritesSuccess(response.data));
  } catch (error: any) {
    yield put(fetchFavoritesFailure(error.message));
  }
}

function* handleFetchVersions(action: any) {
  try {
    const response: ApiResponse<KnowledgeVersion[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.versions(action.payload), method: "GET",
    });
    yield put(fetchVersionsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchVersionsFailure(error.message));
  }
}

function* handleRestoreVersion(action: any) {
  try {
    const { id, version } = action.payload;
    const response: ApiResponse<KnowledgeArticle> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.restoreVersion(id, version), method: "POST",
    });
    yield put(restoreVersionSuccess(response.data));
  } catch (error: any) {
    yield put(restoreVersionFailure(error.message));
  }
}

function* handleFetchActivities(action: any) {
  try {
    const response: ApiResponse<KnowledgeActivity[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.activities(action.payload), method: "GET",
    });
    yield put(fetchActivitiesSuccess(response.data));
  } catch (error: any) {
    yield put(fetchActivitiesFailure(error.message));
  }
}

function* handleFetchRelated(action: any) {
  try {
    const response: ApiResponse<KnowledgeArticle[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.knowledge.related(action.payload), method: "GET",
    });
    yield put(fetchRelatedSuccess(response.data));
  } catch (error: any) {
    yield put(fetchRelatedFailure(error.message));
  }
}

export function* knowledgeSaga() {
  yield takeLatest(fetchKnowledgeStatsRequest.type, handleFetchStats);
  yield takeLatest(fetchArticlesRequest.type, handleFetchArticles);
  yield takeLatest(fetchArticleRequest.type, handleFetchArticle);
  yield takeLatest(createArticleRequest.type, handleCreateArticle);
  yield takeLatest(updateArticleRequest.type, handleUpdateArticle);
  yield takeLatest(deleteArticleRequest.type, handleDeleteArticle);
  yield takeLatest(toggleFavoriteRequest.type, handleToggleFavorite);
  yield takeLatest(fetchFavoritesRequest.type, handleFetchFavorites);
  yield takeLatest(fetchVersionsRequest.type, handleFetchVersions);
  yield takeLatest(restoreVersionRequest.type, handleRestoreVersion);
  yield takeLatest(fetchActivitiesRequest.type, handleFetchActivities);
  yield takeLatest(fetchRelatedRequest.type, handleFetchRelated);
}
