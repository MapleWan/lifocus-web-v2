import { defineStore } from 'pinia'
import { getCurrentUserApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    nickname: '',
    email: '',
    avatar: '',
  }),
  actions: {
    async getCurrentUser() {
      const res = await getCurrentUserApi()
      const user = res.data
      this.username = user.username
      this.nickname = user.nickname
      this.email = user.email
      this.avatar = user.avatar
    },
  },

  persist: {
    key: 'user',
    storage: localStorage,
  },
})

// export default useUserStore
