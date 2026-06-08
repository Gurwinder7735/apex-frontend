"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tag, Card, Tabs, Descriptions, Space, Typography, Empty, Spin, Modal, Form, Input as AntInput, Select, Drawer, List, Upload, App, Image } from "antd";
import type { UploadFile } from "antd/es/upload";
import { ArrowLeft, FileText, Download, Edit3, Trash2, Upload as UploadIcon, Clock, User, Tag as TagIcon, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchDocumentDetailRequest, clearDocumentDetail, updateDocumentRequest, deleteDocumentRequest, replaceFileRequest } from "@/store/modules/documents/documentsSlice";
import { selectDocumentDetail, selectDocumentActivities } from "@/store/modules/documents/documentsSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import { getFileUrl } from "@/lib/utils/fileUrl";

const categoryColors: Record<string, string> = {
  proposal: "blue",
  nda: "red",
  contract: "purple",
  invoice: "green",
  technical: "cyan",
  meeting_notes: "orange",
  general: "default",
};

const categoryLabels: Record<string, string> = {
  proposal: "Proposal",
  nda: "NDA",
  contract: "Contract",
  invoice: "Invoice",
  technical: "Technical",
  meeting_notes: "Meeting Notes",
  general: "General",
};

const previewableTypes = ["pdf", "png", "jpg", "jpeg", "gif", "webp", "svg"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectDocumentDetail);
  const activities = useAppSelector(selectDocumentActivities);

  const documentId = params.documentId as string;
  const doc = detail?.document ?? null;

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [replaceFileList, setReplaceFileList] = useState<UploadFile[]>([]);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (documentId) {
      dispatch(fetchDocumentDetailRequest(documentId));
    }
    return () => { dispatch(clearDocumentDetail()); };
  }, [documentId, dispatch]);

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      dispatch(updateDocumentRequest({ id: documentId, data: { ...values, tags: values.tags || "" } }));
      setEditDrawerOpen(false);
    } catch {
      // validation failed
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete document",
      content: `Are you sure you want to delete "${doc?.name}"? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(deleteDocumentRequest(documentId));
        router.push(APP_ROUTES.documents);
      },
    });
  };

  const handleReplaceFile = () => {
    const file = replaceFileList[0]?.originFileObj;
    if (!file) return;
    dispatch(replaceFileRequest({ id: documentId, file }));
    setReplaceModalOpen(false);
    setReplaceFileList([]);
  };

  if (!doc) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  const isPreviewable = previewableTypes.includes(doc.fileType);

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.documents)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">
          Back to Documents
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-2xl">
              📄
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{doc.name}</Typography.Title>
                <Tag color={categoryColors[doc.category] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">
                  {categoryLabels[doc.category] || doc.category}
                </Tag>
                <Tag className="!rounded-full !px-2 !py-0 !text-[10px] !uppercase">{doc.fileType}</Tag>
              </div>
              <Typography.Text className="text-zinc-500 text-sm">
                {formatFileSize(doc.fileSize)} &middot; Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                {doc.uploadedByName && <> &middot; by {doc.uploadedByName}</>}
              </Typography.Text>
            </div>
          </div>
          <Space>
            {isPreviewable && (
              <a href={getFileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                <Button icon={<Download className="w-4 h-4" />}>Download</Button>
              </a>
            )}
            <Button icon={<UploadIcon className="w-4 h-4" />} onClick={() => setReplaceModalOpen(true)}>Replace File</Button>
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => { editForm.setFieldsValue({ ...doc, tags: doc.tags?.join(", ") }); setEditDrawerOpen(true); }}>
              Edit
            </Button>
            <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
          </Space>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isPreviewable ? (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm !overflow-hidden" bodyStyle={{ padding: 0 }}>
              {doc.fileType === "pdf" ? (
                <iframe src={getFileUrl(doc.fileUrl)} className="w-full h-[600px]" title={doc.name} />
              ) : (
                <div className="flex items-center justify-center p-8 bg-zinc-50">
                  <Image src={getFileUrl(doc.fileUrl)} alt={doc.name} className="max-w-full max-h-[500px] object-contain rounded-lg" />
                </div>
              )}
            </Card>
          ) : (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <FileText className="w-20 h-20 mb-4 text-zinc-300" />
                <Typography.Text className="text-lg font-medium text-zinc-500">Preview not available</Typography.Text>
                <Typography.Text className="text-sm text-zinc-400 mb-6">
                  This file type ({doc.fileType.toUpperCase()}) cannot be previewed inline.
                </Typography.Text>
                <a href={getFileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" icon={<Download className="w-4 h-4" />}>Download File</Button>
                </a>
              </div>
            </Card>
          )}

          <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Activity Timeline">
            {activities.length === 0 ? (
              <Empty description="No activity yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={activities}
                renderItem={(activity) => (
                  <List.Item className="!border-zinc-100 !py-3">
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-2 h-2 rounded-full bg-zinc-300 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Typography.Text className="text-sm text-zinc-900">{activity.description}</Typography.Text>
                        <br />
                        <Typography.Text className="text-xs text-zinc-400">
                          {new Date(activity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </Typography.Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Details" size="small">
            <div className="space-y-4">
              {doc.description && (
                <div>
                  <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">Description</Typography.Text>
                  <Typography.Text className="text-sm text-zinc-700">{doc.description}</Typography.Text>
                </div>
              )}
              <div>
                <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">Category</Typography.Text>
                <Tag color={categoryColors[doc.category] || "default"}>{categoryLabels[doc.category] || doc.category}</Tag>
              </div>
              {doc.clientName && (
                <div>
                  <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">Client</Typography.Text>
                  <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    {doc.clientName}
                  </div>
                </div>
              )}
              {doc.tags && doc.tags.length > 0 && (
                <div>
                  <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">Tags</Typography.Text>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((t) => <Tag key={t} className="!text-[11px] !px-2 !py-0.5 !rounded-full">{t}</Tag>)}
                  </div>
                </div>
              )}
              <div>
                <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">File Info</Typography.Text>
                <Typography.Text className="text-sm text-zinc-700 block">{doc.fileType.toUpperCase()} &middot; {formatFileSize(doc.fileSize)}</Typography.Text>
              </div>
              {doc.uploadedByName && (
                <div>
                  <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">Uploaded By</Typography.Text>
                  <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <User className="w-4 h-4 text-zinc-400" />
                    {doc.uploadedByName}
                  </div>
                </div>
              )}
              <div>
                <Typography.Text className="text-xs font-medium uppercase tracking-wider text-zinc-500 block mb-1">Uploaded At</Typography.Text>
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Drawer
        title="Edit Document"
        width={520}
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => setEditDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleUpdate}>Save Changes</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Document Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <AntInput.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select options={[
              { value: "proposal", label: "Proposal" },
              { value: "nda", label: "NDA" },
              { value: "contract", label: "Contract" },
              { value: "invoice", label: "Invoice" },
              { value: "technical", label: "Technical" },
              { value: "meeting_notes", label: "Meeting Notes" },
              { value: "general", label: "General" },
            ]} />
          </Form.Item>
          <Form.Item name="tags" label="Tags (comma-separated)">
            <AntInput placeholder="e.g. React, Mobile App" />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Replace File"
        open={replaceModalOpen}
        onCancel={() => { setReplaceModalOpen(false); setReplaceFileList([]); }}
        onOk={handleReplaceFile}
        okText="Replace"
        okButtonProps={{ disabled: replaceFileList.length === 0 }}
      >
        <div className="py-4">
          <Upload.Dragger
            multiple={false}
            fileList={replaceFileList}
            onChange={({ fileList: fl }) => setReplaceFileList(fl.slice(-1))}
            beforeUpload={() => false}
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip"
          >
            <div className="flex flex-col items-center py-4">
              <UploadIcon className="w-10 h-10 text-zinc-300 mb-3" />
              <Typography.Text className="text-sm font-medium text-zinc-600">Click or drag to replace file</Typography.Text>
            </div>
          </Upload.Dragger>
        </div>
      </Modal>
    </div>
  );
}
