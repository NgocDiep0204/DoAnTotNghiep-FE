<template>
    <div class="flex justify-center items-center space-x-2 mt-4">
      <button
        @click="$emit('change-page', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        ◀
      </button>
  
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
  
      <button
        @click="$emit('change-page', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        ▶
      </button>
    </div>
  </template>
  
  <script setup>
  defineProps({
    currentPage: Number,
    totalPages: Number
  })
  
  defineEmits(['change-page'])
  </script>
    