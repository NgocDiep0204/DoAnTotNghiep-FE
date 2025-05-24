<template>
  <div class="relative">
    <div
     
      @click="toggleDropdown"
      class="cursor-pointer bg-blue-400 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 relative"
    >
      💬
      <span
        v-if="uncount > 0"
        class="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
      >
        {{ uncount }}
      </span>
    </div>
    </div>
    </template>
    <!-- <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-[400px] overflow-y-auto"
    >
      <ul v-if="Object.keys(messages).length > 0">
        <li
          v-for="(chat, senderId) in messages"
          :key="senderId"
          class="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
          @click="openChat(senderId)"
        >
          <img :src="chat.avatar" class="w-10 h-10 rounded-full object-cover" />
          <div class="flex-1">
            <div class="font-semibold truncate">{{ chat.name }}</div>
            <div class="text-sm text-gray-500 truncate">
              <span v-if="chat.isYou">Bạn: </span>{{ chat.lastMessage }}
              <span class="text-xs ml-1">• {{ chat.time }}</span>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="p-4 text-center text-gray-500">
        Hộp thư trống
      </div>
    </div>

    <div class="fixed bottom-6 right-[100px] flex gap-4 z-40">
      <ChatModel
        v-for="chat in openChats"
        :key="chat.senderId"
        :chatUser="chat"
        :currentUser="useAuth.user"
        @close="handleCloseChat(chat.senderId)"
        @send="sendMessage" 
      />
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store/user/authstore'
import { useChatStore } from '../store/chat'
import * as signalR from '@microsoft/signalr'
import axios from 'axios'
import ChatModel from './chatmodelcomponent.vue'

export default {
  data() {
    return {
      showDropdown: false,
      messages: {},
      openChats: [],
      connection: null,
      uncount: 0
    }
  },
  components: {
    ChatModel
  },
  computed: {
    useAuth() {
      return useAuthStore()
    },
    isAdmin() {
      return this.useAuth.user?.role === 'Admin'
    },
    unreadMessagesCount() {
      return Object.values(this.messages).reduce(
        (count, chat) => count + chat.unreadCount,
        0
      )
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    async openChat(senderId) {
      const chat = this.messages[senderId]
      if (!chat || this.openChats.some(c => c.senderId === senderId)) return

      const history = await this.fetchChatHistory(senderId)

      this.openChats.push({
        senderId: chat.senderId,
        name: chat.name,
        avatar: chat.avatar,
        history // 👈 truyền lịch sử vào
      })

      this.markMessagesAsRead(senderId)
    },
    markMessagesAsRead(senderId) {
      if (this.messages[senderId]) {
        this.messages[senderId].unreadCount = 0
      }
    },
    handleCloseChat(senderId) {
      this.openChats = this.openChats.filter(c => c.senderId !== senderId)
    },
    sendMessage({ receiverId, content }) {
      if (this.connection) {
        this.connection.invoke('SendMessage', { receiverId, content })
          .catch(err => console.error('Gửi tin nhắn thất bại:', err))

        // Cập nhật tin nhắn vào danh sách ngay lập tức
        const newMessage = {
          senderId: this.useAuth.user.userId,
          receiverId,
          content,
          time: new Date().toLocaleTimeString(),
          isYou: true
        }

        if (!this.messages[receiverId]) {
          this.messages[receiverId] = {
            senderId: receiverId,
            name: receiverId,
            avatar: '', // Cập nhật avatar nếu cần
            lastMessage: content,
            time: newMessage.time,
            unreadCount: 0
          }
        }

        this.messages[receiverId].lastMessage = content
        this.messages[receiverId].time = newMessage.time
      }
    },
    async fetchMessages() {
      try {
        const response = await axios.get('https://localhost:7282/api/chat')
        const lastMessages = response.data.lastMessages.$values
        this.uncount = response.data.unreadMessageCount

        if (Array.isArray(lastMessages)) {
          this.messages = lastMessages.reduce((acc, message) => {
            const senderId = message.senderId
            acc[senderId] = {
              senderId,
              name: message.thread?.user?.fullName,
              avatar: message.thread?.user?.imageUrl,
              lastMessage: message.messageText,
              time: message.sentAt,
            }
            return acc
          }, {})
        } else {
          console.warn('Không có lastMessages hợp lệ:', lastMessages)
        }
      } catch (error) {
        console.error('Lỗi khi fetch messages:', error)
      }
    },
    setupSignalR() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7282/chathub?access_token=${localStorage.getItem('token')}`)
        .withAutomaticReconnect()
        .build()

      this.connection.start().catch(err => console.error('Kết nối thất bại:', err))

      this.connection.on('ReceiveMessage', (message) => {
        const senderId = message.senderId
        const senderName = message.senderName
        const senderAvatar = message.avatar
        if (!this.messages[senderId]) {
          this.messages[senderId] = {
            senderId,
            name: senderName,
            avatar: senderAvatar,
            lastMessage: message.content,
            time: 'Vừa xong',
            unreadCount: 1
          }
        } else {
          this.messages[senderId].lastMessage = message.content
          this.messages[senderId].time = 'Vừa xong'
          this.messages[senderId].unreadCount += 1
        }

        const isChatOpen = this.openChats.find(c => c.senderId === senderId)
        if (isChatOpen) {
          this.messages[senderId].unreadCount = 0
          this.$refs.chatModel?.forEach(ref => {
            if (ref.senderId === senderId) {
              ref.receiveMessage(senderId, message.content)
            }
          })
        }
      })
    },
    async fetchChatHistory(senderId) {
      try {
        const res = await axios.get(`https://localhost:7282/api/chat/messages/${senderId}`)
        return res.data?.$values || []
      } catch (err) {
        console.error('Lỗi lấy lịch sử:', err)
        return []
      }
    }
  },
  mounted() {
    this.fetchMessages()
    this.setupSignalR()
  }
}
</script> -->
