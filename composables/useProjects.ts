import { computed, onMounted, readonly } from 'vue'
import type { Project, ProjectMember, ProjectSeverity } from '~/types'

export const useProjects = () => {
  const { apiCall } = useApi()
  const { success, error: showError } = useToast()

  // ===== STATE =====
  const projects = useState<Project[]>('projects', () => [])
  const loading  = useState<boolean>('projects-loading', () => false)

  // ===== HELPERS =====
  const createMemberFromEmail = (email: string, role: ProjectMember['role']): ProjectMember => {
    const username = email.split('@')[0] || 'User'
    return { id: crypto.randomUUID(), name: username, email, role, avatar: username.charAt(0).toUpperCase() }
  }

  const normalizeMember = (member: any, role: ProjectMember['role']): ProjectMember => {
    if (typeof member === 'string') return createMemberFromEmail(member, role)
    const email = member?.email ?? ''
    const fallbackName = email ? email.split('@')[0] : 'Unknown User'
    return {
      id:     member?.id ?? member?._id ?? crypto.randomUUID(),
      name:   member?.name ?? fallbackName,
      email,
      role,
      avatar: member?.avatar ?? fallbackName.charAt(0).toUpperCase()
    }
  }

  const mapProject = (item: any): Project => ({
    id:         item?.id ?? item?.Id ?? item?._id ?? '',
    name:       item?.name ?? item?.Name ?? '',
    sev:        item?.sev ?? item?.Sev ?? 'Warning',
    desc:       item?.desc ?? item?.Desc ?? '',
    avatars:    Array.isArray(item?.avatars) ? item.avatars : Array.isArray(item?.Avatars) ? item.Avatars : [],
    owner:      (item?.owner ?? item?.Owner) ? normalizeMember(item.owner ?? item.Owner, 'Owner') : null,
    managers:   Array.isArray(item?.managers) ? item.managers.map((m: any) => normalizeMember(m, 'Manager')) : [],
    members:    Array.isArray(item?.members) ? item.members.map((m: any) => normalizeMember(m, 'Member')) : [],
    alertCount: item?.alertCount ?? 0,
    createdAt:  item?.createdAt ?? new Date().toISOString()
  })

  // ===== LOAD =====
  const loadProjects = async () => {
    loading.value = true
    try {
      const res = await apiCall<any>('/api/projects')
      // apiCall luôn wrap thành { success, data }
      if (res?.success && Array.isArray(res.data)) {
        projects.value = res.data.map(mapProject)
        return
      }
      projects.value = []
      showError('No projects found')
    } catch (err) {
      console.error(err)
      projects.value = []
      showError('Error loading projects')
    } finally {
      loading.value = false
    }
  }

  // ===== CREATE =====
  const createProject = async (project: Omit<Project, 'id'>) => {
    try {
      const payload = {
        name: project.name, sev: project.sev, desc: project.desc,
        owner: project.owner, managers: project.managers,
        members: project.members, alertCount: project.alertCount
      }
      const res = await apiCall<any>('/api/projects', { method: 'POST', body: payload })
      const newProject = mapProject(res?.data ?? res)
      projects.value.push(newProject)
      success('Project created successfully')
      return newProject
    } catch (err) {
      console.error(err)
      showError('Error creating project')
      return null
    }
  }

  // ===== UPDATE =====
  const updateProject = async (id: string, project: Partial<Omit<Project, 'id'>>) => {
    try {
      await apiCall(`/api/projects/${id}`, { method: 'PUT', body: project })
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        const current = projects.value[index]
        if (!current) return false
        projects.value[index] = { ...current, ...project }
      }
      success('Project updated successfully')
      return true
    } catch (err) {
      console.error(err)
      showError('Error updating project')
      return false
    }
  }

  // ===== DELETE =====
  const deleteProject = async (id: string) => {
    try {
      await apiCall(`/api/projects/${id}`, { method: 'DELETE' })
      projects.value = projects.value.filter(p => p.id !== id)
      success('Project deleted successfully')
      return true
    } catch (err) {
      console.error(err)
      showError('Error deleting project')
      return false
    }
  }

  // ===== UTILS =====
  const getAllPeople = (project: Project) => [
    ...(project.owner ? [project.owner] : []),
    ...project.managers,
    ...project.members
  ]

  const getProjectMembersCount = (project: Project) => getAllPeople(project).length

  const getProjectOwners = computed(() =>
    projects.value.flatMap(p => p.owner ? [p.owner] : [])
  )

  const getProjectById   = (id: string): Project | null => projects.value.find(p => p.id === id) ?? null
  const getProjectsBySev = (sev: ProjectSeverity): Project[] => projects.value.filter(p => p.sev === sev)

  // ===== INIT =====
  if (typeof window !== 'undefined') {
    onMounted(() => { loadProjects() })
  }

  return {
    projects:           readonly(projects),
    projectsLoading:    readonly(loading),
    loading:            readonly(loading),
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsBySev,
    getAllPeople,
    getProjectMembersCount,
    getProjectOwners
  }
}
