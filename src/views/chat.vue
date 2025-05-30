<template>
  <div>
    <input v-model="receiverId" placeholder="Receiver ID" />
    <input v-model="message" placeholder="Message" />
    <button @click="sendMessage">Send</button>

    <h3>Messages</h3>
    <ul>
      <li v-for="(msg, index) in messages" :key="index">
        [{{ msg.senderId }} → {{ msg.receiverId }}]: {{ msg.content }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as signalR from '@microsoft/signalr';

const receiverId = ref('');
const message = ref('');
const messages = ref([]);

let connection = null;

const sendMessage = async () => {
  if (!connection) return;
  if (!receiverId.value || !message.value) return;

  try {
    await connection.invoke('SendMessage', receiverId.value, message.value);
    message.value = '';
  } catch (err) {
    console.error('SendMessage error:', err);
  }
};

onMounted(() => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7282/chatHub`)
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveMessage', (msg) => {
    messages.value.push(msg);
  });

  connection.start()
    .then(() => console.log('SignalR Connected'))
    .catch(err => console.error('SignalR Connection Error:', err));
});

onBeforeUnmount(() => {
  if (connection) {
    connection.stop();
  }
});
</script>
