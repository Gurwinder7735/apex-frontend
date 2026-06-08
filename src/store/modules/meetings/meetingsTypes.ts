import type { Meeting, MeetingDecision, MeetingActionItem, MeetingActivity, MeetingDetail, MeetingStats } from "@/types/models/Meeting";

export interface MeetingsState {
  items: Meeting[];
  total: number;
  isLoading: boolean;
  error: string | null;
  stats: MeetingStats | null;
  detail: MeetingDetail | null;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  activities: MeetingActivity[];
}

export interface MeetingsQuery {
  search?: string;
  clientId?: string;
  meetingType?: string;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}

export interface MeetingCreatePayload {
  title: string;
  clientId?: string;
  projectId?: string;
  meetingType?: string;
  summary?: string;
  notes?: string;
  meetingDate?: string;
}

export interface MeetingUpdatePayload {
  id: string;
  data: Partial<MeetingCreatePayload>;
}
