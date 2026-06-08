"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, Space, Tag, Card, Row, Col, Statistic, Empty, Typography, Drawer, Form, DatePicker, Modal, App } from "antd";
import { Plus, Search, FolderKanban, CheckCircle, Clock, AlertTriangle, Flag, Calendar, Building2, User } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDebounce } from "@/hooks/useDebounce";
import type { Project } from "@/types/models/Project";
import { fetchProjectsRequest, createProjectRequest, deleteProjectRequest, fetchStatsRequest } from "@/store/modules/projects/projectsSlice";
import { selectProjects, selectProjectsMeta, selectProjectsStats } from "@/store/modules/projects/projectsSelectors";
import { selectClients } from "@/store/modules/clients/clientsSelectors";
import { fetchClientsRequest } from "@/store/modules/clients/clientsSlice";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const statusColors: Record<string, string> = {
  planning: "blue", active: "green", on_hold: "orange", completed: "default", cancelled: "red",
};
const statusLabels: Record<string, string> = {
  planning: "Planning", active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled",
};
const healthColors: Record<string, string> = { healthy: "green", attention_needed: "orange", at_risk: "red" };
const healthLabels: Record<string, string> = { healthy: "Healthy", attention_needed: "Attention Needed", at_risk: "At Risk" };

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const meta = useAppSelector(selectProjectsMeta);
  const stats = useAppSelector(selectProjectsStats);
  const clients = useAppSelector(selectClients);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchProjectsRequest({ search: debouncedSearch, status: statusFilter, clientId: clientFilter, limit: 50 }));
  }, [debouncedSearch, statusFilter, clientFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchStatsRequest());
    dispatch(fetchClientsRequest({ limit: 200 }));
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      dispatch(createProjectRequest({
        name: values.name,
        clientId: values.clientId,
        description: values.description,
        status: values.status || "planning",
        startDate: values.startDate?.toISOString(),
        targetDate: values.targetDate?.toISOString(),
      }));
      setDrawerOpen(false);
      form.resetFields();
    } catch {}
  };

  const handleDelete = (project: Project) => {
    Modal.confirm({
      title: "Delete project", content: `Delete "${project.name}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => dispatch(deleteProjectRequest(project.id)),
    });
  };

  const isDelayed = (p: Project) => p.targetDate && new Date(p.targetDate) < new Date() && (p.status === "active" || p.status === "planning");

  return (
    <div>
      <PageHeader title="Project Hub" subtitle="Manage project execution, milestones, deliverables, and risks." />

      {stats && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Active Projects" value={stats.activeProjects} prefix={<FolderKanban className="w-4 h-4 text-blue-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Completed" value={stats.completedProjects} prefix={<CheckCircle className="w-4 h-4 text-green-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#16a34a" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Delayed" value={stats.delayedProjects} prefix={<Clock className="w-4 h-4 text-red-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#dc2626" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Upcoming Milestones" value={stats.upcomingMilestones} prefix={<Flag className="w-4 h-4 text-purple-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#7c3aed" }} />
            </Card>
          </Col>
        </Row>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Input.Search placeholder="Search projects..." allowClear onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select placeholder="Status" allowClear style={{ width: 130 }} onChange={(val) => setStatusFilter(val)}
          options={[
            { value: "planning", label: "Planning" }, { value: "active", label: "Active" },
            { value: "on_hold", label: "On Hold" }, { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]} />
        <Select placeholder="Client" allowClear showSearch style={{ width: 180 }} onChange={(val) => setClientFilter(val)}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
        <div className="flex-1" />
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>New Project</Button>
      </div>

      {meta.isLoading && projects.length === 0 ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <FolderKanban className="w-16 h-16 mb-4 text-zinc-300" />
          <Typography.Text className="text-lg font-medium text-zinc-500">No projects yet</Typography.Text>
          <Typography.Text className="text-sm text-zinc-400 mb-4">Create your first project to start tracking execution.</Typography.Text>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>New Project</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <Link key={project.id} href={`${APP_ROUTES.projects}/${project.id}`} className="block group">
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm hover:!shadow-md hover:!border-zinc-300 transition-all !cursor-pointer" size="small">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                    <FolderKanban className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography.Text className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{project.name}</Typography.Text>
                      <Tag color={statusColors[project.status] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0">
                        {statusLabels[project.status] || project.status}
                      </Tag>
                      <Tag color={healthColors[project.health] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0">
                        {healthLabels[project.health] || project.health}
                      </Tag>
                      {isDelayed(project) && (
                        <Tag color="red" className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Delayed
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      {project.clientName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{project.clientName}</span>}
                      {project.projectManager && <span className="flex items-center gap-1"><User className="w-3 h-3" />{project.projectManager}</span>}
                      {project.targetDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(project.targetDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Drawer title="New Project" width={560} open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        footer={<Space className="w-full justify-end"><Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Cancel</Button><Button type="primary" onClick={handleCreate}>Create Project</Button></Space>}
        destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Project Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. BuildCore AI Platform" />
          </Form.Item>
          <Form.Item name="clientId" label="Client">
            <Select showSearch allowClear placeholder="Select client"
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="planning">
            <Select options={[
              { value: "planning", label: "Planning" }, { value: "active", label: "Active" },
              { value: "on_hold", label: "On Hold" }, { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="targetDate" label="Target Delivery Date"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Project overview..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
