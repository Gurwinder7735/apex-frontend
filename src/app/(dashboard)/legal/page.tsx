"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, Space, Tag, Card, Row, Col, Statistic, Empty, Typography, Drawer, Form, DatePicker, Modal, Upload, App } from "antd";
import { Plus, Search, FileText, Send, CheckCircle, XCircle, Clock, AlertTriangle, Upload as UploadIcon, ArrowUpRight, Scale } from "lucide-react";
import type { UploadFile } from "antd/es/upload";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDebounce } from "@/hooks/useDebounce";
import type { LegalDocument } from "@/types/models/Legal";
import { fetchLegalRequest, createLegalRequest, deleteLegalRequest, fetchStatsRequest } from "@/store/modules/legal/legalSlice";
import { selectLegal, selectLegalMeta, selectLegalStats } from "@/store/modules/legal/legalSelectors";
import { selectClients } from "@/store/modules/clients/clientsSelectors";
import { fetchClientsRequest } from "@/store/modules/clients/clientsSlice";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const typeColors: Record<string, string> = {
  nda: "blue", mutual_nda: "cyan", contractor_agreement: "orange",
  service_agreement: "purple", msa: "geekblue", sow: "green",
  change_request: "gold", amendment: "magenta",
};

const typeLabels: Record<string, string> = {
  nda: "NDA", mutual_nda: "Mutual NDA", contractor_agreement: "Contractor Agreement",
  service_agreement: "Service Agreement", msa: "MSA", sow: "SOW",
  change_request: "Change Request", amendment: "Amendment",
};

const statusColors: Record<string, string> = {
  draft: "default", sent: "purple", signed: "green", expired: "red", cancelled: "default",
};

const statusLabels: Record<string, string> = {
  draft: "Draft", sent: "Sent", signed: "Signed", expired: "Expired", cancelled: "Cancelled",
};

