<!-- <template>
  <div>
    <button
      @click="toggleChat"
      class="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
    >
      💬
    </button>

    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-lg border z-50 flex flex-col"
        style="max-height: 400px"
      >
        <div class="bg-blue-600 text-white px-4 py-2 flex justify-between items-center rounded-t-lg">
          <span class="font-semibold">Tin nhắn</span>
          <button @click="toggleChat" class="hover:text-gray-200">✖</button>
        </div>

        <div class="flex-1 overflow-y-auto p-3" ref="messageList">
          <ul class="space-y-2 text-sm">
            <li v-for="msg in messages" :key="msg.messageId">
              <div
                class="p-2 rounded shadow-sm"
                :class="msg.senderId === senderId ? 'bg-gray-100' : 'bg-blue-100'"
              >
                <strong>{{ msg.senderId === senderId ? 'Bạn' : 'Admin' }}:</strong> {{ msg.text }}
                <div class="text-xs text-gray-400 italic">({{ geStringStatus(msg.status) }})</div>
              </div>
            </li>
          </ul>
        </div>

        <div class="p-3 border-t flex gap-2">
          <input
            v-model="message"
            @keyup.enter="sendMessage"
            class="flex-1 p-2 border rounded"
            placeholder="Nhập tin nhắn..."
          />
          <button
            @click="sendMessage"
            class="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Gửi
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { useAuthStore } from '../store/user/authstore';
import jwt_decode from 'jwt-decode';
import * as signalR from '@microsoft/signalr';

export default {
  data() {
    return {
      message: '',
      messages: [],
      connection: null,
      isOpen: false,
      senderId: '',
      receiverId: 'ADMIN_USER_ID', // Thay bằng ID admin thực tế
    };
  },
  computed: {
    token() {
      return localStorage.getItem('token');
    },
    useAuth() {
      return useAuthStore();
    }
  },
  methods: {
    geStringStatus(status) {
      switch (status) {
        case 1: return 'Đã gửi';
        case 2: return 'Đang gửi';
        case 3: return 'Đã đọc';
        default: return 'Không xác định';
      }
    },
    toggleChat() {
      this.isOpen = !this.isOpen;
      this.$nextTick(() => this.scrollToBottom());
    },
    scrollToBottom() {
      const list = this.$refs.messageList;
      if (list) list.scrollTop = list.scrollHeight;
    },
    async sendMessage() {
      if (!this.message.trim()) return;

      const text = this.message.trim();

      // Push tin nhắn tạm thời với trạng thái "Đang gửi"
      const tempMsg = {
        messageId: `temp-${Date.now()}`,
        senderId: this.senderId,
        text,
        status: 2 // Đang gửi
      };
      this.messages.push(tempMsg);
      this.message = '';
      this.scrollToBottom();

      try {
        console.log('📤 Đang gửi tin nhắn...', this.useAuth.user.role);
        await this.connection.invoke('SendMessage', text, this.useAuth.user.role);
        console.log('✅ Đã gửi tin nhắn');
        // Cập nhật tin nhắn tạm thời thành "Đã gửi"
        //tempMsg.status = 1;
      } catch (err) {
        console.error('❌ Lỗi khi gửi:', err);
        // Cập nhật tin nhắn tạm thời thành "Lỗi"
        tempMsg.status = -1;
      }
    },
    setupConnection(userId) {
      this.senderId = userId;

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7282/chathub`, {
          accessTokenFactory: () => this.token
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on('ReceiveMessage', (message) => {
        this.messages.push({
          messageId: `msg-${Date.now()}`,
          senderId: message.senderRole === 'User' ? this.senderId : 'admin',
          text: message.content,
          status: 1, // Đã gửi
          sentAt: message.sentAt
        });
        this.scrollToBottom();
      });

      this.connection.start()
        .then(() => {
          console.log('✅ Đã kết nối với ChatHub');
        })
        .catch(err => {
          console.error('❌ Không thể kết nối:', err);
        });
    }
  },
  watch: {
    messages() {
      this.scrollToBottom();
    }
  },
  async mounted() {
    try {
      await this.useAuth.getUser();
      const userIdFromStore = this.useAuth.user.id;

      let senderId = userIdFromStore;
      if (this.token) {
        try {
          const decoded = jwt_decode(this.token);
          senderId = decoded.sub || senderId;
        } catch (e) {
          console.warn('⚠️ Không thể decode token');
        }
      }

      this.setupConnection(senderId);
    } catch (err) {
      console.error('❌ Lỗi khi khởi tạo:', err);
    }
  },
  unmounted() {
    if (this.connection) {
      this.connection.stop();
    }
  }
};
</script> -->
<template></template>