export type UserRole = 'judge' | 'admin' | 'viewer';

export type Emirate =
  | 'Abu Dhabi'
  | 'Dubai'
  | 'Sharjah'
  | 'Ajman'
  | 'Umm Al Quwain'
  | 'Ras Al Khaimah'
  | 'Fujairah';

export interface RubricBand {
  label: string;
  min: number;
  max: number;
  desc: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  max: number;
  bands: RubricBand[];
}

export interface Rubric {
  id: string;
  version: number;
  name: string;
  maxTotal: number;
  criteria: RubricCriterion[];
}

export interface School {
  SchoolID: string;
  Name: string;
  Code?: string;
  Type?: string;
  RepName?: string;
  RepContact?: string;
  RepEmail?: string;
  Address?: string;
  Status: 'Active' | 'Inactive';
  Notes?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Emirate: Emirate | string;
}

export interface Category {
  CategoryID: string;
  Name: string;
  Code?: string;
  Description?: string;
  JudgesRequired: number;
  RankingScope?: 'category' | 'overall' | 'both';
  Prize?: string;
  TieBreak?: string;
  Status: 'Active' | 'Inactive';
}

export interface Table {
  TableID: string;
  TableName: string;
  Location?: string;
  Floor?: string;
  Status: 'Active' | 'Inactive';
  Notes?: string;
  UpdatedAt?: string;
}

export interface Participant {
  ParticipantID: string;
  RegNo?: string;
  SchoolID?: string;
  SchoolName: string;
  Title: string;
  Description?: string;
  Category: string;
  Subcategory?: string;
  EntryType: 'Project' | 'Poster' | 'Business' | 'Research';
  LeadName?: string;
  TeamMembers?: string;
  StudentId?: string;
  Grade?: string;
  Contact?: string;
  Email?: string;
  Supervisor?: string;
  SupervisorContact?: string;
  TableID?: string;
  TableName?: string;
  RegStatus: 'Registered' | 'Pending' | 'Approved';
  ProjectStatus: 'Active' | 'Withdrawn';
  Notes?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Emirate?: Emirate | string;
}

export interface TableAssignment {
  AssignmentID: string;
  TableID: string;
  TableName: string;
  ParticipantID: string;
  SchoolName: string;
  Category: string;
  Active: boolean;
  PrevTableID?: string;
  User: string;
  Timestamp: string;
  Reason?: string;
}

export interface Judge {
  JudgeID: string;
  Name: string;
  Title?: string;
  Institution?: string;
  Email: string;
  Contact?: string;
  Categories?: string;
  Status: 'Active' | 'Inactive';
  Role?: string;
  Notes?: string;
  AccessCode: string;
  CodeIssuedAt?: string;
  LastLoginAt?: string;
}

export interface Evaluation {
  EvaluationID: string;
  ParticipantID: string;
  SchoolID?: string;
  CategoryID?: string;
  TableID?: string;
  JudgeID: string;
  JudgeName: string;
  RubricID: string;
  RubricVersion: number;
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  TimePenalty: number;
  Total: number;
  MaxTotal: number;
  Percentage: number;
  Comments?: string;
  Status: 'Submitted' | 'Corrected';
  CreatedAt: string;
  SubmittedAt: string;
  UpdatedAt?: string;
  CorrectionReason?: string;
}

export interface SystemSettings {
  ExhibitionName: string;
  JudgeAppUrl?: string;
  ScoringAggregation: 'average' | 'sum' | 'median';
  OverallRankMethod: 'percentage' | 'raw';
  SchoolRankingMethod: 'avgEligible' | 'totalPoints';
  RankingsPublished: boolean;
  ResultsFinal: boolean;
  AllowJudgeCorrect: boolean;
  AllowJudgeReassign: boolean;
  AdminPasswordHash?: string;
  DashboardPasswordHash?: string;
}

export interface ProjectResult {
  participantId: string;
  title: string;
  schoolId?: string;
  schoolName: string;
  emirate: string;
  category: string;
  tableName?: string;
  leadName?: string;
  entryType?: string;
  judgeCount: number;
  required: number;
  finalScore: number;
  maxScore: number;
  percentage: number;
  eligible: boolean;
  evaluations: Evaluation[];
  rank?: number;
  overallRank?: number;
}

export interface CategoryRanking {
  category: string;
  projects: ProjectResult[];
}

export interface SchoolRanking {
  rank: number;
  school: string;
  projects: number;
  eligible: number;
  totalPoints: number;
  metric: number;
}

export interface EmirateRanking {
  rank: number;
  emirate: string;
  avgPct: number;
  placements: number;
  eligible: number;
  schoolCount: number;
  topProjects: ProjectResult[];
  topSchools: { rank: number; school: string; metric: number; projects: number }[];
}

export interface RankingsData {
  published: boolean;
  final: boolean;
  method: {
    overall: string;
    school: string;
    aggregation: string;
    emirate: string;
  };
  overallTop10: ProjectResult[];
  categoryRankings: CategoryRanking[];
  schoolRankings: SchoolRanking[];
  emirateRankings: EmirateRanking[];
  generatedAt: string;
}

export interface AuditLogItem {
  id: string;
  Timestamp: string;
  User: string;
  Action: string;
  Entity: string;
  RefID: string;
  Details: string;
}

export interface RegistrationRequest {
  RequestID: string;
  Source: string;
  SchoolName: string;
  Title: string;
  Category: string;
  Names: string;
  TableName: string;
  Status: 'Pending' | 'Approved' | 'Rejected';
  CreatedAt: string;
  ReviewNote?: string;
}

export interface EmailLogEntry {
  id: string;
  Timestamp: string;
  RecipientEmail: string;
  RecipientName: string;
  RecipientRole: string;
  CampaignType: string;
  Subject: string;
  Status: 'Sent' | 'Failed' | 'Queued';
  Details?: string;
  TriggeredBy?: string;
}

export interface EmailDispatchConfig {
  webAppUrl: string;
  autoLogToSheet: boolean;
  senderName: string;
}

