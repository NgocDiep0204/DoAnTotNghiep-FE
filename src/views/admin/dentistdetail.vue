<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto"> <!-- 👈 Thêm max-h và overflow -->
      <h2 class="text-xl font-semibold mb-4">Chi tiết Nha sĩ</h2>
      <div class="mb-2"><strong>ID:</strong> {{ dentist.id }}</div>
      <div class="mb-2"><strong>Họ tên:</strong> {{ dentist.user?.fullName }}</div>
      <div class="mb-2"><strong>Email:</strong> {{ dentist.user?.email }}</div>
      <div class="mb-2"><strong>SĐT:</strong> {{ dentist.user?.phoneNumber }}</div>
      <div class="mb-2"><strong>Chuyên môn:</strong> {{ dentist.speacialty }}</div>
      <div class="mb-2"><strong>Hành nghề năm:</strong> {{ dentist.years }}</div>
      <div class="mb-2"><strong>Giới thiệu:</strong> {{ dentist.introduce }}</div>
      <div class="mb-2">
      <strong>Học vấn: </strong>
        <div v-for="(education, index) in splitCommaToArray(dentist.education)" :key="index">
        • {{ education }}
        </div>
      </div>
      <div class="mb-2">
      <strong>Chứng chỉ: </strong>
        <div v-for="(certificate, index) in splitCommaToArray(dentist.certificate)" :key="index">
        • {{ certificate }}
        </div>
      </div>
      <div class="mb-4"><strong>Trạng thái:</strong> {{ dentist.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}</div>
      <div class="text-right">
        <button @click="$emit('close')" class="bg-blue-500 text-white px-4 py-1 rounded">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { splitCommaToArray } from '../../utils/stringhelper.js';

defineProps(['dentist'])
</script>
