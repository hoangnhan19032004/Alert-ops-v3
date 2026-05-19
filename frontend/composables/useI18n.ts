import { ref, computed } from 'vue'

export type Language = 'vi' | 'en'

// ─── Global reactive state (singleton) ───────────────────────────────────────
const _language = ref<Language>('vi')

function _loadLanguage() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language')
    if (saved === 'vi' || saved === 'en') {
      _language.value = saved as Language
    }
  }
}

if (typeof window !== 'undefined') {
  _loadLanguage()
}

// ─── Translation dictionary ───────────────────────────────────────────────────
export const translations = {
  vi: {
    // ── Sidebar ──────────────────────────────────────────────────────────────
    alerts:       'Cảnh báo',
    analytics:    'Phân tích',
    projects:     'Dự án',
    escalation:   'Leo thang',
    profile:      'Hồ sơ',
    preferences:  'Tùy chọn',
    logout:       'Đăng xuất',
    logoutConfirm: 'Bạn có chắc muốn đăng xuất?',
    profileComingSoon: 'Trang hồ sơ sắp ra mắt!',
    logoutSuccess: 'Đã đăng xuất thành công!',

    // ── Common ───────────────────────────────────────────────────────────────
    cancel:       'Hủy',
    createAlert:  'Tạo cảnh báo',
    save:         'Lưu',
    add:          'Thêm',
    delete:       'Xóa',
    edit:         'Sửa',
    close:        'Đóng',
    confirm:      'Xác nhận',
    loading:      'Đang tải...',
    noData:       'Không có dữ liệu',
    search:       'Tìm kiếm...',
    actions:      'Thao tác',
    active:       'Hoạt động',
    inactive:     'Không hoạt động',
    all:          'Tất cả',
    status:       'Trạng thái',
    severity:     'Mức độ',
    environment:  'Môi trường',
    message:      'Nội dung',
    service:      'Dịch vụ',
    time:         'Thời gian',
    retry:        'Thử lại',
    live:         'TRỰC TIẾP',
    offline:      'Ngoại tuyến',
    viewAll:      'Xem tất cả →',
    manage:       'Quản lý →',
    page:         'Trang',
    of:           'trên',
    prev:         'Trước',
    next:         'Tiếp',
    back:         'Quay lại',
    saving:       'Đang lưu...',

    // ── Severity levels ───────────────────────────────────────────────────────
    critical:     'Nghiêm trọng',
    error:        'Lỗi',
    warning:      'Cảnh báo',
    info:         'Thông tin',

    // ── Status values ─────────────────────────────────────────────────────────
    open:         'Mở',
    acknowledged: 'Đã xác nhận',
    escalated:    'Leo thang',
    resolved:     'Đã giải quyết',

    // ── Environment ───────────────────────────────────────────────────────────
    production:   'Sản xuất',
    staging:      'Thử nghiệm',

    // ── Dashboard (index.vue) ─────────────────────────────────────────────────
    dashboard:          'Bảng điều khiển',
    dashboardSub:       'Tổng quan hệ thống · Cập nhật vừa xong',
    totalAlerts:        'Tổng cảnh báo',
    openNow:            'đang mở',
    criticalCount:      'cảnh báo nghiêm trọng',
    needAttention:      'Cần xử lý',
    resolveRate:        'Tỷ lệ giải quyết',
    highPriority:       'Ưu tiên cao',
    last24h:            'Hôm nay:',
    criticalEscalated:  '🔴 Nghiêm trọng & Leo thang',
    noCritical:         'Không có cảnh báo nghiêm trọng',
    bySeverity:         'Theo mức độ',
    topServices:        'Dịch vụ nhiều nhất',
    projectsHealth:     '🗂️ Sức khỏe dự án',
    noProjects:         'Chưa có dự án',
    quickActions:       'Thao tác nhanh',
    viewAlerts:         'Xem cảnh báo',
    escalationRules:    'Quy tắc leo thang',

    // ── Alerts page (alerts.vue) ──────────────────────────────────────────────
    alertsTitle:        'Cảnh báo',
    searchAlerts:       'Tìm kiếm cảnh báo...',
    newAlert:           'Cảnh báo mới',
    allSeverities:      'Tất cả mức độ',
    allEnvs:            'Tất cả môi trường',
    acknowledge:        'Xác nhận',
    escalateBtn:        'Leo thang',
    bulkAcknowledge:    'Xác nhận đã chọn',
    bulkEscalate:       'Leo thang đã chọn',
    noAlertsMatch:      'Không có cảnh báo khớp với bộ lọc',
    loadingAlerts:      'Đang tải cảnh báo từ API...',
    viewDetail:         'Xem chi tiết',
    alertId:            'Cảnh báo #',
    createdAt:          'Tạo lúc',
    statusHistory:      'Lịch sử trạng thái',
    createNewAlert:     'Tạo cảnh báo mới',
    alertMessage:       'Nội dung cảnh báo *',
    alertMessagePh:     'Nội dung cảnh báo...',
    serviceName:        'Tên dịch vụ *',
    ackCount:           'Xác nhận',
    escCount:           'Leo thang',
    tabAll:             'Tất cả',
    tabOpen:            'Đang mở',
    tabAck:             'Đã xác nhận',
    tabEscalated:       'Leo thang',
    tabResolved:        'Đã giải quyết',

    // ── Analytics page (analytics.vue) ────────────────────────────────────────
    analyticsTitle:     'Phân tích',
    last7days:          '7 ngày qua',
    last14days:         '14 ngày qua',
    last30days:         '30 ngày qua',
    byStatus:           'Theo trạng thái',
    byEnvironment:      'Cảnh báo theo môi trường',
    byProject:          'Cảnh báo theo dự án',
    noProjectData:      'Không có dữ liệu dự án',
    noData2:            'Không có dữ liệu',

    // ── Projects page (projects.vue) ──────────────────────────────────────────
    projectsTitle:      'Dự án',
    projectsSub:        'dự án đang theo dõi',
    addProject:         'Thêm dự án',
    loadingProjects:    'Đang tải dự án từ API...',

    // ── Escalation page (escalation.vue) ──────────────────────────────────────
    escalationTitle:    'Quy tắc leo thang',
    escalationSub:      'Tự động định tuyến và thông báo on-call',
    addRule:            '+ Thêm quy tắc',
    notifChannels:      'Kênh thông báo',
    project:            'Dự án',
    trigger:            'Điều kiện',
    delay:              'Độ trễ',
    channel:            'Kênh',
    on:                 'BẬT',
    off:                'TẮT',

    // ── AddProjectModal ───────────────────────────────────────────────────────
    addProjectTitle:    'Thêm dự án mới',
    projectName:        'Tên dự án *',
    projectNamePh:      'vd: api-gateway, database-cluster',
    projectDesc:        'Mô tả',
    projectDescPh:      'Mô tả dự án theo dõi gì...',
    projectTeam:        'Thành viên nhóm',
    projectTeamPh:      'vd: TN, HV, NL',
    maxAlerts:          'Ngưỡng cảnh báo',
    saveProject:        'Lưu dự án',

    // ── AddRuleModal ──────────────────────────────────────────────────────────
    addRuleTitle:       'Thêm quy tắc leo thang',
    selectProject:      'Chọn dự án...',
    triggerCondition:   'Điều kiện kích hoạt',
    severityLevel:      'Mức độ nghiêm trọng',
    customCondition:    'Điều kiện tùy chỉnh',
    conditionValue:     'Giá trị điều kiện',
    severityPh:         'vd: critical, error, warning',
    statusCodePh:       'vd: 503, 500',
    keywordPh:          'vd: timeout, failed',
    delayMinutes:       'Độ trễ (phút)',
    selectDelay:        'Chọn độ trễ...',
    immediate:          'Ngay lập tức',
    notifChannel:       'Kênh thông báo',
    saveRule:           'Lưu quy tắc',

    // ── AlertActionsBar ───────────────────────────────────────────────────────
    clearSelection:     'Bỏ chọn',
    exportAlerts:       'Xuất cảnh báo',
    deleteSelected:     'Xóa đã chọn',
    resolveSelected:    'Giải quyết đã chọn',
    selected:           'đã chọn',

    // ── SearchBox ─────────────────────────────────────────────────────────────
    searchPlaceholder:  'Tìm kiếm cảnh báo...',
    searchHistory:      'Lịch sử tìm kiếm',
    clearHistory:       'Xóa lịch sử',
    noHistory:          'Chưa có lịch sử tìm kiếm',

    // ── Settings Modal ────────────────────────────────────────────────────────
    settings:           'Cài đặt',
    appearance:         'Giao diện',
    theme:              'Chủ đề',
    themeDesc:          'Chọn chủ đề ưa thích',
    compactView:        'Chế độ Compact',
    compactViewDesc:    'Sử dụng bố cục compact cho cảnh báo',
    notifications:      'Thông báo',
    emailNotifications: 'Thông báo Email',
    emailNotificationsDesc: 'Nhận cảnh báo qua email',
    slackNotifications: 'Thông báo Slack',
    slackNotificationsDesc: 'Nhận cảnh báo trong Slack',
    autoRefreshAlerts:  'Tự động làm mới cảnh báo',
    autoRefreshAlertsDesc: 'Tự động làm mới danh sách cảnh báo',
    refreshInterval:    'Khoảng thời gian làm mới',
    refreshIntervalDesc: 'Bao lâu để làm mới (giây)',
    seconds:            'giây',
    display:            'Hiển thị',
    alertsPerPage:      'Cảnh báo trên một trang',
    alertsPerPageDesc:  'Bao nhiêu cảnh báo hiển thị trên một trang',
    language:           'Ngôn ngữ',
    languageDesc:       'Chọn ngôn ngữ ưa thích',
    vietnamese:         'Tiếng Việt',
    english:            'English',
    account:            'Tài khoản',
    resetToDefaults:    'Đặt lại mặc định',
    saveSettings:       'Lưu cài đặt',
    settingsSaved:      'Cài đặt đã được lưu thành công!',
    settingsReset:      'Cài đặt đã được đặt lại về mặc định',
    confirmReset:       'Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?',

    // ── [id] ────────────────────────────────────────────────────────
    backToProjects:     'Quay lại dự án',
    loadingProject:     'Đang tải dự án...',
    noDescription:      'Không có mô tả',
    noAlerts:           'Không có cảnh báo',
    members:            'Thành viên',
    projectNotFound:    'Không tìm thấy dự án',
    deleteProject:      'Xóa dự án',
    confirmDelete:      'Xác nhận xóa',
    deleting:           'Đang xóa...',
    noMembers:          'Không có thành viên được phân công',
    owner:              'Chủ sở hữu',
    managers:           'Quản lý',
    teamMembers:        'Thành viên'
  },

  en: {
    // ── Sidebar ───────────────────────────────────────────────────────────────
    alerts:       'Alerts',
    analytics:    'Analytics',
    projects:     'Projects',
    escalation:   'Escalation',
    profile:      'Profile',
    preferences:  'Preferences',
    logout:       'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    profileComingSoon: 'Profile page coming soon!',
    logoutSuccess: 'Logged out successfully!',

    // ── Common ────────────────────────────────────────────────────────────────
    cancel:       'Cancel',
    createAlert:  'Create Alert',
    save:         'Save',
    add:          'Add',
    delete:       'Delete',
    edit:         'Edit',
    close:        'Close',
    confirm:      'Confirm',
    loading:      'Loading...',
    noData:       'No data',
    search:       'Search...',
    actions:      'Actions',
    active:       'Active',
    inactive:     'Inactive',
    all:          'All',
    status:       'Status',
    severity:     'Severity',
    environment:  'Environment',
    message:      'Message',
    service:      'Service',
    time:         'Time',
    retry:        'Retry',
    live:         'LIVE',
    offline:      'Offline',
    viewAll:      'View all →',
    manage:       'Manage →',
    page:         'Page',
    of:           'of',
    prev:         'Prev',
    next:         'Next',
    back:         'Back',
    saving:       'Saving...',

    // ── Severity levels ───────────────────────────────────────────────────────
    critical:     'Critical',
    error:        'Error',
    warning:      'Warning',
    info:         'Info',

    // ── Status values ─────────────────────────────────────────────────────────
    open:         'Open',
    acknowledged: 'Acknowledged',
    escalated:    'Escalated',
    resolved:     'Resolved',

    // ── Environment ───────────────────────────────────────────────────────────
    production:   'Production',
    staging:      'Staging',

    // ── Dashboard (index.vue) ─────────────────────────────────────────────────
    dashboard:          'Dashboard',
    dashboardSub:       'System overview · Updated just now',
    totalAlerts:        'Total Alerts',
    openNow:            'open right now',
    criticalCount:      'critical alerts',
    needAttention:      'Need attention',
    resolveRate:        'Resolve rate',
    highPriority:       'High priority',
    last24h:            'Last 24h:',
    criticalEscalated:  'Critical & Escalated',
    noCritical:         'No critical alerts',
    bySeverity:         'By Severity',
    topServices:        'Top Services',
    projectsHealth:     'Projects Health',
    noProjects:         'No projects yet',
    quickActions:       'Quick Actions',
    viewAlerts:         'View Alerts',
    escalationRules:    'Escalation Rules',

    // ── Alerts page (alerts.vue) ──────────────────────────────────────────────
    alertsTitle:        'Alerts',
    searchAlerts:       'Search alerts...',
    newAlert:           'New Alert',
    allSeverities:      'All Severities',
    allEnvs:            'All Envs',
    acknowledge:        'Acknowledge',
    escalateBtn:        'Escalate',
    bulkAcknowledge:    'Acknowledge selected',
    bulkEscalate:       'Escalate selected',
    noAlertsMatch:      'No alerts match your filter',
    loadingAlerts:      'Loading alerts from API...',
    viewDetail:         'View detail',
    alertId:            'Alert #',
    createdAt:          'Created At',
    statusHistory:      'Status History',
    createNewAlert:     'Create New Alert',
    alertMessage:       'Message *',
    alertMessagePh:     'Alert message...',
    serviceName:        'Service Name *',
    ackCount:           "Ack'd",
    escCount:           'Escalated',
    tabAll:             'All',
    tabOpen:            'Open',
    tabAck:             "Ack'd",
    tabEscalated:       'Escalated',
    tabResolved:        'Resolved',

    // ── Analytics page (analytics.vue) ────────────────────────────────────────
    analyticsTitle:     'Analytics',
    last7days:          'Last 7 days',
    last14days:         'Last 14 days',
    last30days:         'Last 30 days',
    byStatus:           'By Status',
    byEnvironment:      'Alerts by Environment',
    byProject:          'Alerts by Project',
    noProjectData:      'No project data',
    noData2:            'No data',

    // ── Projects page (projects.vue) ──────────────────────────────────────────
    projectsTitle:      'Projects',
    projectsSub:        'projects being monitored',
    addProject:         'Add Project',
    loadingProjects:    'Loading projects from API...',

    // ── Escalation page (escalation.vue) ──────────────────────────────────────
    escalationTitle:    'Escalation Rules',
    escalationSub:      'Automatic alert routing and on-call notifications',
    addRule:            '+ Add Rule',
    notifChannels:      'Notification Channels',
    project:            'Project',
    trigger:            'Trigger',
    delay:              'Delay',
    channel:            'Channel',
    on:                 'ON',
    off:                'OFF',

    // ── AddProjectModal ───────────────────────────────────────────────────────
    addProjectTitle:    'Add New Project',
    projectName:        'Project Name *',
    projectNamePh:      'e.g., api-gateway, database-cluster',
    projectDesc:        'Description',
    projectDescPh:      'Describe what this project monitors...',
    projectTeam:        'Team Members',
    projectTeamPh:      'e.g., TN, HV, NL',
    maxAlerts:          'Alert Threshold',
    saveProject:        'Save Project',

    // ── AddRuleModal ──────────────────────────────────────────────────────────
    addRuleTitle:       'Add Escalation Rule',
    selectProject:      'Select a project...',
    triggerCondition:   'Trigger Condition',
    severityLevel:      'Severity Level',
    customCondition:    'Custom Condition',
    conditionValue:     'Condition Value',
    severityPh:         'e.g., critical, error, warning',
    statusCodePh:       'e.g., 503, 500',
    keywordPh:          'e.g., timeout, failed',
    delayMinutes:       'Delay (minutes)',
    selectDelay:        'Select delay...',
    immediate:          'Immediate',
    notifChannel:       'Notification Channel',
    saveRule:           'Save Rule',

    // ── AlertActionsBar ───────────────────────────────────────────────────────
    clearSelection:     'Clear selection',
    exportAlerts:       'Export alerts',
    deleteSelected:     'Delete selected alerts',
    resolveSelected:    'Mark selected as resolved',
    selected:           'selected',

    // ── SearchBox ─────────────────────────────────────────────────────────────
    searchPlaceholder:  'Search alerts...',
    searchHistory:      'Search History',
    clearHistory:       'Clear history',
    noHistory:          'No search history yet',

    // ── Settings Modal ────────────────────────────────────────────────────────
    settings:           'Settings',
    appearance:         'Appearance',
    theme:              'Theme',
    themeDesc:          'Choose your preferred theme',
    compactView:        'Compact View',
    compactViewDesc:    'Use compact layout for alerts',
    notifications:      'Notifications',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive alerts via email',
    slackNotifications: 'Slack Notifications',
    slackNotificationsDesc: 'Receive alerts in Slack',
    autoRefreshAlerts:  'Auto-Refresh Alerts',
    autoRefreshAlertsDesc: 'Automatically refresh alerts list',
    refreshInterval:    'Refresh Interval',
    refreshIntervalDesc: 'How often to refresh (seconds)',
    seconds:            'seconds',
    display:            'Display',
    alertsPerPage:      'Alerts Per Page',
    alertsPerPageDesc:  'How many alerts to show per page',
    language:           'Language',
    languageDesc:       'Choose your preferred language',
    vietnamese:         'Tiếng Việt',
    english:            'English',
    account:            'Account',
    resetToDefaults:    'Reset to Defaults',
    saveSettings:       'Save Settings',
    settingsSaved:      'Settings saved successfully!',
    settingsReset:      'Settings reset to defaults',
    confirmReset:       'Are you sure you want to reset all settings to defaults?',

    // ── [id] ────────────────────────────────────────────────────────
    backToProjects:  'Back to Projects',
    loadingProject:  'Loading project...',
    noDescription:   'No description available',
    noAlerts:        'No alerts available',
    members:         'Members',
    projectNotFound: 'Project not found',
    deleteProject:   'Delete Project',
    confirmDelete:   'Confirm Delete',
    deleting:        'Deleting...',
    noMembers:       'No members assigned',
    owner:           'Owner',
    managers:        'Managers',
    teamMembers:     'Members'
  },
} as const

export type TranslationKey = keyof typeof translations.en

// ─── Composable ───────────────────────────────────────────────────────────────
export const useI18n = () => {
  const setLanguage = (lang: Language) => {
    _language.value = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: TranslationKey): string => {
    return (translations[_language.value] as any)[key] ?? (translations.en as any)[key] ?? key
  }

  return {
    language: computed(() => _language.value),
    setLanguage,
    t,
  }
}
