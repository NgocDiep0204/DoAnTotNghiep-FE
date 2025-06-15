<template>
  <div class="flex h-screen">
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
          <span v-if="user.unread" class="w-3 h-3 bg-red-600 rounded-full ml-2" title="Tin nhắn mới"></span>
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
          v-for="item in groupedMessages"
          :key="item.type === 'divider' ? 'divider-' + item.date : item.data.messageId"
        >
          <!-- Date Divider -->
          <div v-if="item.type === 'divider'" class="flex justify-center my-2 text-sm text-gray-500">
            {{ item.date }}
          </div>

          <!-- Message -->
<div
  v-else
  @click="toggleTime(item.data.messageId)"
  :class="[
    'flex flex-col cursor-pointer',
    item.data.senderId === currentUserId ? 'items-end self-end ml-auto' : 'items-start self-start mr-auto',
    'max-w-[70%]'
  ]"
>

            <div
              :class="item.data.senderId === currentUserId
                ? 'bg-blue-500 text-white p-2 rounded'
                : 'bg-gray-300 p-2 rounded'"
            >
              {{ item.data.text }}
            </div>

            <!-- Thời gian gửi (ẩn/hiện khi click) -->
            <small
              v-if="showTimeMessages.has(item.data.messageId)"
              class="mt-1 text-xs"
              :class="{
                'text-gray-400': item.data.status === 1,
                'text-yellow-500': item.data.status === 0,
                'text-red-500': item.data.status === -1
              }"
            >
              <template v-if="item.data.senderId === currentUserId">
                {{
                  item.data.status === 1
                    ? 'Đã gửi'
                    : item.data.status === 0
                    ? 'Đang gửi...'
                    : 'Lỗi'
                }} - {{ formatSentAt(item.data.sentAt) }}
              </template>
              <template v-else>
                {{ formatSentAt(item.data.sentAt) }}
              </template>
            </small>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t flex">
        <input
          v-model="message"
          @keyup.enter="sendMessage"
          placeholder="Nhập tin nhắn..."
          class="flex-1 border border-gray-400 rounded px-4 py-2 mr-2"
        />
        <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded">
          Gửi
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as signalR from '@microsoft/signalr';

export default {
  name: 'ChatWindow',
  data() {
    return {
      contacts: [],
      selectedUser: null,
      messages: [],
      message: '',
      currentUserId: '',
      token: localStorage.getItem('token'),
      connection: null,
      showTimeMessages: new Set()
    };
  },
  computed: {
    sortedContacts() {
      return [...this.contacts].sort((a, b) => {
        const aTime = a.lastMessageTime ? new Date(a.lastMessageTime) : 0;
        const bTime = b.lastMessageTime ? new Date(b.lastMessageTime) : 0;
        return bTime - aTime;
      });
    },
    groupedMessages() {
      const result = [];
      let lastDate = null;

      for (let i = 0; i < this.messages.length; i++) {
        const msg = this.messages[i];
        const msgDate = new Date(msg.sentAt).toLocaleDateString('vi-VN');

        const nextMsg = this.messages[i + 1];
        const nextDate = nextMsg ? new Date(nextMsg.sentAt).toLocaleDateString('vi-VN') : null;

        result.push({ type: 'message', data: msg });

        if (msgDate !== nextDate || i === this.messages.length - 1) {
          result.push({ type: 'divider', date: msgDate });
        }
      }

      return result;
    }
  },
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchContacts();
    this.initSignalR();
  },
  methods: {
    async fetchCurrentUser() {
      const res = await fetch('https://localhost:7282/api/ApplicationUser/GetUserProfile', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.currentUserId = data.id;
    },
    async fetchContacts() {
      const res = await fetch(`https://localhost:7282/api/message/contact/${this.currentUserId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.contacts = (data.$values || []).map(user => ({
        ...user,
        unread: false,
        lastMessageTime: null
      }));
    },
    async selectUser(user) {
      this.selectedUser = user;
      const index = this.contacts.findIndex(c => c.id === user.id);
      if (index !== -1) this.contacts[index].unread = false;
      await this.loadMessages(user.id);
    },
    async loadMessages(receiverId) {
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
      this.scrollToBottom();
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
        if (index !== -1) this.messages[index].status = 1;
      } catch {
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

      this.connection.start().catch(console.error);

      this.connection.on('ReceiveMessage', (message) => {
        const msg = {
          messageId: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          text: message.content,
          sentAt: message.sentAt,
          status: 1
        };
        this.messages.push(msg);
        this.scrollToBottom();
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    formatSentAt(datetime) {
      const sent = new Date(datetime);
      const now = new Date();
      const diff = Math.floor((now - sent) / 1000);
      if (diff < 60) return 'Vừa xong';
      const mins = Math.floor(diff / 60);
      if (mins < 60) return `${mins} phút trước`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Hôm nay lúc ${sent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (sent.toLocaleDateString() === yesterday.toLocaleDateString()) return 'Hôm qua';

      return sent.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    },
    toggleTime(id) {
      if (this.showTimeMessages.has(id)) {
        this.showTimeMessages.delete(id);
      } else {
        this.showTimeMessages.add(id);
      }
    }
  }
};
</script>
