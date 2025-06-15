<template>
  <div class="flex h-screen">
    <!-- Toast Notification -->
    <div
      v-if="toast.visible"
      class="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out z-50"
    >
      {{ toast.message }}
    </div>

    <!-- Contacts Sidebar -->
    <div class="w-1/4 bg-gray-100 p-4 overflow-y-auto">
      <h2 class="text-lg font-bold mb-4">Liên hệ</h2>
      <ul>
        <li
          v-for="user in sortedContacts"
          :key="user.id"
          @click="selectUser(user)"
          :class="['p-2 cursor-pointer rounded hover:bg-gray-300 flex items-center justify-between', selectedUser?.id === user.id ? 'bg-blue-200' : '']"
        >
          <span>{{ user.userName || 'Unknown User' }}</span>
          <span
            v-if="user.unread"
            class="w-3 h-3 bg-red-600 rounded-full ml-2"
            title="Tin nhắn mới chưa đọc"
          ></span>
        </li>
      </ul>
    </div>

    <!-- Chat Section -->
    <div class="flex-1 flex flex-col">
      <div class="bg-gray-200 p-4 text-xl font-bold">
        {{ selectedUser?.fullName || 'Người dùng' }}
      </div>

      <div ref="messageList" class="flex-1 p-4 overflow-y-auto space-y-2 flex flex-col">
        <div
          v-for="msg in messages"
          :key="msg.messageId"
          :class="[
            'flex flex-col max-w-[70%]',
            msg.senderId === currentUserId ? 'items-end self-end' : 'items-start self-start'
          ]"
        >
          <div
            :class="msg.senderId === currentUserId
              ? 'bg-blue-500 text-white p-2 rounded'
              : 'bg-gray-300 p-2 rounded'"
          >
            {{ msg.text }}
          </div>

          <small
            class="mt-1 text-xs"
            :class="{
              'text-gray-400': msg.status === 1,
              'text-yellow-500': msg.status === 0,
              'text-red-500': msg.status === -1
            }"
          >
            <template v-if="msg.senderId === currentUserId">
              {{
                msg.status === 1
                  ? 'Đã gửi'
                  : msg.status === 0
                  ? 'Đang gửi...'
                  : 'Lỗi'
              }}
              <span v-if="msg.status !== 1"> - {{ formatSentAt(msg.sentAt) }}</span>
            </template>
            <template v-else>
              {{ formatSentAt(msg.sentAt) }}
            </template>
          </small>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t flex">
        <input
          v-model="message"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
          class="flex-1 border border-gray-400 rounded px-4 py-2 mr-2"
        />
        <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as signalR from '@microsoft/signalr';

