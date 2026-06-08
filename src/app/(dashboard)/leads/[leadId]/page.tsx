"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tag, Card, Tabs, Descriptions, Space, Typography, Empty, Spin, Modal, Form, Input as AntInput, Select, Drawer, List, App, Dropdown, Timeline, Input } from "antd";
import { ArrowLeft, Target, Edit3, Trash2, Plus, Phone, Mail, ExternalLink, Calendar, Clock, MoreHorizontal, MessageSquare, Flag, Save, User } from "lucide-react";
import { COUNTRY_OPTIONS, getFilteredTimezones } from "@/lib/constants/clientOptions";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchLeadDetailRequest, clearLeadDetail, updateLeadRequest, deleteLeadRequest,
  updateLeadStatusRequest, addActivityRequest, createMeetingRequest, updateMeetingRequest,
  deleteMeetingRequest, addActionItemRequest, updateActionItemRequest,
} from "@/store/modules/leads/leadsSlice";
import { selectLeadDetail, selectLeadActivities, selectLeadMeetings } from "@/store/modules/leads/leadsSelectors";
import { fetchUsersRequest } from "@/store/modules/user/userSlice";
import { selectUsers } from "@/store/modules/user/userSelectors";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const statusColors: Record<string, string> = {
  new: "default",
  contacted: "blue",
  meeting_scheduled: "orange",
  proposal_sent: "purple",
  won: "green",
  lost: "red",
};

