"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tag, Card, Tabs, Typography, Empty, Spin, Space, Drawer, Form, Input, Select, Modal, App } from "antd";
import { ArrowLeft, BookOpen, Star, Edit3, Trash2, RefreshCw, Clock, Eye, RotateCcw, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectCurrentArticle, selectKnowledgeVersions, selectKnowledgeActivities, selectKnowledgeRelated, selectKnowledgeLoading } from "@/store/modules/knowledge/knowledgeSelectors";
import { fetchArticleRequest, clearCurrentArticle, updateArticleRequest, deleteArticleRequest, toggleFavoriteRequest, fetchVersionsRequest, restoreVersionRequest, fetchActivitiesRequest, fetchRelatedRequest } from "@/store/modules/knowledge/knowledgeSlice";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const categoryColors: Record<string, string> = {
  business: "blue", technical: "purple", operations: "orange", templates: "green", learnings: "cyan",
};
const categoryLabels: Record<string, string> = {
  business: "Business", technical: "Technical", operations: "Operations", templates: "Templates", learnings: "Learnings",
};

export default function ArticleDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const article = useAppSelector(selectCurrentArticle);
  const versions = useAppSelector(selectKnowledgeVersions);
  const activities = useAppSelector(selectKnowledgeActivities);
  const related = useAppSelector(selectKnowledgeRelated);
  const loading = useAppSelector(selectKnowledgeLoading);

  const articleId = params.articleId as string;
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (articleId) {
      dispatch(fetchArticleRequest(articleId));
      dispatch(fetchVersionsRequest(articleId));
      dispatch(fetchActivitiesRequest(articleId));
      dispatch(fetchRelatedRequest(articleId));
    }
    return () => { dispatch(clearCurrentArticle()); };
  }, [articleId, dispatch]);

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      dispatch(updateArticleRequest({ id: articleId, data: values }));
      setEditDrawerOpen(false);
      message.success("Article updated");
    } catch {}
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete article",
      content: `Are you sure you want to delete "${article?.title}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => {
        dispatch(deleteArticleRequest(articleId));
        router.push(APP_ROUTES.knowledge);
      },
    });
  };

  const handleRestoreVersion = (version: number) => {
    Modal.confirm({
      title: "Restore version",
      content: `Restore v${version}? This will create a new version with the restored content.`,
      okText: "Restore",
      onOk: () => dispatch(restoreVersionRequest({ id: articleId, version })),
    });
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavoriteRequest(articleId));
  };

  if (!article) {
    return <div className="flex justify-center py-32"><Spin size="large" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.knowledge)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">
          Back to Knowledge Hub
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{article.title}</Typography.Title>
                <Tag color={categoryColors[article.category] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">{categoryLabels[article.category] || article.category}</Tag>
              </div>
              <Typography.Text className="text-zinc-500 text-sm">
                v{article.version} &middot; {article.viewCount} views
                {article.authorName && <> &middot; by {article.authorName}</>}
                {article.lastUpdatedByName && <> &middot; last edited by {article.lastUpdatedByName}</>}
              </Typography.Text>
            </div>
          </div>
          <Space>
            <Button icon={<Star className={`w-4 h-4 ${article.isFavorited ? "fill-yellow-500 text-yellow-500" : ""}`} />} onClick={handleToggleFavorite}>
              {article.isFavorited ? "Favorited" : "Favorite"}
            </Button>
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => { editForm.setFieldsValue({ ...article, tags: article.tags.join(", ") }); setEditDrawerOpen(true); }}>
              Edit
            </Button>
            <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
          </Space>
        </div>
      </div>

      <Tabs
        defaultActiveKey="content"
        items={[
          {
            key: "content",
            label: "Content",
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.map((t) => <Tag key={t} className="!rounded-full">{t}</Tag>)}
                  </div>
                )}
                <div className="prose prose-zinc max-w-none">
                  {article.content ? (
                    article.content.split("\n").map((line, i) => {
                      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
                      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold mt-5 mb-2">{line.slice(3)}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-zinc-700">{line.slice(2)}</li>;
                      if (line.trim() === "") return <br key={i} />;
                      return <p key={i} className="text-zinc-700 mb-2">{line}</p>;
                    })
                  ) : (
                    <Typography.Text className="text-zinc-400 italic">No content</Typography.Text>
                  )}
                </div>
              </Card>
            ),
          },
          {
            key: "versions",
            label: `Versions (${versions.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
                {versions.length === 0 ? (
                  <Empty description="No version history" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {versions.map((v) => (
                      <div key={v.id} className="flex items-center justify-between py-3 px-2">
                        <div>
                          <Typography.Text className="font-medium">v{v.version}</Typography.Text>
                          <Typography.Text className="text-xs text-zinc-400 ml-3">{new Date(v.createdAt).toLocaleString()}</Typography.Text>
                          {v.authorName && <Typography.Text className="text-xs text-zinc-400 ml-2">by {v.authorName}</Typography.Text>}
                        </div>
                        {v.version < article.version && (
                          <Button size="small" icon={<RotateCcw className="w-3 h-3" />} onClick={() => handleRestoreVersion(v.version)}>
                            Restore
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "related",
            label: `Related (${related.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
                {related.length === 0 ? (
                  <Empty description="No related articles" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {related.map((r) => (
                      <button key={r.id} onClick={() => router.push(`/knowledge/${r.id}`)} className="w-full text-left flex items-center justify-between py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                        <div>
                          <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600">{r.title}</Typography.Text>
                          <Tag color={categoryColors[r.category] || "default"} className="!ml-2 !text-[10px] !px-1.5 !py-0">{categoryLabels[r.category] || r.category}</Tag>
                        </div>
                        <Typography.Text className="text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</Typography.Text>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "activity",
            label: "Activity",
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
                {activities.length === 0 ? (
                  <Empty description="No activity yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {activities.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 py-3 px-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-300 mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Typography.Text className="text-sm text-zinc-900">{a.description || a.action}</Typography.Text>
                          <br />
                          <Typography.Text className="text-xs text-zinc-400">
                            {a.performedByName && <>{a.performedByName} &middot; </>}
                            {new Date(a.createdAt).toLocaleString()}
                          </Typography.Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />

      <Drawer title="Edit Article" width={640} open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)} footer={<Space className="w-full justify-end"><Button onClick={() => setEditDrawerOpen(false)}>Cancel</Button><Button type="primary" onClick={handleEdit}>Save Changes</Button></Space>} destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Required" }]}><Input /></Form.Item>
          <Form.Item name="category" label="Category">
            <Select options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="tags" label="Tags (comma-separated)"><Input /></Form.Item>
          <Form.Item name="content" label="Content"><Input.TextArea rows={16} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
