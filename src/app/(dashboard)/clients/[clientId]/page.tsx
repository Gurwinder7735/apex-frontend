"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Tag, Card, Tabs, Descriptions, Space, Typography, Empty, Spin, Modal, Form, Input as AntInput, Select, Drawer, List, Upload, App, Dropdown, Row, Col, Statistic } from "antd";
import type { UploadFile } from "antd/es/upload";
import { ArrowLeft, Building2, Globe, MapPin, Briefcase, Clock, Edit3, Trash2, Plus, Phone, Mail, ExternalLink, UserPlus, MoreHorizontal, Upload as UploadIcon, FileText, Calendar, CheckSquare, Scale, AlertTriangle, FolderKanban, PiggyBank, DollarSign, TrendingUp, Percent } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { INDUSTRY_OPTIONS, COUNTRY_OPTIONS, getFilteredTimezones } from "@/lib/constants/clientOptions";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import type { Client, Contact } from "@/types/models/Client";
import type { Document } from "@/types/models/Document";
import type { Meeting } from "@/types/models/Meeting";
import type { Proposal } from "@/types/models/Proposal";
import type { LegalDocument } from "@/types/models/Legal";
import type { Project } from "@/types/models/Project";
import { fetchClientDetailRequest, clearClientDetail, updateClientRequest, deleteClientRequest, addContactRequest, updateContactRequest, removeContactRequest } from "@/store/modules/clients/clientsSlice";
import { selectClientDetail, selectClientContacts, selectClientActivities } from "@/store/modules/clients/clientsSelectors";
import { uploadDocumentRequest, fetchDocumentsRequest } from "@/store/modules/documents/documentsSlice";
import { selectDocuments } from "@/store/modules/documents/documentsSelectors";
import { fetchMeetingsRequest } from "@/store/modules/meetings/meetingsSlice";
import { selectMeetings } from "@/store/modules/meetings/meetingsSelectors";
import { fetchProposalsRequest } from "@/store/modules/proposals/proposalsSlice";
import { selectProposals } from "@/store/modules/proposals/proposalsSelectors";
import { fetchLegalRequest } from "@/store/modules/legal/legalSlice";
import { selectLegal } from "@/store/modules/legal/legalSelectors";
import { fetchProjectsRequest } from "@/store/modules/projects/projectsSlice";
import { selectProjects } from "@/store/modules/projects/projectsSelectors";
import { fetchClientFinanceSummaryRequest, clearClientFinanceSummary } from "@/store/modules/finance/financeSlice";
import { selectClientFinanceSummary } from "@/store/modules/finance/financeSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const statusColors: Record<string, string> = {
  active: "green",
  on_hold: "orange",
  completed: "blue",
  inactive: "red",
};

const fileTypeIcons: Record<string, string> = {
  pdf: "📄", docx: "📝", xlsx: "📊", png: "🖼", jpg: "🖼", jpeg: "🖼", gif: "🎨", webp: "🖼", svg: "🎨", zip: "📦",
};

const docCategoryColors: Record<string, string> = {
  proposal: "blue", nda: "red", contract: "purple", invoice: "green", technical: "cyan", meeting_notes: "orange", general: "default",
};

const docCategoryLabels: Record<string, string> = {
  proposal: "Proposal", nda: "NDA", contract: "Contract", invoice: "Invoice", technical: "Technical", meeting_notes: "Meeting Notes", general: "General",
};

const meetingTypeColors: Record<string, string> = {
  discovery: "blue", weekly_sync: "green", demo: "purple", planning: "orange", review: "cyan", internal: "geekblue", other: "default",
};

const meetingTypeLabels: Record<string, string> = {
  discovery: "Discovery", weekly_sync: "Weekly Sync", demo: "Demo", planning: "Planning", review: "Review", internal: "Internal", other: "Other",
};

const proposalStatusColors: Record<string, string> = {
  draft: "default", internal_review: "blue", sent: "purple", client_review: "orange", approved: "green", rejected: "red", archived: "default",
};

const proposalStatusLabels: Record<string, string> = {
  draft: "Draft", internal_review: "Internal Review", sent: "Sent", client_review: "Client Review", approved: "Approved", rejected: "Rejected", archived: "Archived",
};

const legalTypeColors: Record<string, string> = {
  nda: "blue", mutual_nda: "cyan", contractor_agreement: "orange",
  service_agreement: "purple", msa: "geekblue", sow: "green",
  change_request: "gold", amendment: "magenta",
};