export default {
  data() {
    return {
      contacts: [],
      selectedUser: null,
      messages: [],
      message: '',
      currentUserId: '',
      token: localStorage.getItem('token'),
      connection: null,
      toast: {
        visible: false,
        message: ''
      }
    };
  },
  computed: {
    sortedContacts() {
      return [...this.contacts].sort((a, b) => {
        const aTime = a.lastMessageTime ? new Date(a.lastMessageTime) : 0;
        const bTime = b.lastMessageTime ? new Date(b.lastMessageTime) : 0;
        return bTime - aTime;
      });
    }
  },
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchContacts();
    this.initSignalR();
  },
  methods: {
    formatSentAt(datetime) {
      const now = new Date();
      const sent = new Date(datetime);
      const diff = Math.floor((now - sent) / 1000);
      if (diff < 60) return `${diff} giây trước`;
      const mins = Math.floor(diff / 60);
      if (mins < 60) return `${mins} phút trước`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} giờ trước`;
      const days = Math.floor(hours / 24);
      return `${days} ngày trước`;
    },
    async fetchCurrentUser() {
      try {
        const res = await fetch('https://localhost:7282/api/ApplicationUser/GetUserProfile', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        this.currentUserId = data.id;
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    },
    async fetchContacts() {
      try {
        const res = await fetch(`https://localhost:7282/api/message/contact/${this.currentUserId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        this.contacts = (data.$values || []).map(user => ({
          ...user,
          unread: false,
          lastMessageTime: null
        }));
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    },
    async selectUser(user) {
      this.selectedUser = user;
      const index = this.contacts.findIndex(c => c.id === user.id);
      if (index !== -1) {
        this.contacts[index].unread = false;
      }
      await this.loadMessages(user.id);
    },
    async loadMessages(receiverId) {
      try {
        const res = await fetch(`https://localhost:7282/api/message/${receiverId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        const raw = data.$values.map(msg => ({
          messageId: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          text: msg.content,
          status: 1,
          sentAt: new Date(msg.sentAt).toISOString()
        }));
        const unique = new Map();
        for (const msg of raw) {
          const key = `${msg.senderId}-${msg.text}-${msg.sentAt}`;
          if (!unique.has(key)) unique.set(key, msg);
        }
        this.messages = Array.from(unique.values()).sort(
          (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
        );
        const lastMsg = this.messages[this.messages.length - 1];
        const idx = this.contacts.findIndex(c => c.id === receiverId);
        if (idx !== -1 && lastMsg) {
          this.contacts[idx].lastMessageTime = lastMsg.sentAt;
        }
        this.scrollToBottom();
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    },
    async sendMessage() {
      if (!this.message.trim() || !this.selectedUser) return;
      const content = this.message.trim();
      const receiverId = this.selectedUser.id;
      this.message = '';

      const temp = {
        messageId: `local-${Date.now()}`,
        senderId: this.currentUserId,
        receiverId,
        text: content,
        status: 0,
        sentAt: new Date().toISOString()
      };
      this.messages.push(temp);
      this.scrollToBottom();

      try {
        await this.connection.invoke('SendMessage', receiverId, content);
        const index = this.messages.findIndex(m => m.messageId === temp.messageId);
        if (index !== -1) {
          this.messages[index].status = 1;
          const contactIdx = this.contacts.findIndex(c => c.id === receiverId);
          if (contactIdx !== -1) {
            this.contacts[contactIdx].lastMessageTime = new Date();
          }
        }
      } catch (err) {
        console.error('Error sending message:', err);
        const index = this.messages.findIndex(m => m.messageId === temp.messageId);
        if (index !== -1) this.messages[index].status = -1;
      }
    },
    initSignalR() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:7282/chathub', {
          accessTokenFactory: () => this.token
        })
        .withAutomaticReconnect()
        .build();

      this.connection.start()
        .then(() => console.log('✅ Connected to SignalR'))
        .catch(err => console.error('❌ SignalR connection error:', err));

      this.connection.on('ReceiveMessage', (message) => {
        const msgTime = new Date(message.sentAt);
        const otherUserId = message.senderId === this.currentUserId
          ? message.receiverId
          : message.senderId;

        if (message.senderId === this.selectedUser?.id || message.receiverId === this.selectedUser?.id) {
          this.messages.push({
            messageId: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            text: message.content,
            sentAt: message.sentAt,
            status: 1
          });
          this.scrollToBottom();

          const idx = this.contacts.findIndex(c => c.id === this.selectedUser?.id);
          if (idx !== -1) {
            this.contacts[idx].unread = false;
            this.contacts[idx].lastMessageTime = msgTime;
          }
        } else {
          const idx = this.contacts.findIndex(c => c.id === otherUserId);
          if (idx !== -1) {
            this.contacts[idx].unread = true;
            this.contacts[idx].lastMessageTime = msgTime;
          } else {
            this.contacts.push({
              id: otherUserId,
              userName: 'New User',
              unread: true,
              lastMessageTime: msgTime
            });
          }
        }

        if (message.senderId !== this.currentUserId) {
          this.showToast(`Tin nhắn mới từ ${this.selectedUser?.fullName || 'Người dùng'}`);
        }
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    showToast(msg) {
      this.toast.message = msg;
      this.toast.visible = true;
      setTimeout(() => {
        this.toast.visible = false;
      }, 3000);
    }
  }
};
</script>

<style scoped>
@keyframes fade-in-out {
  0%, 100% {
    opacity: 0;
    transform: translateY(10px);
  }
  10%, 90% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-out {
  animation: fade-in-out 3s ease forwards;
}
</style>