export default function LegalPage() {
  const dispatch = useAppDispatch();
  const legalDocs = useAppSelector(selectLegal);
  const meta = useAppSelector(selectLegalMeta);
  const stats = useAppSelector(selectLegalStats);
  const clients = useAppSelector(selectClients);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchLegalRequest({ search: debouncedSearch, documentType: typeFilter, status: statusFilter, clientId: clientFilter, limit: 50 }));
  }, [debouncedSearch, typeFilter, statusFilter, clientFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchStatsRequest());
    dispatch(fetchClientsRequest({ limit: 200 }));
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload: Record<string, unknown> = {
        name: values.name,
        clientId: values.clientId,
        proposalId: values.proposalId,
        documentType: values.documentType || "nda",
        status: values.status || "draft",
      };
      if (values.sentDate) payload.sentDate = values.sentDate.toISOString();
      if (values.signedDate) payload.signedDate = values.signedDate.toISOString();
      if (values.expiryDate) payload.expiryDate = values.expiryDate.toISOString();
      if (fileList.length > 0 && fileList[0].originFileObj) {
        payload.file = fileList[0].originFileObj;
      }
      dispatch(createLegalRequest(payload as any));
      setDrawerOpen(false);
      form.resetFields();
      setFileList([]);
    } catch {}
  };

  const handleDelete = (doc: LegalDocument) => {
    Modal.confirm({
      title: "Delete legal document",
      content: `Delete "${doc.name}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => dispatch(deleteLegalRequest(doc.id)),
    });
  };

  const isExpiringSoon = (doc: LegalDocument) => {
    if (!doc.expiryDate || doc.status === "expired") return false;
    const daysLeft = (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30 && daysLeft > 0;
  };

  return (
    <div>
      <PageHeader title="Legal Center" subtitle="Manage NDAs, contracts, SOWs, and amendments." />

      {stats && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Total NDAs" value={stats.totalNdas} prefix={<Scale className="w-4 h-4 text-blue-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Active Contracts" value={stats.activeContracts} prefix={<FileText className="w-4 h-4 text-green-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#16a34a" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Pending Signatures" value={stats.pendingSignatures} prefix={<Send className="w-4 h-4 text-purple-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#7c3aed" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Expired" value={stats.expiredAgreements} prefix={<XCircle className="w-4 h-4 text-red-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#dc2626" }} />
            </Card>
          </Col>
        </Row>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Input.Search placeholder="Search legal documents..." allowClear onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select placeholder="Type" allowClear style={{ width: 160 }} onChange={(val) => setTypeFilter(val)}
          options={[
            { value: "nda", label: "NDA" }, { value: "mutual_nda", label: "Mutual NDA" },
            { value: "contractor_agreement", label: "Contractor Agreement" }, { value: "service_agreement", label: "Service Agreement" },
            { value: "msa", label: "MSA" }, { value: "sow", label: "SOW" },
            { value: "change_request", label: "Change Request" }, { value: "amendment", label: "Amendment" },
          ]} />
        <Select placeholder="Status" allowClear style={{ width: 130 }} onChange={(val) => setStatusFilter(val)}
          options={[
            { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
            { value: "signed", label: "Signed" }, { value: "expired", label: "Expired" },
            { value: "cancelled", label: "Cancelled" },
          ]} />
        <Select placeholder="Client" allowClear showSearch style={{ width: 180 }} onChange={(val) => setClientFilter(val)}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
        <div className="flex-1" />
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>New Legal Document</Button>
      </div>

      {meta.isLoading && legalDocs.length === 0 ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /></div>
      ) : legalDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Scale className="w-16 h-16 mb-4 text-zinc-300" />
          <Typography.Text className="text-lg font-medium text-zinc-500">No legal documents yet</Typography.Text>
          <Typography.Text className="text-sm text-zinc-400 mb-4">Create your first NDA, contract, or SOW.</Typography.Text>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>New Legal Document</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {legalDocs.map((doc) => (
            <Link key={doc.id} href={`${APP_ROUTES.legal}/${doc.id}`} className="block group">
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm hover:!shadow-md hover:!border-zinc-300 transition-all !cursor-pointer" size="small">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                    <FileText className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography.Text className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{doc.name}</Typography.Text>
                      <Tag color={typeColors[doc.documentType] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0">
                        {typeLabels[doc.documentType] || doc.documentType}
                      </Tag>
                      <Tag color={statusColors[doc.status] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0">
                        {statusLabels[doc.status] || doc.status}
                      </Tag>
                      {isExpiringSoon(doc) && (
                        <Tag color="orange" className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Expiring soon
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      {doc.clientName && <span>{doc.clientName}</span>}
                      {doc.expiryDate && <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>}
                      {doc.currentVersion > 0 && <span>v{doc.currentVersion}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Drawer title="New Legal Document" width={560} open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); setFileList([]); }}
        footer={<Space className="w-full justify-end"><Button onClick={() => { setDrawerOpen(false); form.resetFields(); setFileList([]); }}>Cancel</Button><Button type="primary" onClick={handleCreate}>Create</Button></Space>}
        destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Document Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. NDA - Acme Corp" />
          </Form.Item>
          <Form.Item name="clientId" label="Client">
            <Select showSearch allowClear placeholder="Select client"
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
          </Form.Item>
          <Form.Item name="documentType" label="Document Type" initialValue="nda">
            <Select options={[
              { value: "nda", label: "NDA" }, { value: "mutual_nda", label: "Mutual NDA" },
              { value: "contractor_agreement", label: "Contractor Agreement" }, { value: "service_agreement", label: "Service Agreement" },
              { value: "msa", label: "MSA" }, { value: "sow", label: "SOW" },
              { value: "change_request", label: "Change Request" }, { value: "amendment", label: "Amendment" },
            ]} />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="draft">
            <Select options={[
              { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
              { value: "signed", label: "Signed" }, { value: "expired", label: "Expired" },
              { value: "cancelled", label: "Cancelled" },
            ]} />
          </Form.Item>
          <Form.Item name="sentDate" label="Sent Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="signedDate" label="Signed Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="expiryDate" label="Expiry Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item label="File (PDF, DOCX)">
            <Upload.Dragger multiple={false} fileList={fileList} onChange={({ fileList: fl }) => setFileList(fl)}
              beforeUpload={() => false} accept=".pdf,.docx">
              <p className="text-zinc-400"><UploadIcon className="w-6 h-6 mx-auto mb-2" /></p>
              <Typography.Text className="text-sm text-zinc-500">Drop a file here or click to browse</Typography.Text>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
