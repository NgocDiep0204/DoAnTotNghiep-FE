import { defineStore } from 'pinia'
import axiosClient from '../axiosClient'
export const useChatStore = defineStore('chat', {
    state: () => ({
      messages: [],
      currentMessage: "",
      messagesUser: [],
  
    }),
    getters: {
    },
    actions: {
        async getMessages() {
            try {
                const response = await axiosClient.get('chat')
                this.messages = response.data.$values
                return true
            } catch (error) {
                console.error('Error fetching messages:', error)
            }
        },

        async getMessageByUserId(userId) {
            try {
              const response = await axiosClient.get(`chat/messages/${userId}`)
              this.messagesUser =  response.data?.$values 
            } catch (err) {
              console.error('Lỗi lấy lịch sử:', err)
              return []
            }
          },
        },
})