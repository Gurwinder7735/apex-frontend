export interface Meeting {
  id: string;
  title: string;
  clientId?: string | null;
  clientName?: string | null;
  projectId?: string | null;
  meetingType: string;
  summary?: string | null;
  notes?: string | null;
  meetingDate: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  decisionCount: number;
  actionItemCount: number;
}

export interface MeetingDecision {
  id: string;
  meetingId: string;
  decision: string;
  createdBy?: string | null;
  createdAt: string;
}

export interface MeetingActionItem {
  id: string;
  meetingId: string;
  title: string;
  owner?: string | null;
  dueDate?: string | null;
  status: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingActivity {
  id: string;
  meetingId: string;
  action: string;
  description: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface MeetingDetail {
  meeting: Meeting;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  activities: MeetingActivity[];
}

export interface MeetingStats {
  totalMeetings: number;
  thisMonth: number;
  pendingActionItems: number;
  byType: Record<string, number>;
}
