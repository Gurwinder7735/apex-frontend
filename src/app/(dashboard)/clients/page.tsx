"use client";

import { useEffect, useState, useMemo } from "react";
import { Button, Input, Select, Space, Tag, Card, Row, Col, Statistic, Empty, Typography, Drawer, Form, Input as AntInput, Modal, App } from "antd";
import { Plus, Search, Building2, Globe, Briefcase, MapPin, RefreshCw, MoreHorizontal, Edit3, Trash2, Users, ArrowUpRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { INDUSTRY_OPTIONS, COUNTRY_OPTIONS, getFilteredTimezones } from "@/lib/constants/clientOptions";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDebounce } from "@/hooks/useDebounce";
import type { Client } from "@/types/models/Client";
import { fetchClientsRequest, createClientRequest, deleteClientRequest, fetchStatsRequest, clearClientDetail } from "@/store/modules/clients/clientsSlice";
import { selectClients, selectClientsMeta, selectClientsStats } from "@/store/modules/clients/clientsSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const statusColors: Record<string, string> = {
  active: "green",
  on_hold: "orange",
  completed: "blue",
  inactive: "red",
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

export default function ClientsPage() {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClients);
  const meta = useAppSelector(selectClientsMeta);
  const stats = useAppSelector(selectClientsStats);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchClientsRequest({ search: debouncedSearch, status: statusFilter, limit: 50 }));
  }, [debouncedSearch, statusFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchStatsRequest());
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      dispatch(createClientRequest(values));
      setDrawerOpen(false);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleDelete = (client: Client) => {
    Modal.confirm({
      title: "Delete client",
      content: `Are you sure you want to delete ${client.companyName}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => dispatch(deleteClientRequest(client.id)),
    });
  };

  const filteredClients = useMemo(() => clients, [clients]);

  return (
    <div>
      <PageHeader title="Client Hub" subtitle="Manage your clients, contacts, and relationships in one place." />

      {stats && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Total Clients" value={stats.totalClients} prefix={<Building2 className="w-4 h-4 text-zinc-400 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Active" value={stats.activeClients} prefix={<Users className="w-4 h-4 text-green-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#16a34a" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="New This Month" value={stats.newThisMonth} prefix={<RefreshCw className="w-4 h-4 text-blue-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Recently Added" value={stats.recentlyAdded} prefix={<ArrowUpRight className="w-4 h-4 text-orange-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
        </Row>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Input.Search
          placeholder="Search clients..."
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 140 }}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: "active", label: "Active" },
            { value: "on_hold", label: "On Hold" },
            { value: "completed", label: "Completed" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <div className="flex-1" />
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>
          Add Client
        </Button>
      </div>

      {meta.isLoading && filteredClients.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Building2 className="w-16 h-16 mb-4 text-zinc-300" />
          <Typography.Text className="text-lg font-medium text-zinc-500">No clients yet</Typography.Text>
          <Typography.Text className="text-sm text-zinc-400 mb-4">Add your first client to get started.</Typography.Text>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>
            Add Client
          </Button>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredClients.map((client) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={client.id}>
              <Link href={`${APP_ROUTES.clients}/${client.id}`} className="block group">
                <Card
                  className="!rounded-xl !border-zinc-200 !shadow-sm hover:!shadow-md hover:!border-zinc-300 transition-all cursor-pointer !h-full"
                  actions={[
                    <Button key="edit" type="text" icon={<Edit3 className="w-4 h-4" />} onClick={(e) => { e.preventDefault(); }} />,
                    <Button key="delete" type="text" danger icon={<Trash2 className="w-4 h-4" />} onClick={(e) => { e.preventDefault(); handleDelete(client); }} />,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                        <Building2 className="w-5 h-5 text-zinc-500" />
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 truncate">{client.companyName}</span>
                        <Tag color={statusColors[client.status] || "default"} className="!text-[10px] !px-1.5 !py-0 !leading-none !m-0 !rounded-full shrink-0">
                          {client.status.replace("_", " ")}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1 mt-2">
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.industry && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate">{client.industry}</span>
                          </div>
                        )}
                        {client.country && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{client.country}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
                          <Users className="w-3 h-3" />
                          <span>{client.contactCount} contact{client.contactCount !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 pt-1">
                          {sourceLabels[client.sourceType] || client.sourceType}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      <Drawer
        title="Add Client"
        width={560}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={handleCreate}>Create Client</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="companyName" label="Company Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="e.g. Acme Corp" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <AntInput placeholder="contact@acme.com" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <AntInput placeholder="+1 555-0123" />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <AntInput placeholder="https://example.com" />
          </Form.Item>
          <Form.Item name="industry" label="Industry">
            <Select showSearch placeholder="Select industry" options={INDUSTRY_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Select showSearch placeholder="Select country" options={COUNTRY_OPTIONS} allowClear onChange={(val) => { setSelectedCountry(val); form.setFieldValue("timezone", undefined); }} />
          </Form.Item>
          <Form.Item name="timezone" label="Timezone">
            <Select showSearch placeholder={selectedCountry ? "Select timezone for " + selectedCountry : "Select a country first"} options={getFilteredTimezones(selectedCountry)} allowClear disabled={!selectedCountry} />
          </Form.Item>
          <Form.Item name="sourceType" label="Source" initialValue="other">
            <Select
              options={[
                { value: "referral", label: "Referral" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "upwork", label: "Upwork" },
                { value: "website", label: "Website" },
                { value: "existing_client", label: "Existing Client" },
                { value: "partner", label: "Partner" },
                { value: "cold_outreach", label: "Cold Outreach" },
                { value: "other", label: "Other" },
              ]}
            />
          </Form.Item>
          <Form.Item name="referredBy" label="Referred By">
            <AntInput placeholder="Name or company" />
          </Form.Item>
          <Form.Item name="internalNotes" label="Internal Notes">
            <AntInput.TextArea rows={3} placeholder="Any internal notes..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
