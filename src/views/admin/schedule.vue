<template>
    <div class="flex">
      <!-- Phần hiển thị lịch bác sĩ -->
      <div class="w-1/2 p-4 border-r">
        <h2 class="text-xl font-bold mb-4">Lịch đã đăng ký</h2>
        <div v-if="appointments.length === 0" class="text-gray-500">Không có lịch hẹn nào.</div>
        <div v-for="appointment in appointments" :key="appointment.id" class="mb-2">
          <div class="flex items-center">
            <span class="font-semibold">{{ appointment.date }} - {{ appointment.time }}</span>
          </div>
        </div>
      </div>
  
      <!-- Phần xếp lịch -->
      <div class="w-1/2 p-4">
        <h2 class="text-xl font-bold mb-4">Xếp lịch mới</h2>
        <form @submit.prevent="scheduleAppointment" class="space-y-4">
          <div>
            <label for="date" class="block font-semibold">Chọn ngày</label>
            <input type="date" v-model="newAppointment.date" id="date" class="mt-1 block w-full p-2 border rounded" required />
          </div>
          <div>
            <label for="time" class="block font-semibold">Chọn giờ</label>
            <input type="time" v-model="newAppointment.time" id="time" class="mt-1 block w-full p-2 border rounded" required />
          </div>
          <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">Xếp lịch</button>
        </form>
      </div>
    </div>
  </template>
<script setup>
import { ref } from 'vue';

const appointments = ref([
  { id: 1, date: '2025-04-28', time: '09:00' },
  { id: 2, date: '2025-04-29', time: '14:00' },
]);

const newAppointment = ref({
  date: '',
  time: ''
});

const scheduleAppointment = () => {
  if (newAppointment.value.date && newAppointment.value.time) {
    appointments.value.push({
      id: appointments.value.length + 1,
      ...newAppointment.value
    });
    newAppointment.value.date = '';
    newAppointment.value.time = '';
  }
};
</script>
  