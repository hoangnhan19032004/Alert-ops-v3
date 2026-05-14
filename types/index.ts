// ============================================================
//  types/index.ts — AlertOps central type definitions
// ============================================================

// ─── Generic API Response ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// ─── Alert ───────────────────────────────────────────────────
export type AlertStatus   = 'Open' | 'Acknowledged' | 'Escalated' | 'Resolved'
export type AlertSeverity = 'Critical' | 'Error' | 'Warning' | 'Info'
export type AlertEnv      = 'Production' | 'Staging' | 'Development'

export interface Alert {
  id?: string
  _id?: string
  projectId?: string
  message: string
  status: AlertStatus
  severity: AlertSeverity
  service: string
  env: AlertEnv
  time?: string
  createdAt?: string
}

export interface AlertStats {
  total: number
  open: number
  acknowledged: number
  escalated: number
  resolved: number
  critical: number
  resolvedToday: number
}

// ─── Project ─────────────────────────────────────────────────
export type ProjectSeverity = 'Critical' | 'Error' | 'Warning' | 'Resolved'

export interface ProjectMember {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Manager' | 'Member'
  avatar?: string
}

export interface Project {
  id?: string
  _id?: string
  name: string
  sev: ProjectSeverity
  desc: string
  avatars?: string[]
  owner: ProjectMember | null
  managers: ProjectMember[]
  members: ProjectMember[]
  alertCount: number
  createdAt?: string
}

// ─── Escalation Rule ─────────────────────────────────────────
export type EscalationChannel = 'email' | 'slack' | 'teams' | 'webhook'

export interface EscalationRule {
  id?: string
  _id?: string
  project: string
  trigger: string
  delay: string
  channel: EscalationChannel
  active: boolean
}

// ─── Notification History ────────────────────────────────────
export interface NotificationHistoryItem {
  id: string
  alertId: string
  projectId: string
  recipients: string[]
  subject?: string
  body?: string
  channel: EscalationChannel
  type: 'auto' | 'manual'
  status: 'pending' | 'sent' | 'failed'
  errorMessage?: string
  createdAt: string
  sentAt?: string
}

export interface SendNotificationPayload {
  alertId: string
  projectId: string
  recipients: string[]
  subject: string
  body: string
  type?: 'auto' | 'manual'
  channel?: EscalationChannel
}

// ─── Export ──────────────────────────────────────────────────
export interface ExportOptions {
  format: 'csv' | 'json'
  filename?: string
}
