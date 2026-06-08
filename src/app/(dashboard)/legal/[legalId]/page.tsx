"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tag, Card, Tabs, Space, Typography, Empty, Spin, Modal, Form, Input as AntInput, Select, Drawer, List, Upload, DatePicker, App, Row, Col } from "antd";
import type { UploadFile } from "antd/es/upload";
import { ArrowLeft, FileText, Send, CheckCircle, XCircle, Clock, AlertTriangle, Upload as UploadIcon, Edit3, Trash2, Plus, Download, History, Scale } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchLegalDetailRequest, clearLegalDetail, updateLegalRequest, deleteLegalRequest,
  uploadLegalVersionRequest,
} from "@/store/modules/legal/legalSlice";
import {
  selectLegalDetail, selectLegalVersions, selectLegalActivities,
} from "@/store/modules/legal/legalSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import { getFileUrl } from "@/lib/utils/fileUrl";
import { selectClients } from "@/store/modules/clients/clientsSelectors";
import { fetchClientsRequest } from "@/store/modules/clients/clientsSlice";

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

export default function LegalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectLegalDetail);
  const versions = useAppSelector(selectLegalVersions);
  const activities = useAppSelector(selectLegalActivities);
  const clients = useAppSelector(selectClients);

  const legalId = params.legalId as string;
  const legal = detail?.legal ?? null;

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [versionFileList, setVersionFileList] = useState<UploadFile[]>([]);
  const [versionNotes, setVersionNotes] = useState("");

  useEffect(() => {
    if (legalId) dispatch(fetchLegalDetailRequest(legalId));
    return () => { dispatch(clearLegalDetail()); };
  }, [legalId, dispatch]);

  useEffect(() => {
    dispatch(fetchClientsRequest({ limit: 200 }));
  }, [dispatch]);

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      const data: Record<string, unknown> = {};
      if (values.name) data.name = values.name;
      if (values.clientId !== undefined) data.clientId = values.clientId;
      if (values.documentType) data.documentType = values.documentType;
      if (values.status) data.status = values.status;
      if (values.sentDate) data.sentDate = values.sentDate?.toISOString();
      if (values.signedDate) data.signedDate = values.signedDate?.toISOString();
      if (values.expiryDate) data.expiryDate = values.expiryDate?.toISOString();
      dispatch(updateLegalRequest({ id: legalId, data }));
      setEditDrawerOpen(false);
    } catch {}
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete legal document", content: `Delete "${legal?.name}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => { dispatch(deleteLegalRequest(legalId)); router.push(APP_ROUTES.legal); },
    });
  };

  const handleUploadVersion = async () => {
    if (versionFileList.length === 0 || !versionFileList[0].originFileObj) return;
    dispatch(uploadLegalVersionRequest({
      legalId,
      file: versionFileList[0].originFileObj,
      notes: versionNotes || undefined,
    }));
    setVersionDrawerOpen(false);
    setVersionFileList([]);
    setVersionNotes("");
  };

  const handleStatusChange = (newStatus: string) => {
    dispatch(updateLegalRequest({ id: legalId, data: { status: newStatus } }));
  };

  const isExpiringSoon = legal?.expiryDate && legal.status !== "expired"
    ? (new Date(legal.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30
    : false;

  if (!legal) {
    return <div className="flex justify-center items-center py-32"><Spin size="large" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.legal)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">Back to Legal Center</Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <Scale className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{legal.name}</Typography.Title>
                <Tag color={typeColors[legal.documentType] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">{typeLabels[legal.documentType] || legal.documentType}</Tag>
                <Tag color={statusColors[legal.status] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">{statusLabels[legal.status] || legal.status}</Tag>
                {isExpiringSoon && (
                  <Tag color="orange" className="!rounded-full !px-2 !py-0 !text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Expiring soon
                  </Tag>
                )}
              </div>
              <Typography.Text className="text-zinc-500 text-sm">
                {legal.clientName && <>{legal.clientName} &middot; </>}
                v{legal.currentVersion} &middot; Updated {new Date(legal.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Typography.Text>
            </div>
          </div>
          <Space wrap>
            <Select value={legal.status} onChange={handleStatusChange} style={{ width: 130 }}
              options={[
                { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
                { value: "signed", label: "Signed" }, { value: "expired", label: "Expired" },
                { value: "cancelled", label: "Cancelled" },
              ]} />
            {legal.fileUrl && (
              <a href={getFileUrl(legal.fileUrl)} target="_blank" rel="noopener noreferrer">
                <Button icon={<Download className="w-4 h-4" />}>Download</Button>
              </a>
            )}
            <Button icon={<UploadIcon className="w-4 h-4" />} onClick={() => setVersionDrawerOpen(true)}>New Version</Button>
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => {
              editForm.setFieldsValue({ ...legal, sentDate: legal.sentDate ? new Date(legal.sentDate) : undefined, signedDate: legal.signedDate ? new Date(legal.signedDate) : undefined, expiryDate: legal.expiryDate ? new Date(legal.expiryDate) : undefined });
              setEditDrawerOpen(true);
            }}>Edit</Button>
            <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
          </Space>
        </div>
      </div>

      <Tabs defaultActiveKey="overview" items={[
        {
          key: "overview", label: "Overview",
          children: (
            <div className="space-y-6">
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Document Information" size="small">
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Type</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{typeLabels[legal.documentType] || legal.documentType}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</Typography.Text>
                    <Tag color={statusColors[legal.status] || "default"} className="!rounded-full !mt-1">{statusLabels[legal.status] || legal.status}</Tag>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Client</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{legal.clientName || "—"}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Version</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{legal.currentVersion}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Sent Date</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{legal.sentDate ? new Date(legal.sentDate).toLocaleDateString() : "—"}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Signed Date</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{legal.signedDate ? new Date(legal.signedDate).toLocaleDateString() : "—"}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Expiry Date</Typography.Text>
                    <Typography.Text className={`text-sm block mt-1 ${isExpiringSoon ? "text-orange-600 font-medium" : "text-zinc-900"}`}>
                      {legal.expiryDate ? new Date(legal.expiryDate).toLocaleDateString() : "—"}
                      {isExpiringSoon && <Tag color="orange" className="!ml-2 !rounded-full !text-[10px]">Expiring soon</Tag>}
                    </Typography.Text>
                  </Col>
                  {legal.signatureStatus && (
                    <Col xs={24} sm={12}>
                      <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Signature</Typography.Text>
                      <Typography.Text className="text-sm text-zinc-900 block mt-1 capitalize">{legal.signatureStatus.replace("_", " ")}</Typography.Text>
                    </Col>
                  )}
                </Row>
              </Card>

              {legal.fileUrl && (
                <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="File" size="small">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    <Typography.Text className="text-sm text-zinc-900">{legal.fileType?.toUpperCase() || "File"} &middot; {legal.fileSize ? `${(legal.fileSize / 1024).toFixed(1)} KB` : ""}</Typography.Text>
                    <a href={getFileUrl(legal.fileUrl)} target="_blank" rel="noopener noreferrer">
                      <Button size="small" icon={<Download className="w-4 h-4" />}>Download</Button>
                    </a>
                  </div>
                </Card>
              )}
            </div>
          ),
        },
        {
          key: "versions", label: `Versions (${versions.length})`,
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
              <div className="flex items-center justify-between w-full">
                <span>Version History</span>
                <Button type="primary" size="small" icon={<UploadIcon className="w-4 h-4" />} onClick={() => setVersionDrawerOpen(true)}>Upload Version</Button>
              </div>
            }>
              {versions.length === 0 ? (
                <Empty description="No versions uploaded" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<UploadIcon className="w-4 h-4" />} onClick={() => setVersionDrawerOpen(true)}>Upload Version</Button>
                </Empty>
              ) : (
                <List dataSource={versions} renderItem={(version) => (
                  <List.Item className="!border-zinc-100 !py-3" actions={[
                    <a key="dl" href={getFileUrl(version.fileUrl)} target="_blank" rel="noopener noreferrer">
                      <Button type="text" size="small" icon={<Download className="w-4 h-4" />} />
                    </a>,
                  ]}>
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography.Text className="text-sm font-medium text-zinc-900">Version {version.versionNumber}</Typography.Text>
                        {version.notes && <Typography.Text className="text-xs text-zinc-500 block">{version.notes}</Typography.Text>}
                        <Typography.Text className="text-xs text-zinc-400 block mt-0.5">
                          {new Date(version.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </Typography.Text>
                      </div>
                    </div>
                  </List.Item>
                )} />
              )}
            </Card>
          ),
        },
        {
          key: "activity", label: "Activity",
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Activity Timeline">
              {activities.length === 0 ? (
                <Empty description="No activity yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <List dataSource={activities} renderItem={(activity) => (
                  <List.Item className="!border-zinc-100 !py-3">
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-2 h-2 rounded-full bg-zinc-300 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Typography.Text className="text-sm text-zinc-900">{activity.description}</Typography.Text>
                        <Typography.Text className="text-xs text-zinc-400 block mt-0.5">
                          {new Date(activity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </Typography.Text>
                      </div>
                    </div>
                  </List.Item>
                )} />
              )}
            </Card>
          ),
        },
      ]} />

      <Drawer title="Edit Legal Document" width={560} open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}
        footer={<Space className="w-full justify-end"><Button onClick={() => setEditDrawerOpen(false)}>Cancel</Button><Button type="primary" onClick={handleUpdate}>Save Changes</Button></Space>}
        destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Document Name" rules={[{ required: true, message: "Required" }]}><AntInput /></Form.Item>
          <Form.Item name="clientId" label="Client">
            <Select showSearch allowClear
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
          </Form.Item>
          <Form.Item name="documentType" label="Document Type">
            <Select options={[
              { value: "nda", label: "NDA" }, { value: "mutual_nda", label: "Mutual NDA" },
              { value: "contractor_agreement", label: "Contractor Agreement" }, { value: "service_agreement", label: "Service Agreement" },
              { value: "msa", label: "MSA" }, { value: "sow", label: "SOW" },
              { value: "change_request", label: "Change Request" }, { value: "amendment", label: "Amendment" },
            ]} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[
              { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
              { value: "signed", label: "Signed" }, { value: "expired", label: "Expired" },
              { value: "cancelled", label: "Cancelled" },
            ]} />
          </Form.Item>
          <Form.Item name="sentDate" label="Sent Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="signedDate" label="Signed Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="expiryDate" label="Expiry Date"><DatePicker className="w-full" /></Form.Item>
        </Form>
      </Drawer>

      <Drawer title="Upload New Version" width={480} open={versionDrawerOpen}
        onClose={() => { setVersionDrawerOpen(false); setVersionFileList([]); setVersionNotes(""); }}
        footer={<Space className="w-full justify-end"><Button onClick={() => { setVersionDrawerOpen(false); setVersionFileList([]); setVersionNotes(""); }}>Cancel</Button><Button type="primary" onClick={handleUploadVersion} disabled={versionFileList.length === 0}>Upload</Button></Space>}
        destroyOnClose>
        <div className="space-y-4">
          <div>
            <Typography.Text className="text-sm font-medium text-zinc-700 block mb-1">File (PDF, DOCX)</Typography.Text>
            <Upload.Dragger multiple={false} fileList={versionFileList} onChange={({ fileList: fl }) => setVersionFileList(fl)}
              beforeUpload={() => false} accept=".pdf,.docx">
              <p className="text-zinc-400"><UploadIcon className="w-6 h-6 mx-auto mb-2" /></p>
              <Typography.Text className="text-sm text-zinc-500">Drop a file here or click to browse</Typography.Text>
            </Upload.Dragger>
          </div>
          <div>
            <Typography.Text className="text-sm font-medium text-zinc-700 block mb-1">Version Notes</Typography.Text>
            <AntInput.TextArea rows={3} placeholder="What changed in this version?" value={versionNotes} onChange={(e) => setVersionNotes(e.target.value)} />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
