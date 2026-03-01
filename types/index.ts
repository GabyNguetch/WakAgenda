// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  supervisor_name: string;
  internship_start_date: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  supervisor_name: string;
  internship_start_date: string;
  profile_picture_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  first_name?: string | null;
  last_name?: string | null;
  department?: string | null;
  supervisor_name?: string | null;
  internship_start_date?: string | null;
  profile_picture_url?: string | null;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type EventCategory = 'Réunion' | 'Développement' | 'Formation' | 'Rendu' | 'Autre';
export type EventDomain = 'Technique' | 'Administratif' | 'Commercial' | 'Transversal';
export type TaskStatus = 'À faire' | 'En cours' | 'Terminé' | 'Annulé' | 'En retard' | 'Manquée';
export type ReminderDelay = '15 min avant' | '30 min avant' | '1 heure avant' | 'La veille';

export interface TaskCreate {
  title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  category?: EventCategory;
  domain?: string; // UUID from DomainResponse
  status?: TaskStatus;
  reminder?: ReminderDelay | null;
  notification_enabled?: boolean;
  description?: string | null;
}

export interface TaskUpdate {
  title?: string | null;
  task_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  category?: EventCategory | null;
  domain?: string | null; // UUID from DomainResponse
  status?: TaskStatus | null;
  reminder?: ReminderDelay | null;
  notification_enabled?: boolean | null;
  description?: string | null;
}

export interface TaskResponse {
  id: string;
  user_id: string;
  title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  category: EventCategory;
  domain: string; // UUID or legacy EventDomain string
  status: TaskStatus;
  reminder: ReminderDelay | null;
  notification_enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  today: number;
  overdue: number;
  completed: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  by_domain: Record<string, number>;
}

export interface TaskFilters {
  category?: EventCategory;
  domain?: string;
  status?: TaskStatus;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'reminder' | 'system';

export interface NotificationResponse {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  scheduled_at: string;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

export interface Tab {
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'redaction';
  isCommented: boolean;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface TaskCommentResponse {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ─── Domains ─────────────────────────────────────────────────────────────────

export interface DomainResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface DomainCreate {
  name: string;
  description?: string;
}