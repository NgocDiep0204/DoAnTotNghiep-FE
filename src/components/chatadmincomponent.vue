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
      <h2 class="text-lg font-bold mb-4">Contacts</h2>
      <ul>
        <li
          v-for="user in contacts"
          :key="user.id"
          @click="selectUser(user)"
          :class="['p-2 cursor-pointer rounded hover:bg-gray-300 flex items-center justify-between', selectedUser?.id === user.id ? 'bg-blue-200' : '']"
        >
          <span>{{ user.userName || 'Unknown User' }}</span>

          <!-- Chấm đỏ nếu có tin nhắn chưa đọc -->
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
        {{ selectedUser?.userName || 'Select a user to chat' }}
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
            v-if="msg.senderId === currentUserId"
            :class="{
              'text-gray-400': msg.status === 1,
              'text-yellow-500': msg.status === 0,
              'text-red-500': msg.status === -1
            }"
            class="mt-1 text-xs"
          >
            {{
              msg.status === 1
                ? 'Đã gửi'
                : msg.status === 0
                ? 'Đang gửi...'
                : 'Lỗi'
            }}
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
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchContacts();
    this.initSignalR();
  },
  methods: {
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
        // Mình map thêm thuộc tính unread mặc định false
        this.contacts = (data.$values || []).map(user => ({
          ...user,
          unread: false
        }));
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    },
    async selectUser(user) {
      this.selectedUser = user;
      // Reset unread khi chọn contact
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
        this.messages = data.$values.map(msg => ({
          messageId: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          text: msg.content,
          status: 1,
          sentAt: msg.sentAt
        })).sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
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

      // Tạo tin nhắn local trước khi gửi
      const tempMessage = {
        messageId: `local-${Date.now()}`, // ID tạm
        senderId: this.currentUserId,
        receiverId: receiverId,
        text: content,
        status: 0, // 0: pending
        sentAt: new Date().toISOString()
      };
      this.messages.push(tempMessage);
      this.scrollToBottom();

      try {
        await this.connection.invoke('SendMessage', receiverId, content);

        // Cập nhật trạng thái thành "sent" nếu thành công (status = 1)
        const index = this.messages.findIndex(m => m.messageId === tempMessage.messageId);
        if (index !== -1) {
          this.messages[index].status = 1;
        }
      } catch (err) {
        console.error('Error sending message:', err);
        const index = this.messages.findIndex(m => m.messageId === tempMessage.messageId);
        if (index !== -1) {
          this.messages[index].status = -1;
        }
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
        // Nếu tin nhắn là với người đang chat thì thêm tin nhắn
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

          // Khi đang chat với user đó => reset unread
          const idx = this.contacts.findIndex(c => c.id === this.selectedUser?.id);
          if (idx !== -1) {
            this.contacts[idx].unread = false;
          }
        } else {
          // Nếu tin nhắn từ user khác hoặc không phải đang chat => set unread = true cho contact tương ứng
          const otherUserId = message.senderId === this.currentUserId ? message.receiverId : message.senderId;
          const idx = this.contacts.findIndex(c => c.id === otherUserId);
          if (idx !== -1) {
            this.contacts[idx].unread = true;
          } else {
            // Nếu chưa có trong contacts thì thêm mới với unread = true
            this.contacts.push({ id: otherUserId, userName: 'New User', unread: true });
          }
        }

        // Hiện toast nếu tin nhắn là của người khác (không phải mình)
        if (message.senderId !== this.currentUserId) {
          this.showToast(`Tin nhắn mới từ ${this.selectedUser?.userName || 'Người dùng'}`);
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
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

/* Animation toast */
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