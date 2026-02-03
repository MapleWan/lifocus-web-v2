import Cookies from 'js-cookie'

export function setCurrentProjectId(projectId: string) {
  Cookies.set('currentProjectId', projectId)
}

export function getCurrentProjectId() {
  return Cookies.get('currentProjectId') || ''
}
