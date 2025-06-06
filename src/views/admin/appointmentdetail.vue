<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="relative bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl space-y-6">
      <!-- Nút đóng (icon ×) -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl leading-none focus:outline-none"
      >
        &times;
      </button>

      <!-- Tiêu đề -->
      <h2 class="text-2xl font-bold text-center text-gray-800">Chi tiết Khách hàng</h2>

      <!-- Nội dung -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
        <div class="border-b pb-2"><span class="font-medium">ID:</span> {{ appointment.appointmentId }}</div>
        <div class="border-b pb-2"><span class="font-medium">Nha sĩ:</span> {{ appointment.dentists?.user?.fullName }}</div>
        <div class="border-b pb-2"><span class="font-medium">Khách hàng:</span> {{ appointment.customers.fullName }}</div>
        <div class="border-b pb-2"><span class="font-medium">Ngày:</span> {{ appointment.appointmentDate?.replace('T', ' ')  }}</div>
        <div class="sm:col-span-2 border-b pb-2">
          <span class="font-medium">Dịch vụ:</span>
          {{ appointment.appointmentDetails?.$values.map(d => d.services?.serviceName).join(', ') }}
        </div>
        <div class="sm:col-span-2 border-b pb-2">
          <span class="font-medium">Trạng thái:</span> {{ returnStringStatus(appointment.status) }}
        </div>
        <div class="sm:col-span-2 border-b pb-2">
          <span class="font-medium">Ghi chú:</span> {{ appointment.note || 'Không có ghi chú' }}
        </div>
      </div>

      <!-- Nút đóng -->
      <div class="text-center">
        <button
          @click="$emit('close')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition duration-200"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { returnStringStatus } from '../../utils/returnString.js'
defineProps(['appointment'])
</script>
