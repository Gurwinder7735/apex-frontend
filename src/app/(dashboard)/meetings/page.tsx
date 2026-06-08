"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, Space, Tag, Card, Row, Col, Statistic, Empty, Typography, Drawer, Form, DatePicker, Modal, App, List } from "antd";
import { Plus, Search, Calendar, Clock, CheckSquare, MessageSquare, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDebounce } from "@/hooks/useDebounce";
import type { Meeting } from "@/types/models/Meeting";
import { fetchMeetingsRequest, createMeetingRequest, deleteMeetingRequest, fetchStatsRequest } from "@/store/modules/meetings/meetingsSlice";
import { selectMeetings, selectMeetingsMeta, selectMeetingsStats } from "@/store/modules/meetings/meetingsSelectors";
import { selectClients } from "@/store/modules/clients/clientsSelectors";
import { fetchClientsRequest } from "@/store/modules/clients/clientsSlice";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const typeColors: Record<string, string> = {
  discovery: "blue", weekly_sync: "green", demo: "purple", planning: "orange", review: "cyan", internal: "geekblue", other: "default",
};

const typeLabels: Record<string, string> = {
  discovery: "Discovery", weekly_sync: "Weekly Sync", demo: "Demo", planning: "Planning", review: "Review", internal: "Internal", other: "Other",
};

export default function MeetingsPage() {
  const dispatch = useAppDispatch();
  const meetings = useAppSelector(selectMeetings);
  const meta = useAppSelector(selectMeetingsMeta);
  const stats = useAppSelector(selectMeetingsStats);
  const clients = useAppSelector(selectClients);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchMeetingsRequest({ search: debouncedSearch, meetingType: typeFilter, clientId: clientFilter, limit: 50 }));
  }, [debouncedSearch, typeFilter, clientFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchStatsRequest());
    dispatch(fetchClientsRequest({ limit: 200 }));
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      dispatch(createMeetingRequest({
        title: values.title,
        clientId: values.clientId,
        meetingType: values.meetingType || "other",
        summary: values.summary,
        meetingDate: values.meetingDate?.toISOString(),
      }));
      setDrawerOpen(false);
      form.resetFields();
    } catch {}
  };

  const handleDelete = (meeting: Meeting) => {
    Modal.confirm({
      title: "Delete meeting",
      content: `Delete "${meeting.title}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => dispatch(deleteMeetingRequest(meeting.id)),
    });
  };

  return (
    <div>
      <PageHeader title="Meetings Hub" subtitle="Centralize all client discussions, decisions, and action items." />

      {stats && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Total Meetings" value={stats.totalMeetings} prefix={<MessageSquare className="w-4 h-4 text-zinc-400 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="This Month" value={stats.thisMonth} prefix={<Calendar className="w-4 h-4 text-blue-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Pending Actions" value={stats.pendingActionItems} prefix={<CheckSquare className="w-4 h-4 text-orange-500 mr-1" />} valueStyle={{ fontSize: 24, color: "#ea580c" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" size="small">
              <Statistic title="Types" value={Object.keys(stats.byType).length} prefix={<Tag className="w-4 h-4 text-purple-500 mr-1" />} valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
        </Row>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Input.Search placeholder="Search meetings..." allowClear onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select placeholder="Type" allowClear style={{ width: 140 }} onChange={(val) => setTypeFilter(val)}
          options={[
            { value: "discovery", label: "Discovery" }, { value: "weekly_sync", label: "Weekly Sync" },
            { value: "demo", label: "Demo" }, { value: "planning", label: "Planning" },
            { value: "review", label: "Review" }, { value: "internal", label: "Internal" },
          ]} />
        <Select placeholder="Client" allowClear showSearch style={{ width: 180 }} onChange={(val) => setClientFilter(val)}
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
        <div className="flex-1" />
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>New Meeting</Button>
      </div>

      {meta.isLoading && meetings.length === 0 ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /></div>
      ) : meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <MessageSquare className="w-16 h-16 mb-4 text-zinc-300" />
          <Typography.Text className="text-lg font-medium text-zinc-500">No meetings yet</Typography.Text>
          <Typography.Text className="text-sm text-zinc-400 mb-4">Create your first meeting to start tracking discussions.</Typography.Text>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>New Meeting</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <Link key={meeting.id} href={`${APP_ROUTES.meetings}/${meeting.id}`} className="block group">
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm hover:!shadow-md hover:!border-zinc-300 transition-all !cursor-pointer" size="small">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                    <MessageSquare className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography.Text className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{meeting.title}</Typography.Text>
                      <Tag color={typeColors[meeting.meetingType] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0">
                        {typeLabels[meeting.meetingType] || meeting.meetingType}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      {meeting.clientName && <span>{meeting.clientName}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(meeting.meetingDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{meeting.actionItemCount} actions</span>
                    </div>
                  </div>
                  {meeting.summary && (
                    <Typography.Text className="text-xs text-zinc-400 max-w-[200px] truncate hidden lg:block">{meeting.summary}</Typography.Text>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Drawer title="New Meeting" width={560} open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        footer={<Space className="w-full justify-end"><Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Cancel</Button><Button type="primary" onClick={handleCreate}>Create Meeting</Button></Space>}
        destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Meeting Title" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Q1 Strategy Review" />
          </Form.Item>
          <Form.Item name="clientId" label="Client">
            <Select showSearch allowClear placeholder="Select client"
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={clients.map((c) => ({ value: c.id, label: c.companyName }))} />
          </Form.Item>
          <Form.Item name="meetingType" label="Meeting Type" initialValue="other">
            <Select options={[
              { value: "discovery", label: "Discovery" }, { value: "weekly_sync", label: "Weekly Sync" },
              { value: "demo", label: "Demo" }, { value: "planning", label: "Planning" },
              { value: "review", label: "Review" }, { value: "internal", label: "Internal" },
              { value: "other", label: "Other" },
            ]} />
          </Form.Item>
          <Form.Item name="meetingDate" label="Meeting Date">
            <DatePicker className="w-full" showTime />
          </Form.Item>
          <Form.Item name="summary" label="Summary">
            <Input.TextArea rows={3} placeholder="Brief overview of the meeting..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
