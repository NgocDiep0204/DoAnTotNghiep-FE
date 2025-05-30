<template>
  <div class="flex h-screen">
    <!-- Left Sidebar: User List -->
    <div class="w-1/4 bg-gray-100 p-4 overflow-y-auto">
      <h2 class="text-lg font-bold mb-4">Users</h2>
      <ul>
        <li
          v-for="user in users"
          :key="user.id"
          @click="selectUser(user)"
          :class="['p-2 cursor-pointer rounded hover:bg-gray-300', selectedUser?.id === user.id ? 'bg-blue-200' : '']"
        >
          {{ user.userName }}
        </li>
      </ul>
    </div>

    <!-- Chat Section -->
    <div class="flex-1 flex flex-col">
      <div class="bg-gray-200 p-4 text-xl font-bold">
        {{ selectedUser?.userName || 'Select a user to chat' }}
      </div>

      <!-- Messages -->
      <div ref="messageList" class="flex-1 p-4 overflow-y-auto space-y-2">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[msg.senderId === currentUserId ? 'text-right' : 'text-left']"
        >
          <div :class="msg.senderId === currentUserId ? 'bg-blue-500 text-white inline-block p-2 rounded' : 'bg-gray-300 inline-block p-2 rounded'">
            {{ msg.content }}
          </div>
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
      users: [],
      selectedUser: null,
      messages: [],
      message: '',
      currentUserId: '',
      token: localStorage.getItem('token'),
      connection: null
    };
  },
  async mounted() {
    this.loadUsers();
    this.initSignalR();
  },
  methods: {
      async loadUsers() {
    try {
      const res = await fetch('https://localhost:7282/api/users', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await res.json();
      this.users = data;
      // Lưu currentUserId từ token nếu cần
      const tokenPayload = JSON.parse(atob(this.token.split('.')[1]));
      this.currentUserId = tokenPayload.sub;
    } catch (err) {
      console.error('Error loading users:', err);
    }
  },
    async selectUser(user) {
      this.selectedUser = user;
      await this.loadMessages(user.id);
    },
    async loadMessages(receiverId) {
      try {
        const res = await fetch(`https://localhost:7282/api/message/${receiverId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        this.messages = data.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        this.scrollToBottom();
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    },
    async sendMessage() {
      if (!this.message.trim() || !this.selectedUser) return;
      const content = this.message.trim();
      this.message = '';
      try {
        await this.connection.invoke('SendMessage', this.selectedUser.id, content);
      } catch (err) {
        console.error('Error sending message:', err);
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
        if (message.senderId === this.selectedUser?.id || message.receiverId === this.selectedUser?.id) {
          this.messages.push(message);
          this.scrollToBottom();
        }
      });

      this.connection.on('MessageSent', (message) => {
        if (message.receiverId === this.selectedUser?.id) {
          this.messages.push(message);
          this.scrollToBottom();
        }
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>
