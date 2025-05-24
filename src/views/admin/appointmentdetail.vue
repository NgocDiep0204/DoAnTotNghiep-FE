<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Chi tiết Khách hàng</h2>
      <div class="mb-2"><strong>ID:</strong> {{ appointment.appointmentId }}</div>
      <div class="mb-2"><strong>Nha sĩ:</strong> {{ appointment.dentists?.user?.fullName }}</div>
      <div class="mb-2"><strong>Khách hàng:</strong> {{ appointment.customers.fullName }}</div>
      <div class="mb-2"><strong>Ngày:</strong> {{ appointment.appointmentDate }}</div>
      <div class="mb-2">
        <strong>Dịch vụ:</strong>
        {{ appointment.appointmentDetails?.$values.map(d => d.services?.serviceName).join(', ') }}
      </div>    
      <div class="mb-4"><strong>Trạng thái:</strong> {{ returnStringStatus(appointment.status) }}</div>
      <div class="mb-4"><strong>Ghi chú:</strong> {{ appointment.note }}</div>
      <div class="text-right">
        <button @click="$emit('close')" class="bg-blue-500 text-white px-4 py-1 rounded">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { returnStringStatus } from '../../utils/returnString.js'
defineProps(['appointment'])
</script>