const legalTypeLabels: Record<string, string> = {
  nda: "NDA", mutual_nda: "Mutual NDA", contractor_agreement: "Contractor Agreement",
  service_agreement: "Service Agreement", msa: "MSA", sow: "SOW",
  change_request: "Change Request", amendment: "Amendment",
};

const legalStatusColors: Record<string, string> = {
  draft: "default", sent: "purple", signed: "green", expired: "red", cancelled: "default",
};

const legalStatusLabels: Record<string, string> = {
  draft: "Draft", sent: "Sent", signed: "Signed", expired: "Expired", cancelled: "Cancelled",
};

const projectStatusColors: Record<string, string> = {
  planning: "blue", active: "green", on_hold: "orange", completed: "default", cancelled: "red",
};
const projectStatusLabels: Record<string, string> = {
  planning: "Planning", active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled",
};
const projectHealthColors: Record<string, string> = { healthy: "green", attention_needed: "orange", at_risk: "red" };
const projectHealthLabels: Record<string, string> = { healthy: "Healthy", attention_needed: "Attention Needed", at_risk: "At Risk" };

const invoiceStatusColors: Record<string, string> = {
  draft: "default", sent: "purple", paid: "green", overdue: "red", cancelled: "default",
};
const invoiceStatusLabels: Record<string, string> = {
  draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled",
};
const paymentTypeLabels: Record<string, string> = {
  advance: "Advance", milestone: "Milestone", final_payment: "Final Payment", maintenance: "Maintenance", other: "Other",
};
const sourceLabels: Record<string, string> = {
  referral: "Referral",
  linkedin: "LinkedIn",
  upwork: "Upwork",
  website: "Website",
  existing_client: "Existing Client",
  partner: "Partner",
  cold_outreach: "Cold Outreach",
  other: "Other",
};

