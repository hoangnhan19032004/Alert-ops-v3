export interface Alert {
  _id?: string;
  id?: string;
  message: string;
  status: string;
  severity: string;
  createdAt?: string;
}

export type ProjectSeverity =
  | 'Critical'
  | 'Error'
  | 'Warning'
  | 'Resolved'

export interface ProjectMember {
  id: string
  name: string
  email: string
  role:
    | 'Owner'
    | 'Manager'
    | 'Member'
  avatar?: string
}

export interface Project {
  id: string
  name: string
  sev: ProjectSeverity
  desc: string
  avatars: string[]
  owner: ProjectMember | null
  managers: ProjectMember[]
  members: ProjectMember[]
  alertCount: number
  createdAt?: string
}