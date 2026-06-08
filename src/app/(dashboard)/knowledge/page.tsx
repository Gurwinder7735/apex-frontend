"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Statistic, Row, Col, Input, Select, Tag, Space, Typography, Empty, Spin, Drawer, Form, App } from "antd";
import { Plus, BookOpen, RefreshCw, Star, Search, FileText, Clock, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectKnowledgeStats, selectKnowledgeArticles, selectKnowledgeFavorites, selectKnowledgeLoading } from "@/store/modules/knowledge/knowledgeSelectors";
import { fetchKnowledgeStatsRequest, fetchArticlesRequest, createArticleRequest, fetchFavoritesRequest } from "@/store/modules/knowledge/knowledgeSlice";
import type { KnowledgeArticle } from "@/types/models/Knowledge";

const categoryColors: Record<string, string> = {
  business: "blue", technical: "purple", operations: "orange", templates: "green", learnings: "cyan",
};
const categoryLabels: Record<string, string> = {
  business: "Business", technical: "Technical", operations: "Operations", templates: "Templates", learnings: "Learnings",
};

export default function KnowledgePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectKnowledgeStats);
  const articles = useAppSelector(selectKnowledgeArticles);
  const favorites = useAppSelector(selectKnowledgeFavorites);
  const loading = useAppSelector(selectKnowledgeLoading);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchKnowledgeStatsRequest());
    dispatch(fetchArticlesRequest({ limit: 100 }));
    dispatch(fetchFavoritesRequest());
  }, [dispatch]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      dispatch(fetchArticlesRequest({ search: value || undefined, category: categoryFilter, limit: 100 }));
    },
    [dispatch, categoryFilter],
  );

  const handleCategoryFilter = (cat?: string) => {
    setCategoryFilter(cat);
    dispatch(fetchArticlesRequest({ search: search || undefined, category: cat, limit: 100 }));
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      dispatch(createArticleRequest(values));
      setCreateDrawerOpen(false);
      createForm.resetFields();
      message.success("Article created");
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Knowledge Hub" subtitle="Company brain — processes, learnings, templates, and more" />
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setCreateDrawerOpen(true); createForm.resetFields(); }}>
          New Article
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="!rounded-xl !border-zinc-200 !shadow-sm" loading={loading}>
            <Statistic title="Total Articles" prefix={<BookOpen className="w-4 h-4 text-zinc-400 mr-1" />} value={stats?.totalArticles || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="!rounded-xl !border-zinc-200 !shadow-sm" loading={loading}>
            <Statistic title="Versions" prefix={<RefreshCw className="w-4 h-4 text-blue-500 mr-1" />} value={stats?.totalVersions || 0} valueStyle={{ color: "#3b82f6" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="!rounded-xl !border-zinc-200 !shadow-sm" loading={loading}>
            <Statistic title="Favorites" prefix={<Star className="w-4 h-4 text-yellow-500 mr-1" />} value={stats?.totalFavorites || 0} valueStyle={{ color: "#eab308" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="!rounded-xl !border-zinc-200 !shadow-sm" loading={loading}>
            <div className="flex flex-wrap gap-1">
              {(Object.entries(stats?.byCategory || {})).map(([cat, count]) => (
                <Tag key={cat} color={categoryColors[cat] || "default"}>{categoryLabels[cat] || cat}: {count}</Tag>
              ))}
              {(!stats || Object.keys(stats.byCategory).length === 0) && <Typography.Text className="text-xs text-zinc-400">No categories</Typography.Text>}
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            prefix={<Search className="w-4 h-4 text-zinc-400" />}
            placeholder="Search articles..."
            className="max-w-sm"
            allowClear
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            allowClear
            placeholder="Filter by category"
            className="min-w-[180px]"
            value={categoryFilter}
            onChange={handleCategoryFilter}
            options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
          />
        </div>
      </Card>

      {favorites.length > 0 && (
        <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={<span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Favorites</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.slice(0, 6).map((fav) => (
              <button key={fav.id} onClick={() => router.push(`/knowledge/${fav.id}`)} className="text-left p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all group">
                <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 block truncate">{fav.title}</Typography.Text>
                <Tag color={categoryColors[fav.category] || "default"} className="!mt-1 !text-[10px] !px-1.5 !py-0">{categoryLabels[fav.category] || fav.category}</Tag>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="All Articles">
        {loading && articles.length === 0 ? (
          <div className="flex justify-center py-12"><Spin /></div>
        ) : articles.length === 0 ? (
          <Empty description="No articles yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setCreateDrawerOpen(true)}>Create your first article</Button>
          </Empty>
        ) : (
          <div className="divide-y divide-zinc-100">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => router.push(`/knowledge/${article.id}`)}
                className="w-full text-left flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{article.title}</Typography.Text>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
                    <Tag color={categoryColors[article.category] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{categoryLabels[article.category] || article.category}</Tag>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.viewCount}</span>
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />v{article.version}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(article.updatedAt).toLocaleDateString()}</span>
                    {article.authorName && <span>by {article.authorName}</span>}
                  </div>
                </div>
                {article.isFavorited && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Drawer title="New Article" width={640} open={createDrawerOpen} onClose={() => setCreateDrawerOpen(false)} footer={<Space className="w-full justify-end"><Button onClick={() => setCreateDrawerOpen(false)}>Cancel</Button><Button type="primary" onClick={handleCreate}>Create Article</Button></Space>} destroyOnClose>
        <Form form={createForm} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Required" }]}><Input placeholder="e.g. Client Onboarding Process" /></Form.Item>
          <Form.Item name="category" label="Category" initialValue="business">
            <Select options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="tags" label="Tags (comma-separated)"><Input placeholder="e.g. onboarding, process, sales" /></Form.Item>
          <Form.Item name="content" label="Content"><Input.TextArea rows={12} placeholder="Write your article content here..." /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
