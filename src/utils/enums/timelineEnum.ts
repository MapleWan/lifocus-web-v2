export const ETimelineType: { value: string, label: string, theme: 'default' | 'primary' | 'warning' | 'danger' | 'success' }[] = [
  { value: 'WORK', label: '工作', theme: 'warning' },
  { value: 'LIFE', label: '生活', theme: 'success' },
  { value: 'LEARNING', label: '学习', theme: 'primary' },
  { value: 'ENTERTAINMENT', label: '娱乐', theme: 'success' },
  { value: 'HEALTH', label: '健康', theme: 'success' },
  { value: 'FINANCE', label: '财务', theme: 'primary' },
  { value: 'TRAVEL', label: '旅行', theme: 'primary' },
  { value: 'MEETING', label: '会议', theme: 'warning' },
  { value: 'REMINDER', label: '提醒', theme: 'success' },
]

export const ETimelineStatus: { value: string, label: string, dotColor: string }[] = [
  { value: 'PROGRESSING', label: '进行中', dotColor: 'primary' },
  { value: 'PAUSED', label: '已暂停', dotColor: 'warning' },
  { value: 'FINISHED', label: '已完成', dotColor: 'success' },
]