export default function ClientDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectClientDetail);
  const contacts = useAppSelector(selectClientContacts);
  const activities = useAppSelector(selectClientActivities);

  const clientId = params.clientId as string;
  const client = detail?.client ?? null;

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docFileList, setDocFileList] = useState<UploadFile[]>([]);
  const [editForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [docForm] = Form.useForm();
  const [editCountry, setEditCountry] = useState<string>();

  const clientDocuments = useAppSelector(selectDocuments);
  const clientMeetings = useAppSelector(selectMeetings);
  const clientProposals = useAppSelector(selectProposals);
  const clientLegalDocs = useAppSelector(selectLegal);
  const clientProjects = useAppSelector(selectProjects);
  const clientFinanceSummary = useAppSelector(selectClientFinanceSummary);

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientDetailRequest(clientId));
      dispatch(fetchDocumentsRequest({ clientId, limit: 50 }));
      dispatch(fetchMeetingsRequest({ clientId, limit: 50 }));
      dispatch(fetchProposalsRequest({ clientId, limit: 50 }));
      dispatch(fetchLegalRequest({ clientId, limit: 50 }));
      dispatch(fetchProjectsRequest({ clientId, limit: 50 }));
      dispatch(fetchClientFinanceSummaryRequest(clientId));
    }
    return () => { dispatch(clearClientDetail()); dispatch(clearClientFinanceSummary()); };
  }, [clientId, dispatch]);

  const handleDocUpload = async () => {
    try {
      const values = await docForm.validateFields();
      const file = docFileList[0]?.originFileObj;
      if (!file) return;
      dispatch(uploadDocumentRequest({
        file,
        name: values.name,
        category: values.category || "general",
        clientId,
        tags: values.tags || "",
      }));
      setDocUploadOpen(false);
      setDocFileList([]);
      docForm.resetFields();
    } catch {}
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      dispatch(updateClientRequest({ id: clientId, data: values }));
      setEditDrawerOpen(false);
    } catch {
      // validation failed
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete client",
      content: `Are you sure you want to delete ${client?.companyName}? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(deleteClientRequest(clientId));
        router.push(APP_ROUTES.clients);
      },
    });
  };

  const handleContactSubmit = async () => {
    try {
      const values = await contactForm.validateFields();
      if (editingContact) {
        dispatch(updateContactRequest({ clientId, contactId: editingContact.id, data: values }));
      } else {
        dispatch(addContactRequest({ clientId, ...values }));
      }
      setContactDrawerOpen(false);
      setEditingContact(null);
      contactForm.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    Modal.confirm({
      title: "Remove contact",
      content: `Remove ${contact.fullName} from this client?`,
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: () => dispatch(removeContactRequest({ clientId, contactId: contact.id })),
    });
  };

  const openContactDrawer = (contact?: Contact) => {
    setEditingContact(contact ?? null);
    if (contact) {
      contactForm.setFieldsValue(contact);
    } else {
      contactForm.resetFields();
    }
    setContactDrawerOpen(true);
  };

  if (!client) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.clients)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">
          Back to Clients
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{client.companyName}</Typography.Title>
                <Tag color={statusColors[client.status] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">
                  {client.status.replace("_", " ")}
                </Tag>
              </div>
              <Typography.Text className="text-zinc-500 text-sm">
                {sourceLabels[client.sourceType] || client.sourceType}
                {client.referredBy && <> &middot; Referred by {client.referredBy}</>}
              </Typography.Text>
            </div>
          </div>
          <Space>
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => { editForm.setFieldsValue(client); setEditCountry(client.country ?? undefined); setEditDrawerOpen(true); }}>
              Edit
            </Button>
            <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
              Delete
            </Button>
          </Space>
        </div>
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div className="space-y-6">
                <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Company Information">
                  <Descriptions column={{ xs: 1, sm: 2 }} colon={false} className="[&_.ant-descriptions-item-content]:text-zinc-900">
                    {client.email && <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Email</span>}>{client.email}</Descriptions.Item>}
                    {client.phone && <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Phone</span>}>{client.phone}</Descriptions.Item>}
                    {client.industry && <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Industry</span>}>{client.industry}</Descriptions.Item>}
                    {client.country && <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Country</span>}>{client.country}</Descriptions.Item>}
                    {client.timezone && <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Timezone</span>}>{client.timezone}</Descriptions.Item>}
                    {client.website && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Website</span>}>
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{client.website}</a>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Source</span>}>{sourceLabels[client.sourceType] || client.sourceType}</Descriptions.Item>
                    {client.referredBy && <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Referred By</span>}>{client.referredBy}</Descriptions.Item>}
                  </Descriptions>
                </Card>

                {client.internalNotes && (
                  <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Internal Notes">
                    <Typography.Paragraph className="!text-zinc-700 !whitespace-pre-wrap">{client.internalNotes}</Typography.Paragraph>
                  </Card>
                )}

                <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                  <div className="flex items-center justify-between w-full">
                    <span>Activity Timeline</span>
                  </div>
                }>
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
            ),
          },
          {
            key: "documents",
            label: `Documents (${clientDocuments.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Documents</span>
                  <Button type="primary" size="small" icon={<UploadIcon className="w-4 h-4" />} onClick={() => setDocUploadOpen(true)}>
                    Upload Document
                  </Button>
                </div>
              }>
                {clientDocuments.length === 0 ? (
                  <Empty description="No documents for this client" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDocUploadOpen(true)}>
                      Upload Document
                    </Button>
                  </Empty>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {clientDocuments.map((doc: Document) => (
                      <Link key={doc.id} href={`${APP_ROUTES.documents}/${doc.id}`} className="flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                        <span className="text-xl shrink-0">{fileTypeIcons[doc.fileType] || "📄"}</span>
                        <div className="flex-1 min-w-0">
                          <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{doc.name}</Typography.Text>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Tag color={docCategoryColors[doc.category] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{docCategoryLabels[doc.category] || doc.category}</Tag>
                            <Typography.Text className="text-xs text-zinc-400">{new Date(doc.createdAt).toLocaleDateString()}</Typography.Text>
                            {doc.tags?.slice(0, 2).map((t: string) => <Tag key={t} className="!text-[10px] !px-1.5 !py-0 !leading-none !rounded-full">{t}</Tag>)}
                          </div>
                        </div>
                        <Typography.Text className="text-xs text-zinc-400 shrink-0">{doc.fileType.toUpperCase()}</Typography.Text>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "meetings",
            label: `Meetings (${clientMeetings.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Meeting History</span>
                  <Link href={`${APP_ROUTES.meetings}?clientId=${clientId}`}>
                    <Button type="primary" size="small" icon={<Calendar className="w-4 h-4" />}>View All</Button>
                  </Link>
                </div>
              }>
                {clientMeetings.length === 0 ? (
                  <Empty description="No meetings for this client" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Link href={`${APP_ROUTES.meetings}?clientId=${clientId}`}>
                      <Button type="primary" icon={<Plus className="w-4 h-4" />}>Schedule Meeting</Button>
                    </Link>
                  </Empty>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {clientMeetings.map((m: Meeting) => (
                      <Link key={m.id} href={`${APP_ROUTES.meetings}/${m.id}`} className="flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{m.title}</Typography.Text>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <span>{new Date(m.meetingDate).toLocaleDateString()}</span>
                            <Tag color={meetingTypeColors[m.meetingType] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{meetingTypeLabels[m.meetingType] || m.meetingType}</Tag>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 shrink-0">
                          <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{m.actionItemCount}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "proposals",
            label: `Proposals (${clientProposals.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Proposals</span>
                  <Link href={`${APP_ROUTES.proposals}?clientId=${clientId}`}>
                    <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />}>New Proposal</Button>
                  </Link>
                </div>
              }>
                {clientProposals.length === 0 ? (
                  <Empty description="No proposals for this client" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Link href={`${APP_ROUTES.proposals}?clientId=${clientId}`}>
                      <Button type="primary" icon={<Plus className="w-4 h-4" />}>Create Proposal</Button>
                    </Link>
                  </Empty>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {clientProposals.map((p: Proposal) => (
                      <Link key={p.id} href={`${APP_ROUTES.proposals}/${p.id}`} className="flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{p.name}</Typography.Text>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <Tag color={proposalStatusColors[p.status] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{proposalStatusLabels[p.status] || p.status}</Tag>
                            <span>v{p.version}</span>
                          </div>
                        </div>
                        {p.pricing && p.pricing.cost > 0 && (
                          <Typography.Text className="text-xs font-medium text-zinc-600 shrink-0">{p.pricing.currency} {p.pricing.cost.toLocaleString()}</Typography.Text>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "legal",
            label: `Legal (${clientLegalDocs.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Legal Documents</span>
                  <Link href={`${APP_ROUTES.legal}?clientId=${clientId}`}>
                    <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />}>New Document</Button>
                  </Link>
                </div>
              }>
                {clientLegalDocs.length === 0 ? (
                  <Empty description="No legal documents for this client" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Link href={`${APP_ROUTES.legal}?clientId=${clientId}`}>
                      <Button type="primary" icon={<Plus className="w-4 h-4" />}>Create Document</Button>
                    </Link>
                  </Empty>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {clientLegalDocs.map((d: LegalDocument) => (
                      <Link key={d.id} href={`${APP_ROUTES.legal}/${d.id}`} className="flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                          <Scale className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{d.name}</Typography.Text>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <Tag color={legalTypeColors[d.documentType] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{legalTypeLabels[d.documentType] || d.documentType}</Tag>
                            <Tag color={legalStatusColors[d.status] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{legalStatusLabels[d.status] || d.status}</Tag>
                          </div>
                        </div>
                        {d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && new Date(d.expiryDate) > new Date() && (
                          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "projects",
            label: `Projects (${clientProjects.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Projects</span>
                  <Link href={`${APP_ROUTES.projects}?clientId=${clientId}`}>
                    <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />}>New Project</Button>
                  </Link>
                </div>
              }>
                {clientProjects.length === 0 ? (
                  <Empty description="No projects for this client" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Link href={`${APP_ROUTES.projects}?clientId=${clientId}`}>
                      <Button type="primary" icon={<Plus className="w-4 h-4" />}>Create Project</Button>
                    </Link>
                  </Empty>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {clientProjects.map((p: Project) => (
                      <Link key={p.id} href={`${APP_ROUTES.projects}/${p.id}`} className="flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                          <FolderKanban className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{p.name}</Typography.Text>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <Tag color={projectStatusColors[p.status] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{projectStatusLabels[p.status] || p.status}</Tag>
                            <Tag color={projectHealthColors[p.health] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none">{projectHealthLabels[p.health] || p.health}</Tag>
                          </div>
                        </div>
                        {p.targetDate && (
                          <Typography.Text className={`text-xs shrink-0 ${new Date(p.targetDate) < new Date() && (p.status === "active" || p.status === "planning") ? "text-red-500 font-medium" : "text-zinc-400"}`}>
                            {new Date(p.targetDate).toLocaleDateString()}
                          </Typography.Text>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "finance",
            label: `Finance`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Financial Summary">
                {!clientFinanceSummary ? (
                  <Spin />
                ) : (
                  <div className="space-y-6">
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6}>
                        <Card className="!rounded-xl !border-zinc-100" size="small">
                          <Statistic title="Total Contract Value" prefix={<DollarSign className="w-4 h-4 text-zinc-400 mr-1" />} value={clientFinanceSummary.totalContractValue} precision={2} />
                        </Card>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Card className="!rounded-xl !border-zinc-100" size="small">
                          <Statistic title="Total Received" prefix={<TrendingUp className="w-4 h-4 text-green-500 mr-1" />} value={clientFinanceSummary.totalReceived} precision={2} valueStyle={{ color: "#16a34a" }} />
                        </Card>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Card className="!rounded-xl !border-zinc-100" size="small">
                          <Statistic title="Remaining Balance" prefix={<Clock className="w-4 h-4 text-orange-500 mr-1" />} value={clientFinanceSummary.remainingBalance} precision={2} valueStyle={{ color: clientFinanceSummary.remainingBalance > 0 ? "#ea580c" : undefined }} />
                        </Card>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Card className="!rounded-xl !border-zinc-100" size="small">
                          <Statistic title="Completion" prefix={<Percent className="w-4 h-4 text-blue-500 mr-1" />} value={clientFinanceSummary.completionPercentage} suffix="%" precision={1} />
                        </Card>
                      </Col>
                    </Row>
                    <Typography.Title level={5}>Invoices</Typography.Title>
                    {clientFinanceSummary.invoices.length === 0 ? (
                      <Empty description="No invoices" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <div className="divide-y divide-zinc-100">
                        {clientFinanceSummary.invoices.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between py-3 px-2">
                            <div>
                              <Typography.Text className="font-medium">#{inv.invoiceNumber}</Typography.Text>
                              <Tag color={invoiceStatusColors[inv.status] || "default"} className="!ml-2 !text-[10px] !px-1.5 !py-0">{invoiceStatusLabels[inv.status] || inv.status}</Tag>
                            </div>
                            <Typography.Text>{inv.currency} {inv.amount.toLocaleString()}</Typography.Text>
                          </div>
                        ))}
                      </div>
                    )}
                    <Typography.Title level={5}>Payments</Typography.Title>
                    {clientFinanceSummary.payments.length === 0 ? (
                      <Empty description="No payments" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <div className="divide-y divide-zinc-100">
                        {clientFinanceSummary.payments.map((pay) => (
                          <div key={pay.id} className="flex items-center justify-between py-3 px-2">
                            <div>
                              <Typography.Text className="font-medium">{paymentTypeLabels[pay.paymentType] || pay.paymentType}</Typography.Text>
                              <Typography.Text className="text-xs text-zinc-400 ml-2">{new Date(pay.paymentDate).toLocaleDateString()}</Typography.Text>
                            </div>
                            <Typography.Text className="text-green-600 font-medium">{pay.currency} {pay.amount.toLocaleString()}</Typography.Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: "contacts",
            label: `Contacts (${contacts.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Contacts</span>
                  <Button type="primary" size="small" icon={<UserPlus className="w-4 h-4" />} onClick={() => openContactDrawer()}>
                    Add Contact
                  </Button>
                </div>
              }>
                {contacts.length === 0 ? (
                  <Empty description="No contacts yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => openContactDrawer()}>
                      Add Contact
                    </Button>
                  </Empty>
                ) : (
                  <List
                    dataSource={contacts}
                    renderItem={(contact) => (
                      <List.Item
                        className="!border-zinc-100 !py-4"
                        actions={[
                          <Dropdown key="more" menu={{
                            items: [
                              { key: "edit", icon: <Edit3 className="w-4 h-4" />, label: "Edit", onClick: () => openContactDrawer(contact) },
                              { type: "divider" },
                              { key: "delete", icon: <Trash2 className="w-4 h-4" />, label: "Remove", danger: true, onClick: () => handleDeleteContact(contact) },
                            ],
                          }}>
                            <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                          </Dropdown>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-medium text-zinc-600 shrink-0">
                              {contact.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-900">{contact.fullName}</span>
                              {contact.isPrimary && <Tag color="blue" className="!text-[10px] !px-1.5 !py-0 !leading-none !rounded-full">Primary</Tag>}
                            </div>
                          }
                          description={
                            <div className="space-y-1 mt-1">
                              {contact.designation && <Typography.Text className="!text-xs !text-zinc-500 block">{contact.designation}</Typography.Text>}
                              <div className="flex flex-wrap gap-3">
                                {contact.email && (
                                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <Mail className="w-3 h-3" /> {contact.email}
                                  </a>
                                )}
                                {contact.phone && (
                                  <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
                                    <Phone className="w-3 h-3" /> {contact.phone}
                                  </a>
                                )}
                                {contact.linkedinProfile && (
                                  <a href={contact.linkedinProfile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <ExternalLink className="w-3 h-3" /> LinkedIn
                                  </a>
                                )}
                              </div>
                              {contact.notes && <Typography.Text className="!text-xs !text-zinc-400 block italic">{contact.notes}</Typography.Text>}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />

      <Drawer
        title="Edit Client"
        width={560}
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => setEditDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleUpdate}>Save Changes</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="companyName" label="Company Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="email" label="Email"><AntInput /></Form.Item>
          <Form.Item name="phone" label="Phone"><AntInput /></Form.Item>
          <Form.Item name="website" label="Website"><AntInput /></Form.Item>
          <Form.Item name="industry" label="Industry">
            <Select showSearch placeholder="Select industry" options={INDUSTRY_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Select showSearch placeholder="Select country" options={COUNTRY_OPTIONS} allowClear onChange={(val) => { setEditCountry(val); editForm.setFieldValue("timezone", undefined); }} />
          </Form.Item>
          <Form.Item name="timezone" label="Timezone">
            <Select showSearch placeholder={editCountry ? "Select timezone for " + editCountry : "Select a country first"} options={getFilteredTimezones(editCountry)} allowClear disabled={!editCountry} />
          </Form.Item>
          <Form.Item name="sourceType" label="Source">
            <Select options={[
              { value: "referral", label: "Referral" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "upwork", label: "Upwork" },
              { value: "website", label: "Website" },
              { value: "existing_client", label: "Existing Client" },
              { value: "partner", label: "Partner" },
              { value: "cold_outreach", label: "Cold Outreach" },
              { value: "other", label: "Other" },
            ]} />
          </Form.Item>
          <Form.Item name="referredBy" label="Referred By"><AntInput /></Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[
              { value: "active", label: "Active" },
              { value: "on_hold", label: "On Hold" },
              { value: "completed", label: "Completed" },
              { value: "inactive", label: "Inactive" },
            ]} />
          </Form.Item>
          <Form.Item name="internalNotes" label="Internal Notes"><AntInput.TextArea rows={3} /></Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Upload Document"
        width={520}
        open={docUploadOpen}
        onClose={() => { setDocUploadOpen(false); setDocFileList([]); docForm.resetFields(); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => { setDocUploadOpen(false); setDocFileList([]); docForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={handleDocUpload}>Upload</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={docForm} layout="vertical">
          <Form.Item name="name" label="Document Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="e.g. Q1 Proposal" />
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
          <Form.Item name="tags" label="Tags (comma-separated)">
            <AntInput placeholder="e.g. React, Mobile App" />
          </Form.Item>
          <Form.Item label="File" required>
            <Upload.Dragger
              multiple={false}
              fileList={docFileList}
              onChange={({ fileList: fl }) => setDocFileList(fl.slice(-1))}
              beforeUpload={() => false}
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip"
            >
              <div className="flex flex-col items-center py-4">
                <UploadIcon className="w-10 h-10 text-zinc-300 mb-3" />
                <Typography.Text className="text-sm font-medium text-zinc-600">Drag & drop or click to browse</Typography.Text>
                <Typography.Text className="text-xs text-zinc-400 mt-1">PDF, DOCX, XLSX, Images, ZIP</Typography.Text>
              </div>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingContact ? "Edit Contact" : "Add Contact"}
        width={560}
        open={contactDrawerOpen}
        onClose={() => { setContactDrawerOpen(false); setEditingContact(null); contactForm.resetFields(); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => { setContactDrawerOpen(false); setEditingContact(null); contactForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={handleContactSubmit}>{editingContact ? "Save" : "Add Contact"}</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={contactForm} layout="vertical">
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="e.g. Jane Doe" />
          </Form.Item>
          <Form.Item name="designation" label="Designation"><AntInput placeholder="e.g. CEO" /></Form.Item>
          <Form.Item name="email" label="Email"><AntInput placeholder="jane@example.com" /></Form.Item>
          <Form.Item name="phone" label="Phone"><AntInput placeholder="+1 555-0123" /></Form.Item>
          <Form.Item name="linkedinProfile" label="LinkedIn Profile"><AntInput placeholder="https://linkedin.com/in/..." /></Form.Item>
          <Form.Item name="notes" label="Notes"><AntInput.TextArea rows={2} /></Form.Item>
          <Form.Item name="isPrimary" label="Primary Contact" valuePropName="checked">
            <Select options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
