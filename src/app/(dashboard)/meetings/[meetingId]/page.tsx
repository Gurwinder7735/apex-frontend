"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tag, Card, Tabs, Space, Typography, Empty, Spin, Modal, Form, Input as AntInput, DatePicker, App, List, Select, Drawer } from "antd";
import { ArrowLeft, MessageSquare, Calendar, Clock, CheckSquare, Target, Trash2, Edit3, Plus, User, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchMeetingDetailRequest, clearMeetingDetail, updateMeetingRequest, deleteMeetingRequest,
  addDecisionRequest, removeDecisionRequest, createActionItemRequest, updateActionItemRequest, deleteActionItemRequest,
} from "@/store/modules/meetings/meetingsSlice";
import {
  selectMeetingDetail, selectMeetingDecisions, selectMeetingActionItems, selectMeetingActivities,
} from "@/store/modules/meetings/meetingsSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";

const typeColors: Record<string, string> = {
  discovery: "blue", weekly_sync: "green", demo: "purple", planning: "orange", review: "cyan", internal: "geekblue", other: "default",
};
const typeLabels: Record<string, string> = {
  discovery: "Discovery", weekly_sync: "Weekly Sync", demo: "Demo", planning: "Planning", review: "Review", internal: "Internal", other: "Other",
};

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectMeetingDetail);
  const decisions = useAppSelector(selectMeetingDecisions);
  const actionItems = useAppSelector(selectMeetingActionItems);
  const activities = useAppSelector(selectMeetingActivities);

  const meetingId = params.meetingId as string;
  const meeting = detail?.meeting ?? null;

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [decisionForm] = Form.useForm();
  const [actionForm] = Form.useForm();
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  useEffect(() => {
    if (meetingId) dispatch(fetchMeetingDetailRequest(meetingId));
    return () => { dispatch(clearMeetingDetail()); };
  }, [meetingId, dispatch]);

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      dispatch(updateMeetingRequest({ id: meetingId, data: { ...values, meetingDate: values.meetingDate?.toISOString() } }));
      setEditDrawerOpen(false);
    } catch {}
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete meeting", content: `Delete "${meeting?.title}"?`,
      okText: "Delete", okButtonProps: { danger: true },
      onOk: () => { dispatch(deleteMeetingRequest(meetingId)); router.push(APP_ROUTES.meetings); },
    });
  };

  const handleAddDecision = async () => {
    try {
      const { decision } = await decisionForm.validateFields();
      dispatch(addDecisionRequest({ meetingId, decision }));
      setDecisionModalOpen(false);
      decisionForm.resetFields();
    } catch {}
  };

  const handleCreateAction = async () => {
    try {
      const values = await actionForm.validateFields();
      dispatch(createActionItemRequest({ meetingId, ...values, dueDate: values.dueDate?.toISOString() }));
      setActionModalOpen(false);
      actionForm.resetFields();
    } catch {}
  };

  const toggleActionStatus = (item: { id: string; status: string }) => {
    const newStatus = item.status === "completed" ? "pending" : "completed";
    dispatch(updateActionItemRequest({ meetingId, itemId: item.id, data: { status: newStatus } }));
  };

  if (!meeting) {
    return <div className="flex justify-center items-center py-32"><Spin size="large" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.meetings)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">Back to Meetings</Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <MessageSquare className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Typography.Title level={3} className="!mb-0 !text-2xl">{meeting.title}</Typography.Title>
                <Tag color={typeColors[meeting.meetingType] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs">{typeLabels[meeting.meetingType] || meeting.meetingType}</Tag>
              </div>
              <Typography.Text className="text-zinc-500 text-sm">
                {meeting.clientName && <>{meeting.clientName} &middot; </>}
                {new Date(meeting.meetingDate).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
              </Typography.Text>
            </div>
          </div>
          <Space>
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => { editForm.setFieldsValue({ ...meeting, meetingDate: meeting.meetingDate ? new Date(meeting.meetingDate) : undefined }); setEditDrawerOpen(true); }}>Edit</Button>
            <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
          </Space>
        </div>
      </div>

      <Tabs defaultActiveKey="notes" items={[
        {
          key: "notes", label: "Notes",
          children: (
            <div className="space-y-6">
              {meeting.summary && (
                <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title="Summary" size="small">
                  <Typography.Paragraph className="!text-zinc-700 !whitespace-pre-wrap">{meeting.summary}</Typography.Paragraph>
                </Card>
              )}
              <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
                <div className="flex items-center justify-between w-full"><span>Meeting Notes</span></div>
              }>
                {meeting.notes ? (
                  <Typography.Paragraph className="!text-zinc-700 !whitespace-pre-wrap">{meeting.notes}</Typography.Paragraph>
                ) : (
                  <Empty description="No notes yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" icon={<Edit3 className="w-4 h-4" />} onClick={() => { editForm.setFieldsValue(meeting); setEditDrawerOpen(true); }}>Add Notes</Button>
                  </Empty>
                )}
              </Card>
            </div>
          ),
        },
        {
          key: "decisions", label: `Decisions (${decisions.length})`,
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
              <div className="flex items-center justify-between w-full">
                <span>Decisions</span>
                <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setDecisionModalOpen(true)}>Add Decision</Button>
              </div>
            }>
              {decisions.length === 0 ? (
                <Empty description="No decisions recorded" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setDecisionModalOpen(true)}>Add Decision</Button>
                </Empty>
              ) : (
                <List dataSource={decisions} renderItem={(decision) => (
                  <List.Item className="!border-zinc-100 !py-3" actions={[
                    <Button key="del" type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => Modal.confirm({ title: "Remove decision", content: "Remove this decision?", okText: "Remove", okButtonProps: { danger: true }, onOk: () => dispatch(removeDecisionRequest({ meetingId, decisionId: decision.id })) })} />,
                  ]}>
                    <div className="flex items-start gap-3 w-full">
                      <Target className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                      <Typography.Text className="text-sm text-zinc-900">{decision.decision}</Typography.Text>
                    </div>
                  </List.Item>
                )} />
              )}
            </Card>
          ),
        },
        {
          key: "actions", label: `Actions (${actionItems.length})`,
          children: (
            <Card className="!rounded-xl !border-zinc-200 !shadow-sm" title={
              <div className="flex items-center justify-between w-full">
                <span>Action Items</span>
                <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={() => setActionModalOpen(true)}>Add Action</Button>
              </div>
            }>
              {actionItems.length === 0 ? (
                <Empty description="No action items yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setActionModalOpen(true)}>Add Action Item</Button>
                </Empty>
              ) : (
                <List dataSource={actionItems} renderItem={(item) => (
                  <List.Item className="!border-zinc-100 !py-3" actions={[
                    <Button key="del" type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => dispatch(deleteActionItemRequest({ meetingId, itemId: item.id }))} />,
                  ]}>
                    <div className="flex items-start gap-3 w-full">
                      <Button type="text" size="small" className="!p-0 !mt-0.5"
                        onClick={() => toggleActionStatus(item)}
                        icon={<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.status === "completed" ? "bg-green-500 border-green-500" : "border-zinc-300"}`}>
                          {item.status === "completed" && <span className="text-white text-[10px]">✓</span>}
                        </div>} />
                      <div className="flex-1 min-w-0">
                        <Typography.Text className={`text-sm ${item.status === "completed" ? "line-through text-zinc-400" : "text-zinc-900"}`}>{item.title}</Typography.Text>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          {item.owner && <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.owner}</span>}
                          {item.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.dueDate).toLocaleDateString()}</span>}
                          <Tag color={item.status === "completed" ? "green" : item.status === "in_progress" ? "blue" : "orange"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none">
                            {item.status.replace("_", " ")}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )} />
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

      <Modal title="Add Decision" open={decisionModalOpen} onCancel={() => { setDecisionModalOpen(false); decisionForm.resetFields(); }} onOk={handleAddDecision} okText="Add">
        <Form form={decisionForm} layout="vertical">
          <Form.Item name="decision" label="Decision" rules={[{ required: true, message: "Required" }]}>
            <AntInput.TextArea rows={3} placeholder="What was decided?" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Action Item" open={actionModalOpen} onCancel={() => { setActionModalOpen(false); actionForm.resetFields(); }} onOk={handleCreateAction} okText="Create">
        <Form form={actionForm} layout="vertical">
          <Form.Item name="title" label="Task" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="e.g. Send proposal draft" />
          </Form.Item>
          <Form.Item name="owner" label="Owner">
            <AntInput placeholder="Who is responsible?" />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="Edit Meeting" width={560} open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)}
        footer={<Space className="w-full justify-end"><Button onClick={() => setEditDrawerOpen(false)}>Cancel</Button><Button type="primary" onClick={handleUpdate}>Save Changes</Button></Space>}
        destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Meeting Title" rules={[{ required: true, message: "Required" }]}><AntInput /></Form.Item>
          <Form.Item name="meetingType" label="Meeting Type">
            <Select options={[
              { value: "discovery", label: "Discovery" }, { value: "weekly_sync", label: "Weekly Sync" },
              { value: "demo", label: "Demo" }, { value: "planning", label: "Planning" },
              { value: "review", label: "Review" }, { value: "internal", label: "Internal" },
            ]} />
          </Form.Item>
          <Form.Item name="meetingDate" label="Meeting Date"><DatePicker className="w-full" showTime /></Form.Item>
          <Form.Item name="summary" label="Summary"><AntInput.TextArea rows={3} /></Form.Item>
          <Form.Item name="notes" label="Notes"><AntInput.TextArea rows={6} placeholder="Meeting notes..." /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
