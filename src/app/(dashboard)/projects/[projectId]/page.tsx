"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Tag, Card, Tabs, Space, Typography, Empty, Spin, Modal, Form, Input as AntInput, Select, Drawer, List, DatePicker, Row, Col, Statistic } from "antd";
import { ArrowLeft, FolderKanban, CheckCircle, Clock, AlertTriangle, Flag, Calendar, Building2, User, Edit3, Trash2, Plus, Target, FileText, Scale, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchProjectDetailRequest, clearProjectDetail, updateProjectRequest, deleteProjectRequest,
  addMilestoneRequest, updateMilestoneRequest, deleteMilestoneRequest,
  addDeliverableRequest, updateDeliverableRequest, deleteDeliverableRequest,
  addRiskRequest, updateRiskRequest, deleteRiskRequest,
} from "@/store/modules/projects/projectsSlice";
import {
  selectProjectDetail, selectProjectMilestones, selectProjectDeliverables, selectProjectRisks, selectProjectActivities,
} from "@/store/modules/projects/projectsSelectors";
import { fetchDocumentsRequest } from "@/store/modules/documents/documentsSlice";
import { selectDocuments } from "@/store/modules/documents/documentsSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const statusColors: Record<string, string> = {
  planning: "blue", active: "green", on_hold: "orange", completed: "default", cancelled: "red",
};
const statusLabels: Record<string, string> = {
  planning: "Planning", active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled",
};
const healthColors: Record<string, string> = { healthy: "green", attention_needed: "orange", at_risk: "red" };
const healthLabels: Record<string, string> = { healthy: "Healthy", attention_needed: "Attention Needed", at_risk: "At Risk" };
const severityColors: Record<string, string> = { low: "default", medium: "orange", high: "red", critical: "magenta" };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectProjectDetail);
  const milestones = useAppSelector(selectProjectMilestones);
  const deliverables = useAppSelector(selectProjectDeliverables);
  const risks = useAppSelector(selectProjectRisks);
  const activities = useAppSelector(selectProjectActivities);
  const projectDocs = useAppSelector(selectDocuments);

  const projectId = params.projectId as string;
  const project = detail?.project ?? null;

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneForm] = Form.useForm();
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [deliverableForm] = Form.useForm();
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [riskForm] = Form.useForm();

  useEffect(() => {
    if (projectId) dispatch(fetchProjectDetailRequest(projectId));
    return () => { dispatch(clearProjectDetail()); };
  }, [projectId, dispatch]);

  useEffect(() => {
    if (project?.clientId) {
      dispatch(fetchDocumentsRequest({ clientId: project.clientId, limit: 50 }));
    }
  }, [project?.clientId, dispatch]);

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      dispatch(updateProjectRequest({
        id: projectId,
        data: {
          ...values,
          startDate: values.startDate?.toISOString(),
          targetDate: values.targetDate?.toISOString(),
        },
      }));
      setEditDrawerOpen(false);
    } catch {}
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete project", content: `Delete "${project?.name}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => { dispatch(deleteProjectRequest(projectId)); router.push(APP_ROUTES.projects); },
    });
  };

  const handleAddMilestone = async () => {
    try {
      const values = await milestoneForm.validateFields();
      dispatch(addMilestoneRequest({ projectId, name: values.name, targetDate: values.targetDate?.toISOString() }));
      setMilestoneModalOpen(false);
      milestoneForm.resetFields();
    } catch {}
  };

  const toggleMilestoneStatus = (ms: { id: string; status: string }) => {
    const newStatus = ms.status === "completed" ? "pending" : "completed";
    dispatch(updateMilestoneRequest({ projectId, milestoneId: ms.id, data: { status: newStatus } }));
  };

  const handleAddDeliverable = async () => {
    try {
      const values = await deliverableForm.validateFields();
      dispatch(addDeliverableRequest({ projectId, name: values.name }));
      setDeliverableModalOpen(false);
      deliverableForm.resetFields();
    } catch {}
  };

  const toggleDeliverableStatus = (d: { id: string; status: string }) => {
    const newStatus = d.status === "completed" ? "pending" : "completed";
    dispatch(updateDeliverableRequest({ projectId, deliverableId: d.id, data: { status: newStatus } }));
  };

  const handleAddRisk = async () => {
    try {
      const values = await riskForm.validateFields();
      dispatch(addRiskRequest({ projectId, title: values.title, severity: values.severity || "medium", notes: values.notes }));
      setRiskModalOpen(false);
      riskForm.resetFields();
    } catch {}
  };

  const handleStatusChange = (newStatus: string) => {
    dispatch(updateProjectRequest({ id: projectId, data: { status: newStatus } }));
  };

  const handleHealthChange = (newHealth: string) => {
    dispatch(updateProjectRequest({ id: projectId, data: { health: newHealth } }));
  };

  if (!project) {
    return <div className="flex justify-center items-center py-32"><Spin size="large" /></div>;
  }

  const isDelayed = project.targetDate && new Date(project.targetDate) < new Date() && (project.status === "active" || project.status === "planning");

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.projects)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">Back to Projects</Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <FolderKanban className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{project.name}</Typography.Title>
                <Tag color={statusColors[project.status] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">{statusLabels[project.status] || project.status}</Tag>
                <Tag color={healthColors[project.health] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">{healthLabels[project.health] || project.health}</Tag>
                {isDelayed && <Tag color="red" className="!rounded-full !px-2 !py-0 !text-xs"><Clock className="w-3 h-3 inline mr-1" />Delayed</Tag>}
              </div>
              <Typography.Text className="text-zinc-500 text-sm">
                {project.clientName && <>{project.clientName} &middot; </>}
                {project.projectManager && <>PM: {project.projectManager} &middot; </>}
                Updated {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Typography.Text>
            </div>
          </div>
          <Space wrap>
            <Select value={project.status} onChange={handleStatusChange} style={{ width: 130 }}
              options={[
                { value: "planning", label: "Planning" }, { value: "active", label: "Active" },
                { value: "on_hold", label: "On Hold" }, { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]} />
            <Select value={project.health} onChange={handleHealthChange} style={{ width: 150 }}
              options={[
                { value: "healthy", label: "Healthy" }, { value: "attention_needed", label: "Attention Needed" },
                { value: "at_risk", label: "At Risk" },
              ]} />
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => {
              editForm.setFieldsValue({ ...project, startDate: project.startDate ? new Date(project.startDate) : undefined, targetDate: project.targetDate ? new Date(project.targetDate) : undefined });
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
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Project Information" size="small">
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</Typography.Text>
                    <Tag color={statusColors[project.status] || "default"} className="!rounded-full !mt-1">{statusLabels[project.status] || project.status}</Tag>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Health</Typography.Text>
                    <Tag color={healthColors[project.health] || "default"} className="!rounded-full !mt-1">{healthLabels[project.health] || project.health}</Tag>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Client</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{project.clientName || "—"}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Project Manager</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{project.projectManager || "—"}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Start Date</Typography.Text>
                    <Typography.Text className="text-sm text-zinc-900 block mt-1">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</Typography.Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Target Delivery</Typography.Text>
                    <Typography.Text className={`text-sm block mt-1 ${isDelayed ? "text-red-600 font-medium" : "text-zinc-900"}`}>
                      {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : "—"}
                      {isDelayed && <Tag color="red" className="!ml-2 !rounded-full !text-[10px]">Overdue</Tag>}
                    </Typography.Text>
                  </Col>
                </Row>
              </Card>
              {project.description && (
                <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Description" size="small">
                  <Typography.Paragraph className="!text-zinc-700 !whitespace-pre-wrap">{project.description}</Typography.Paragraph>
                </Card>
              )}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
                    <Statistic title="Milestones" value={milestones.length} prefix={<Flag className="w-4 h-4 text-blue-500 mr-1" />} valueStyle={{ fontSize: 20 }} />
                    <Typography.Text className="text-xs text-zinc-400">{milestones.filter((m) => m.status === "completed").length} completed</Typography.Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
                    <Statistic title="Deliverables" value={deliverables.length} prefix={<Target className="w-4 h-4 text-purple-500 mr-1" />} valueStyle={{ fontSize: 20 }} />
                    <Typography.Text className="text-xs text-zinc-400">{deliverables.filter((d) => d.status === "completed").length} completed</Typography.Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
                    <Statistic title="Risks" value={risks.length} prefix={<Shield className="w-4 h-4 text-orange-500 mr-1" />} valueStyle={{ fontSize: 20 }} />
                    <Typography.Text className="text-xs text-zinc-400">{risks.filter((r) => r.severity === "high" || r.severity === "critical").length} high/critical</Typography.Text>
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        },
        {
          key: "milestones", label: `Milestones (${milestones.length})`,
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
              <div className="flex items-center justify-between w-full">
                <span>Milestones</span>
                <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setMilestoneModalOpen(true)}>Add Milestone</Button>
              </div>
            }>
              {milestones.length === 0 ? (
                <Empty description="No milestones defined" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setMilestoneModalOpen(true)}>Add Milestone</Button>
                </Empty>
              ) : (
                <div className="relative">
                  <div className="absolute left-[23px] top-3 bottom-3 w-0.5 bg-zinc-200" />
                  {milestones.map((ms, idx) => (
                    <div key={ms.id} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                      <Button type="text" size="small" className="!p-0 !mt-0.5 z-10"
                        onClick={() => toggleMilestoneStatus(ms)}
                        icon={<div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${ms.status === "completed" ? "bg-green-500 border-green-500" : "border-zinc-300"}`}>
                          {ms.status === "completed" && <span className="text-white text-xs">✓</span>}
                        </div>} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Typography.Text className={`text-sm font-medium ${ms.status === "completed" ? "line-through text-zinc-400" : "text-zinc-900"}`}>{ms.name}</Typography.Text>
                          <Tag color={ms.status === "completed" ? "green" : ms.status === "in_progress" ? "blue" : "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none">
                            {ms.status.replace("_", " ")}
                          </Tag>
                        </div>
                        {ms.targetDate && (
                          <Typography.Text className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />{new Date(ms.targetDate).toLocaleDateString()}
                          </Typography.Text>
                        )}
                      </div>
                      <Button type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => dispatch(deleteMilestoneRequest({ projectId, milestoneId: ms.id }))} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ),
        },
        {
          key: "deliverables", label: `Deliverables (${deliverables.length})`,
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
              <div className="flex items-center justify-between w-full">
                <span>Deliverables</span>
                <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setDeliverableModalOpen(true)}>Add Deliverable</Button>
              </div>
            }>
              {deliverables.length === 0 ? (
                <Empty description="No deliverables defined" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDeliverableModalOpen(true)}>Add Deliverable</Button>
                </Empty>
              ) : (
                <List dataSource={deliverables} renderItem={(d) => (
                  <List.Item className="!border-zinc-100 !py-3" actions={[
                    <Button key="del" type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => dispatch(deleteDeliverableRequest({ projectId, deliverableId: d.id }))} />,
                  ]}>
                    <div className="flex items-start gap-3 w-full">
                      <Button type="text" size="small" className="!p-0 !mt-0.5"
                        onClick={() => toggleDeliverableStatus(d)}
                        icon={<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${d.status === "completed" ? "bg-green-500 border-green-500" : "border-zinc-300"}`}>
                          {d.status === "completed" && <span className="text-white text-[10px]">✓</span>}
                        </div>} />
                      <div className="flex-1 min-w-0">
                        <Typography.Text className={`text-sm ${d.status === "completed" ? "line-through text-zinc-400" : "text-zinc-900"}`}>{d.name}</Typography.Text>
                        <Tag color={d.status === "completed" ? "green" : d.status === "in_progress" ? "blue" : "orange"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none !ml-2">
                          {d.status.replace("_", " ")}
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                )} />
              )}
            </Card>
          ),
        },
        {
          key: "risks", label: `Risks (${risks.length})`,
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
              <div className="flex items-center justify-between w-full">
                <span>Risks</span>
                <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setRiskModalOpen(true)}>Add Risk</Button>
              </div>
            }>
              {risks.length === 0 ? (
                <Empty description="No risks identified" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setRiskModalOpen(true)}>Add Risk</Button>
                </Empty>
              ) : (
                <List dataSource={risks} renderItem={(risk) => (
                  <List.Item className="!border-zinc-100 !py-3" actions={[
                    <Button key="del" type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => dispatch(deleteRiskRequest({ projectId, riskId: risk.id }))} />,
                  ]}>
                    <div className="flex items-start gap-3 w-full">
                      <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${risk.severity === "critical" ? "text-magenta-500" : risk.severity === "high" ? "text-red-500" : risk.severity === "medium" ? "text-orange-500" : "text-zinc-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Typography.Text className="text-sm text-zinc-900">{risk.title}</Typography.Text>
                          <Tag color={severityColors[risk.severity] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none">{risk.severity}</Tag>
                          <Tag color={risk.status === "closed" ? "default" : risk.status === "mitigated" ? "green" : "orange"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none">{risk.status.replace("_", " ")}</Tag>
                        </div>
                        {risk.notes && <Typography.Text className="text-xs text-zinc-500 block mt-1">{risk.notes}</Typography.Text>}
                      </div>
                    </div>
                  </List.Item>
                )} />
              )}
            </Card>
          ),
        },
        {
          key: "documents", label: "Documents",
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Related Documents">
              {projectDocs.length === 0 ? (
                <Empty description="No related documents" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div className="divide-y divide-zinc-100">
                  {projectDocs.map((doc) => (
                    <Link key={doc.id} href={`${APP_ROUTES.documents}/${doc.id}`} className="flex items-center gap-4 py-3 px-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                      <FileText className="w-5 h-5 text-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Typography.Text className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 transition-colors block truncate">{doc.name}</Typography.Text>
                        <Typography.Text className="text-xs text-zinc-400">{doc.fileType?.toUpperCase()} &middot; {new Date(doc.createdAt).toLocaleDateString()}</Typography.Text>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ),
        },
        {
          key: "timeline", label: "Timeline",
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

      <Modal title="Add Milestone" open={milestoneModalOpen} onCancel={() => { setMilestoneModalOpen(false); milestoneForm.resetFields(); }} onOk={handleAddMilestone} okText="Add">
        <Form form={milestoneForm} layout="vertical">
          <Form.Item name="name" label="Milestone Name" rules={[{ required: true, message: "Required" }]}><AntInput placeholder="e.g. Design Complete" /></Form.Item>
          <Form.Item name="targetDate" label="Target Date"><DatePicker className="w-full" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Deliverable" open={deliverableModalOpen} onCancel={() => { setDeliverableModalOpen(false); deliverableForm.resetFields(); }} onOk={handleAddDeliverable} okText="Add">
        <Form form={deliverableForm} layout="vertical">
          <Form.Item name="name" label="Deliverable Name" rules={[{ required: true, message: "Required" }]}><AntInput placeholder="e.g. Admin Dashboard" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Risk" open={riskModalOpen} onCancel={() => { setRiskModalOpen(false); riskForm.resetFields(); }} onOk={handleAddRisk} okText="Add">
        <Form form={riskForm} layout="vertical">
          <Form.Item name="title" label="Risk Title" rules={[{ required: true, message: "Required" }]}><AntInput placeholder="e.g. Client feedback delays" /></Form.Item>
          <Form.Item name="severity" label="Severity" initialValue="medium">
            <Select options={[
              { value: "low", label: "Low" }, { value: "medium", label: "Medium" },
              { value: "high", label: "High" }, { value: "critical", label: "Critical" },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="Notes"><AntInput.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Drawer title="Edit Project" width={560} open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}
        footer={<Space className="w-full justify-end"><Button onClick={() => setEditDrawerOpen(false)}>Cancel</Button><Button type="primary" onClick={handleUpdate}>Save Changes</Button></Space>}
        destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Project Name" rules={[{ required: true, message: "Required" }]}><AntInput /></Form.Item>
          <Form.Item name="projectManager" label="Project Manager"><AntInput placeholder="e.g. John Smith" /></Form.Item>
          <Form.Item name="startDate" label="Start Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="targetDate" label="Target Delivery Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="description" label="Description"><AntInput.TextArea rows={4} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
