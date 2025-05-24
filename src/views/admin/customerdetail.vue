<template>
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Chi tiết Khách hàng</h2>
        <div class="mb-2"><strong>ID:</strong> {{ user.id }}</div>
        <div class="mb-2"><strong>Họ tên:</strong> {{ user?.fullName }}</div>
        <div class="mb-2"><strong>Email:</strong> {{ user.email }}</div>
        <div class="mb-2"><strong>SĐT:</strong> {{ user.phoneNumber }}</div>
        <div class="mb-2"><strong>Quyền:</strong> {{ user.roles }}</div>
        <div class="mb-4"><strong>Trạng thái:</strong> {{ user.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}</div>
        <div class="text-right">
          <button @click="$emit('close')" class="bg-blue-500 text-white px-4 py-1 rounded">Đóng</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['user'])
  </script>
  