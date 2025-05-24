<template>
  <div
    v-if="chatUser?.name"
    class="w-80 bg-white shadow-lg rounded-lg overflow-hidden flex flex-col relative"
  >
    <div class="bg-blue-500 text-white px-4 py-2 flex justify-between items-center">
      <h4 class="text-sm font-semibold">{{ chatUser.name }}</h4>
      <button @click="$emit('close')">✖️</button>
    </div>

    <div
      ref="chatScroll"
      class="flex-1 overflow-y-auto px-3 py-2 space-y-2 max-h-[300px]"
    >
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="msg.isMe ? 'text-right' : 'text-left'"
      >
        <span
          :class="msg.isMe ? 'bg-blue-200' : 'bg-gray-200'"
          class="inline-block px-3 py-1 rounded"
        >
          {{ msg.text }}
        </span>
      </div>
    </div>

    <div class="p-2">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        class="w-full border px-3 py-1 rounded"
        placeholder="Nhập tin nhắn..."
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    chatUser: Object,
    currentUser: Object
  },
  data() {
    return {
      messages: [],
      newMessage: ''
    }
  },
  mounted() {
    this.loadHistory()

  },
  watch: {
    messages() {
      this.scrollToBottom()
    }
    

  },
  methods: {
    sendMessage() {
  const text = this.newMessage.trim(); // Lấy nội dung tin nhắn
  if (!text || !this.chatUser?.senderId) return; // Nếu không có nội dung hoặc không có người nhận thì không gửi

  // Thêm tin nhắn vào mảng tin nhắn với trạng thái "Đang gửi" (có thể thêm trạng thái để quản lý)
  this.messages.push({ text, isMe: true });

  // Emit sự kiện gửi tin nhắn với receiverId là người dùng (User) nhận tin nhắn
  this.$emit('send', {
    receiverId: this.chatUser.senderId, // ID người nhận (User)
    content: text // Nội dung tin nhắn
  });

  // Xóa nội dung tin nhắn sau khi gửi
  this.newMessage = '';
},
    receiveMessage(message) {
      this.messages.push({ text: message.content, isMe: false })
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatScroll
        if (container) container.scrollTop = container.scrollHeight
      })
    },
    loadHistory() {
    if (this.chatUser?.history) {
      this.messages = this.chatUser.history.map(m => ({
        text: m.messageText,
        isMe: m.senderId === this.currentUser.id
      }))
    }
    this.scrollToBottom()
  },
  }
}
</script>
