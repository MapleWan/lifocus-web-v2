import { defineStore } from 'pinia'
import { setCurrentProjectId } from '@/utils/project.ts'

export const useMainStore = defineStore('main', {
  state: () => ({
    isLoading: false,
    currentProjectId: '',
  }),

  actions: {
    setCurrentProjectId(id: string) {
      this.currentProjectId = id
      setCurrentProjectId(id)
    },
  },
  persist: {
    key: 'main',
    storage: localStorage,
  },
})
