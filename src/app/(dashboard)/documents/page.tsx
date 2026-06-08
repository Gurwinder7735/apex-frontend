"use client";

import { useEffect, useState, useMemo } from "react";
import { Button, Input, Select, Space, Tag, Card, Row, Col, Statistic, Empty, Typography, Drawer, Form, Upload, Modal, App, Table, DatePicker } from "antd";
import { Plus, Search, FileText, Upload as UploadIcon, Tag as TagIcon, Filter, RefreshCw, ArrowUpRight, Clock, Trash2, Download, Eye, MoreHorizontal, Building2 } from "lucide-react";
import type { UploadFile } from "antd/es/upload";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { INDUSTRY_OPTIONS, COUNTRY_OPTIONS, getFilteredTimezones } from "@/lib/constants/clientOptions";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDebounce } from "@/hooks/useDebounce";
import type { Document } from "@/types/models/Document";
import { fetchDocumentsRequest, uploadDocumentRequest, deleteDocumentRequest, fetchStatsRequest } from "@/store/modules/documents/documentsSlice";
import { selectDocuments, selectDocumentsMeta, selectDocumentsStats } from "@/store/modules/documents/documentsSelectors";
import { selectClients } from "@/store/modules/clients/clientsSelectors";
import { fetchClientsRequest } from "@/store/modules/clients/clientsSlice";
import { APP_ROUTES } from "@/lib/constants/appConstants";

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

const fileTypeIcons: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
  xlsx: "📊",
  png: "🖼",
  jpg: "🖼",
  jpeg: "🖼",
  gif: "🎨",
  webp: "🖼",
  svg: "🎨",
  zip: "📦",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const meta = useAppSelector(selectDocumentsMeta);
  const stats = useAppSelector(selectDocumentsStats);
  const clients = useAppSelector(selectClients);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchDocumentsRequest({ search: debouncedSearch, category: categoryFilter, clientId: clientFilter, limit: 50 }));
  }, [debouncedSearch, categoryFilter, clientFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchStatsRequest());
    dispatch(fetchClientsRequest({ limit: 200 }));
  }, [dispatch]);

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      const file = fileList[0]?.originFileObj;
      if (!file) return;
      dispatch(uploadDocumentRequest({
        file,
        name: values.name,
        description: values.description,
        category: values.category || "general",
        clientId: values.clientId,
        tags: values.tags || "",
      }));
      setUploadOpen(false);
      setFileList([]);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleDelete = (doc: Document) => {
    Modal.confirm({
      title: "Delete document",
      content: `Are you sure you want to delete "${doc.name}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => dispatch(deleteDocumentRequest(doc.id)),
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Document) => (
        <Link href={`${APP_ROUTES.documents}/${record.id}`} className="flex items-center gap-3 text-zinc-900 hover:text-blue-600 font-medium">
          <span className="text-lg">{fileTypeIcons[record.fileType] || "📄"}</span>
          <span className="truncate max-w-[250px]">{name}</span>
        </Link>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 130,
      render: (cat: string) => <Tag color={categoryColors[cat] || "default"}>{categoryLabels[cat] || cat}</Tag>,
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      width: 150,
      render: (name: string) => name || <span className="text-zinc-400">—</span>,
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((t) => <Tag key={t} className="!text-[10px] !px-1.5 !py-0 !leading-none">{t}</Tag>)}
          {tags.length > 3 && <span className="text-xs text-zinc-400">+{tags.length - 3}</span>}
        </div>
      ),
    },
    {
      title: "Uploaded By",
      dataIndex: "uploadedByName",
      key: "uploadedByName",
      width: 140,
      render: (name: string) => name || <span className="text-zinc-400">—</span>,
    },
    {
      title: "Size",
      dataIndex: "fileSize",
      key: "fileSize",
      width: 80,
      render: (size: number) => <span className="text-zinc-500 text-xs">{formatFileSize(size)}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => <span className="text-zinc-500 text-xs">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_: unknown, record: Document) => (
        <Space>
          <Link href={`${APP_ROUTES.documents}/${record.id}`}>
            <Button type="text" size="small" icon={<Eye className="w-4 h-4" />} />
          </Link>
          <Button type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Document Hub" subtitle="Central repository for all company documents and files." />

      {stats && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Total Documents" value={stats.totalDocuments} prefix={<FileText className="w-4 h-4 text-zinc-400 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Added This Month" value={stats.addedThisMonth} prefix={<ArrowUpRight className="w-4 h-4 text-blue-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Recent (7 days)" value={stats.recentUploads} prefix={<Clock className="w-4 h-4 text-orange-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Categories" value={Object.keys(stats.byCategory).length} prefix={<TagIcon className="w-4 h-4 text-purple-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
        </Row>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Input.Search
          placeholder="Search documents..."
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          placeholder="Category"
          allowClear
          style={{ width: 140 }}
          onChange={(val) => setCategoryFilter(val)}
          options={[
            { value: "proposal", label: "Proposal" },
            { value: "nda", label: "NDA" },
            { value: "contract", label: "Contract" },
            { value: "invoice", label: "Invoice" },
            { value: "technical", label: "Technical" },
            { value: "meeting_notes", label: "Meeting Notes" },
            { value: "general", label: "General" },
          ]}
        />
        <Select
          placeholder="Client"
          allowClear
          showSearch
          style={{ width: 180 }}
          onChange={(val) => setClientFilter(val)}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          options={clients.map((c) => ({ value: c.id, label: c.companyName }))}
        />
        <div className="flex-1" />
        <Button type="primary" icon={<UploadIcon className="w-4 h-4" />} onClick={() => setUploadOpen(true)}>
          Upload Document
        </Button>
      </div>

      <Card className="!rounded-xl !border-zinc-200 !shadow-sm !overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={documents}
          loading={meta.isLoading}
          rowKey="id"
          pagination={{ pageSize: 20, total: meta.total, showSizeChanger: false, showTotal: (t) => `${t} documents` }}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center py-16 text-zinc-400">
                <FileText className="w-16 h-16 mb-4 text-zinc-300" />
                <Typography.Text className="text-lg font-medium text-zinc-500">No documents yet</Typography.Text>
                <Typography.Text className="text-sm text-zinc-400 mb-4">Upload your first document to start building your knowledge base.</Typography.Text>
                <Button type="primary" icon={<UploadIcon className="w-4 h-4" />} onClick={() => setUploadOpen(true)}>
                  Upload Document
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      <Drawer
        title="Upload Document"
        width={580}
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); setFileList([]); form.resetFields(); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => { setUploadOpen(false); setFileList([]); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={handleUpload}>Upload</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Document Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Q1 Proposal - Acme Corp" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of this document..." />
          </Form.Item>
          <Form.Item name="category" label="Category" initialValue="general">
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
          <Form.Item name="clientId" label="Client">
            <Select showSearch allowClear placeholder="Link to client (optional)"
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={clients.map((c) => ({ value: c.id, label: c.companyName }))}
            />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Input placeholder="e.g. React, Mobile App, BuildCore (comma-separated)" />
          </Form.Item>
          <Form.Item label="File" required>
            <Upload.Dragger
              multiple={false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              beforeUpload={() => false}
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip"
            >
              <div className="flex flex-col items-center py-4">
                <UploadIcon className="w-10 h-10 text-zinc-300 mb-3" />
                <Typography.Text className="text-sm font-medium text-zinc-600">Drag & drop or click to browse</Typography.Text>
                <Typography.Text className="text-xs text-zinc-400 mt-1">PDF, DOCX, XLSX, Images, ZIP up to 50MB</Typography.Text>
              </div>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