const sourceOptions = [
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "upwork", label: "Upwork" },
  { value: "website", label: "Website" },
  { value: "existing_client", label: "Existing Client" },
  { value: "partner", label: "Partner" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const activityTypeIcons: Record<string, React.ReactNode> = {
  note: <MessageSquare className="w-4 h-4" />,
  status_change: <Flag className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
};

export default function LeadDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAdmin, user } = useAuth();
  const detail = useAppSelector(selectLeadDetail);
  const activities = useAppSelector(selectLeadActivities);
  const meetings = useAppSelector(selectLeadMeetings);
  const allUsers = useAppSelector(selectUsers);

  const leadId = params.leadId as string;
  const lead = detail?.lead ?? null;

  const usersMap = useMemo(() => {
    const map: Record<string, string> = {};
    allUsers.forEach((u) => { map[u.id] = u.name || u.email; });
    return map;
  }, [allUsers]);

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editCountry, setEditCountry] = useState<string>();

  const [activityForm] = Form.useForm();
  const [showActivityForm, setShowActivityForm] = useState(false);

  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [meetingForm] = Form.useForm();

  const [salesPrepNotes, setSalesPrepNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [actionItemForm] = Form.useForm();
  const [actionItemMeetingId, setActionItemMeetingId] = useState<string | null>(null);

  useEffect(() => {
    if (leadId) {
      dispatch(fetchLeadDetailRequest(leadId));
    }
    return () => { dispatch(clearLeadDetail()); };
  }, [leadId, dispatch]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsersRequest({ pageSize: 100 }));
    }
  }, [isAdmin, dispatch]);

  useEffect(() => {
    if (lead?.salesPrepNotes !== undefined) {
      setSalesPrepNotes(lead.salesPrepNotes ?? "");
    }
  }, [lead?.salesPrepNotes]);

  const handleSaveNotes = useCallback(() => {
    setIsSavingNotes(true);
    dispatch(updateLeadRequest({ id: leadId, data: { salesPrepNotes } }));
    setTimeout(() => setIsSavingNotes(false), 500);
  }, [leadId, salesPrepNotes, dispatch]);

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      dispatch(updateLeadRequest({ id: leadId, data: values }));
      setEditDrawerOpen(false);
    } catch {
      // validation failed
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete lead",
      content: `Are you sure you want to delete ${lead?.companyName}? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(deleteLeadRequest(leadId));
        router.push(APP_ROUTES.leads);
      },
    });
  };

  const handleStatusChange = (status: string) => {
    Modal.confirm({
      title: "Update status",
      content: `Change status to "${statusOptions.find((s) => s.value === status)?.label}"?`,
      okText: "Update",
      onOk: () => dispatch(updateLeadStatusRequest({ id: leadId, status })),
    });
  };

  const handleAddActivity = async () => {
    try {
      const values = await activityForm.validateFields();
      dispatch(addActivityRequest({ leadId, ...values }));
      setShowActivityForm(false);
      activityForm.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const values = await meetingForm.validateFields();
      dispatch(createMeetingRequest({ leadId, ...values }));
      setMeetingDrawerOpen(false);
      meetingForm.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleAddActionItem = async () => {
    if (!actionItemMeetingId) return;
    try {
      const values = await actionItemForm.validateFields();
      dispatch(addActionItemRequest({ leadId, meetingId: actionItemMeetingId, ...values }));
      setActionItemMeetingId(null);
      actionItemForm.resetFields();
    } catch {
      // validation failed
    }
  };

  const handleToggleActionItem = (meetingId: string, itemIndex: number, currentStatus: string) => {
    dispatch(updateActionItemRequest({
      leadId, meetingId, itemIndex,
      data: { status: currentStatus === "completed" ? "pending" : "completed" },
    }));
  };

  if (!lead) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.leads)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">
          Back to Leads
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <Target className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{lead.companyName}</Typography.Title>
                <Tag color={statusColors[lead.status] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">
                  {lead.status.replace("_", " ")}
                </Tag>
              </div>
              <Typography.Text className="text-zinc-500 text-sm">{lead.contactPerson}</Typography.Text>
            </div>
          </div>
          <Space>
            <Select
              value={lead.status}
              style={{ width: 160 }}
              onChange={handleStatusChange}
              options={statusOptions}
              className="[&_.ant-select-selector]:!rounded-lg"
            />
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => { editForm.setFieldsValue(lead); setEditCountry(lead.country ?? undefined); setEditDrawerOpen(true); }}>
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
                <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Contact Information">
                  <Descriptions column={{ xs: 1, sm: 2 }} colon={false} className="[&_.ant-descriptions-item-content]:text-zinc-900">
                    <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Contact Person</span>}>
                      {lead.contactPerson}
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Status</span>}>
                      <Tag color={statusColors[lead.status] || "default"} className="!rounded-full">{lead.status.replace("_", " ")}</Tag>
                    </Descriptions.Item>
                    {lead.email && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Email</span>}>
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </a>
                      </Descriptions.Item>
                    )}
                    {lead.phone && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Phone</span>}>
                        <a href={`tel:${lead.phone}`} className="text-zinc-900 hover:text-zinc-600 inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </a>
                      </Descriptions.Item>
                    )}
                    {lead.linkedinProfile && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">LinkedIn</span>}>
                        <a href={lead.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> View Profile
                        </a>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Source</span>}>
                      {sourceOptions.find((o) => o.value === lead.source)?.label || lead.source}
                    </Descriptions.Item>
                    {lead.country && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Country</span>}>
                        {lead.country}
                      </Descriptions.Item>
                    )}
                    {lead.timezone && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Timezone</span>}>
                        {lead.timezone}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Created</span>}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </Descriptions.Item>
                    {lead.assignedTo && (
                      <Descriptions.Item label={<span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Assigned To</span>}>
                        <span className="inline-flex items-center gap-1 text-zinc-900">
                          <User className="w-3 h-3 text-zinc-400" />
                          {usersMap[lead.assignedTo] || "Unknown"}
                        </span>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                {lead.clientId && (
                  <Card className="!rounded-xl !border-zinc-200 !shadow-sm !bg-green-50/50" size="small">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Target className="w-4 h-4" />
                      <span>Converted to client</span>
                      <Button type="link" size="small" className="!p-0 !h-auto" onClick={() => router.push(`${APP_ROUTES.clients}/${lead.clientId}`)}>
                        View Client Profile &rarr;
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: "timeline",
            label: `Timeline (${activities.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Activity Timeline</span>
                  <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setShowActivityForm(true)}>
                    Add Note
                  </Button>
                </div>
              }>
                {showActivityForm && (
                  <div className="mb-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <Form form={activityForm} layout="vertical">
                      <Form.Item name="type" label="Type" initialValue="note" className="!mb-3">
                        <Select
                          options={[
                            { value: "note", label: "Note" },
                            { value: "meeting", label: "Meeting Note" },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item name="content" label="Note" rules={[{ required: true, message: "Required" }]} className="!mb-3">
                        <AntInput.TextArea rows={3} placeholder="What happened?" />
                      </Form.Item>
                      <Space>
                        <Button type="primary" onClick={handleAddActivity}>Add</Button>
                        <Button onClick={() => { setShowActivityForm(false); activityForm.resetFields(); }}>Cancel</Button>
                      </Space>
                    </Form>
                  </div>
                )}

                {activities.length === 0 ? (
                  <Empty description="No activities yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowActivityForm(true)}>
                      Add Activity
                    </Button>
                  </Empty>
                ) : (
                  <Timeline
                    items={activities.map((a) => ({
                      dot: activityTypeIcons[a.type] || <MessageSquare className="w-4 h-4" />,
                      children: (
                        <div className="mb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-sm font-medium text-zinc-900 capitalize">{a.type.replace("_", " ")}</span>
                              {a.createdByName && (
                                <span className="text-xs text-zinc-400 ml-2">by {a.createdByName}</span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400 shrink-0 ml-4">{new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-zinc-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                        </div>
                      ),
                    }))}
                    className="!px-2"
                  />
                )}
              </Card>
            ),
          },
          {
            key: "sales-prep",
            label: "Sales Prep",
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Sales Preparation Notes</span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveNotes}
                    loading={isSavingNotes}
                  >
                    Save
                  </Button>
                </div>
              }>
                <RichTextEditor
                  content={salesPrepNotes}
                  onChange={setSalesPrepNotes}
                  placeholder="Prepare your sales notes here — talking points, key info, objection handling, etc..."
                />
              </Card>
            ),
          },
          {
            key: "meetings",
            label: `Meetings (${meetings.length})`,
            children: (
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full">
                  <span>Meetings</span>
                  <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setMeetingDrawerOpen(true)}>
                    Schedule Meeting
                  </Button>
                </div>
              }>
                {meetings.length === 0 ? (
                  <Empty description="No meetings scheduled" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setMeetingDrawerOpen(true)}>
                      Schedule Meeting
                    </Button>
                  </Empty>
                ) : (
                  <List
                    dataSource={meetings}
                    renderItem={(meeting) => (
                      <List.Item className="!border-zinc-100 !py-4 !block">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <Typography.Text strong className="!text-zinc-900">{meeting.title}</Typography.Text>
                              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(meeting.scheduledAt).toLocaleDateString()}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {meeting.durationMinutes && (
                                  <span>{meeting.durationMinutes} min</span>
                                )}
                                <Tag color={meeting.status === "completed" ? "green" : meeting.status === "cancelled" ? "red" : "blue"} className="!rounded-full !text-[10px] !px-2">
                                  {meeting.status}
                                </Tag>
                              </div>
                            </div>
                          </div>
                          <Dropdown menu={{
                            items: [
                              { key: "toggle", label: expandedMeeting === meeting.id ? "Collapse" : "Expand", onClick: () => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id) },
                              { type: "divider" },
                              { key: "delete", icon: <Trash2 className="w-4 h-4" />, label: "Delete", danger: true, onClick: () => {
                                Modal.confirm({
                                  title: "Delete meeting",
                                  content: "Are you sure?",
                                  okText: "Delete",
                                  okButtonProps: { danger: true },
                                  onOk: () => dispatch(deleteMeetingRequest({ leadId, meetingId: meeting.id })),
                                });
                              }},
                            ],
                          }}>
                            <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                          </Dropdown>
                        </div>

                        {expandedMeeting === meeting.id && (
                          <div className="ml-13 pl-2 mt-3 border-t border-zinc-100 pt-3">
                            {meeting.meetingNotes && (
                              <div className="mb-4">
                                <Typography.Text className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Notes</Typography.Text>
                                <p className="text-sm text-zinc-700 mt-1 whitespace-pre-wrap">{meeting.meetingNotes}</p>
                              </div>
                            )}

                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <Typography.Text className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Action Items ({meeting.actionItems.length})</Typography.Text>
                                <Button type="link" size="small" icon={<Plus className="w-3 h-3" />} onClick={() => { setActionItemMeetingId(meeting.id); }} className="!text-xs">
                                  Add Item
                                </Button>
                              </div>

                              {actionItemMeetingId === meeting.id && (
                                <div className="mb-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                                  <Form form={actionItemForm} layout="vertical" size="small">
                                    <Form.Item name="description" label="Description" rules={[{ required: true, message: "Required" }]} className="!mb-2">
                                      <AntInput placeholder="What needs to be done?" />
                                    </Form.Item>
                                    <Form.Item name="assignedTo" label="Assigned To" className="!mb-2">
                                      <AntInput placeholder="Person responsible" />
                                    </Form.Item>
                                    <Space>
                                      <Button type="primary" size="small" onClick={handleAddActionItem}>Add</Button>
                                      <Button size="small" onClick={() => { setActionItemMeetingId(null); actionItemForm.resetFields(); }}>Cancel</Button>
                                    </Space>
                                  </Form>
                                </div>
                              )}

                              {meeting.actionItems.length === 0 ? (
                                <Typography.Text className="text-xs text-zinc-400 italic">No action items</Typography.Text>
                              ) : (
                                <div className="space-y-1">
                                  {meeting.actionItems.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2 py-1">
                                      <input
                                        type="checkbox"
                                        checked={item.status === "completed"}
                                        onChange={() => handleToggleActionItem(meeting.id, idx, item.status)}
                                        className="mt-1 w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <span className={`text-sm ${item.status === "completed" ? "line-through text-zinc-400" : "text-zinc-900"}`}>
                                          {item.description}
                                        </span>
                                        {item.assignedTo && (
                                          <span className="text-xs text-zinc-400 ml-2">&mdash; {item.assignedTo}</span>
                                        )}
                                        {item.dueDate && (
                                          <span className="text-xs text-zinc-400 ml-2">due {new Date(item.dueDate).toLocaleDateString()}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
        title="Edit Lead"
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
          <Form.Item name="contactPerson" label="Contact Person" rules={[{ required: true, message: "Required" }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="email" label="Email"><AntInput /></Form.Item>
          <Form.Item name="phone" label="Phone"><AntInput /></Form.Item>
          <Form.Item name="linkedinProfile" label="LinkedIn Profile"><AntInput /></Form.Item>
          <Form.Item name="source" label="Source">
            <Select showSearch placeholder="Select source" options={sourceOptions} allowClear />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Select showSearch placeholder="Select country" options={COUNTRY_OPTIONS} allowClear onChange={(val) => { setEditCountry(val); editForm.setFieldValue("timezone", undefined); }} />
          </Form.Item>
          <Form.Item name="timezone" label="Timezone">
            <Select showSearch placeholder={editCountry ? "Select timezone for " + editCountry : "Select a country first"} options={getFilteredTimezones(editCountry)} allowClear disabled={!editCountry} />
          </Form.Item>
          {isAdmin && (
            <Form.Item name="assignedTo" label="Assigned To">
              <Select
                showSearch
                placeholder="Assign to user"
                allowClear
                optionFilterProp="label"
                options={allUsers.map((u) => ({ value: u.id, label: u.name || u.email }))}
              />
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Drawer
        title="Schedule Meeting"
        width={560}
        open={meetingDrawerOpen}
        onClose={() => { setMeetingDrawerOpen(false); meetingForm.resetFields(); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => { setMeetingDrawerOpen(false); meetingForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={handleCreateMeeting}>Schedule</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={meetingForm} layout="vertical">
          <Form.Item name="title" label="Meeting Title" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="e.g. Discovery Call" />
          </Form.Item>
          <Form.Item name="scheduledAt" label="Date & Time" rules={[{ required: true, message: "Required" }]}>
            <AntInput type="datetime-local" />
          </Form.Item>
          <Form.Item name="durationMinutes" label="Duration (minutes)">
            <AntInput type="number" placeholder="e.g. 60" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
