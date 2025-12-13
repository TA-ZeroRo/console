export enum UserRole {
  ADMIN = 'ADMIN',
  ORG_MANAGER = 'ORG_MANAGER',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  PAUSED = 'PAUSED',
}

export enum MissionType {
  IMAGE = 'IMAGE',
  QUIZ = 'QUIZ',
  TEXT_REVIEW = 'TEXT_REVIEW',
  LOCATION = 'LOCATION',
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  points: number;
  order: number;
  successCriteria?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  region: string;
  status: CampaignStatus;
  missions: Mission[];
  participantCount: number;
}

export interface AnalyticsSummary {
  totalCampaigns: number;
  totalParticipants: number;
  totalMissionsCompleted: number;
  totalPointsDistributed: number;
}

export interface DailyStat {
  date: string;
  participants: number;
  completions: number;
}

// ==================== 파트너 신청 관련 ====================

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INVITED = 'invited',
}

export enum OrganizationType {
  GOVERNMENT = 'Government',
  NGO = 'NGO',
  CORPORATE = 'Corporate',
}

export interface PartnerApplication {
  id: string;
  organization_name: string;
  contact_name: string;
  email: string;
  phone: string;
  organization_type: string;
  business_registration_url?: string;
  status: ApplicationStatus;
  rejection_reason?: string;
  invited_at?: string;
  invited_user_id?: string;
  created_at: string;
  updated_at: string;
  processed_by?: string;
  processed_at?: string;
}

export interface ApplicationFormData {
  organization_name: string;
  contact_name: string;
  email: string;
  phone: string;
  organization_type: string;
  business_registration?: File;
}

// Partner: 초대 완료된 파트너(지자체/환경단체) 정보
export interface Partner {
  id: string;
  user_id?: string;  // 초대 후 생성된 auth.users ID
  organization_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  organization_type?: string;
  business_registration_url?: string;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}
