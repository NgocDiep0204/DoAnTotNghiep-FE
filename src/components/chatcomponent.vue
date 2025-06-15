<template>
  <div>
    <!-- Nút mở chat -->
    <button
      @click="toggleChat"
      class="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
    >
      💬
      <span
        v-if="hasNewMessage"
        class="absolute top-0 right-0 bg-red-500 rounded-full w-3 h-3 animate-ping"
      ></span>
      <span
        v-if="hasNewMessage"
        class="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"
      ></span>
    </button>

    <!-- Toast thông báo -->
    <div
      v-if="toastMessage"
      class="fixed bottom-28 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out"
    >
      {{ toastMessage }}
    </div>

    <!-- Khung chat -->
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
                <strong>
                  {{ msg.senderId === senderId ? 'Bạn' : `Admin (${msg.senderId.slice(0, 4)}...)` }}:
                </strong> {{ msg.text }}
<div class="text-xs text-gray-400 italic">
  ({{ getStatusText(msg.status) }})
  <span v-if="msg.status !== 2"> - {{ formatSentAt(msg.sentAt) }}</span>
</div>
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
  name: 'ChatBox',
  data() {
    return {
      message: '',
      messages: [],
      connection: null,
      isOpen: false,
      senderId: '',
      receiverId: [],
      hasNewMessage: false,
      toastMessage: ''
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
    getStatusText(status) {
      switch (status) {
        case 1: return 'Đã gửi';
        case 2: return 'Đang gửi...';
        case 3: return 'Đã đọc';
        case -1: return 'Lỗi';
        default: return 'Không xác định';
      }
    },
    async fetchAdminId() {
      try {
        const response = await this.useAuth.getUserByRole('Admin');
        this.receiverId = response.map(i => i.id);
      } catch (error) {
        console.error('Lỗi khi lấy Admin:', error);
      }
    },
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.hasNewMessage = false;
      }
      this.$nextTick(() => this.scrollToBottom());
    },
    scrollToBottom() {
      const list = this.$refs.messageList;
      if (list) list.scrollTop = list.scrollHeight;
    },
async sendMessage() {
  if (!this.message.trim()) return;

  const text = this.message.trim();
  const sentAt = new Date().toISOString(); // thời điểm gửi dùng chung

  const tempMessage = {
    messageId: `temp-${Date.now()}`,
    senderId: this.senderId,
    receiverId: this.receiverId.join(','),
    text,
    status: 2,
    sentAt
  };

  this.messages.push(tempMessage);
  this.message = '';
  this.scrollToBottom();

  for (const id of this.receiverId) {
    try {
      await this.connection.invoke('SendMessage', id, text);

      await fetch('https://localhost:7282/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          receiverId: id,
          content: text
        })
      });

      tempMessage.status = 1;
    } catch (err) {
      console.error(`❌ Lỗi khi gửi cho ${id}:`, err);
      tempMessage.status = -1;
    }
  }
}
,
  async fetchOldMessages() {
  try {
    const allMessages = [];

    for (const id of this.receiverId) {
      const res = await fetch(`https://localhost:7282/api/message/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!res.ok) continue;

      const data = await res.json();
      const msgs = data.$values.map(msg => ({
        messageId: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.content,
        status: 1,
        sentAt: new Date(msg.sentAt).toISOString().slice(0, 19) // chuẩn hóa đến giây
      }));

      allMessages.push(...msgs);
    }

    // Dùng Map để loại trùng
    const uniqueMap = new Map();
    for (const msg of allMessages) {
      const key = `${msg.senderId}-${msg.text}-${msg.sentAt}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, msg);
      }
    }

    this.messages = Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
    );

    this.scrollToBottom();
  } catch (err) {
    console.error('❌ Lỗi khi tải tin nhắn:', err);
  }
},
formatSentAt(datetime) {
  const now = new Date();
  const sent = new Date(datetime);
  const diffInSeconds = Math.floor((now - sent) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
}
,
    setupConnection(userId) {
      this.senderId = userId;

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:7282/chathub', {
          accessTokenFactory: () => this.token
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on('ReceiveMessage', (message) => {
        this.messages.push({
          messageId: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          text: message.content,
          status: 1,
          sentAt: message.sentAt
        });

        if (!this.isOpen) {
          this.hasNewMessage = true;
          this.toastMessage = `Tin nhắn từ Admin: ${message.content}`;
          setTimeout(() => {
            this.toastMessage = '';
          }, 3000);
        }

        this.scrollToBottom();
      });

      this.connection.start()
        .then(() => console.log('✅ Kết nối ChatHub thành công'))
        .catch(err => console.error('❌ Lỗi kết nối ChatHub:', err));
    }
  },
  async mounted() {
    try {
      await this.useAuth.getUser();
      let senderId = this.useAuth.user.id;

      if (this.token) {
        try {
          const decoded = jwt_decode(this.token);
          senderId = decoded.sub || senderId;
        } catch (e) {
          console.warn('⚠️ Không thể giải mã token');
        }
      }

      await this.fetchAdminId();
      this.setupConnection(senderId);
      await this.fetchOldMessages();
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
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-10px); }
}

.animate-fade-in-out {
  animation: fade-in-out 3s ease forwards;
}
</style>