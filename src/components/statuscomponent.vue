<template>
    <div class="flex flex-wrap gap-4">
      <div
        v-for="status in appointmentStatusList"
        :key="status.id"
        @click="emitStatusClick(status.id)"
        class="px-3 py-1 rounded-xl font-semibold text-black border border-gray-300 cursor-pointer hover:bg-gray-100"
      >
        {{ status.label }} 
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        appointmentStatusList: [
          { id: 4, key: 'AllHistory', label: 'Tất cả lịch sử', color: 'gray-500' }, // <-- id = -1
          { id: 0, key: 'Pending', label: 'Chờ xác nhận', color: 'yellow-500' },
          { id: 1, key: 'Confirmed', label: 'Đã xác nhận', color: 'blue-500' },
          { id: 2, key: 'Completed', label: 'Hoàn thành', color: 'green-500' },
          { id: 3, key: 'Canceled', label: 'Đã hủy', color: 'red-500' },
        ]
      };
    },
    methods: {
      emitStatusClick(id) {
        this.$emit('status-clicked', id);
        console.log(`Status clicked: ${id}`);
      }
    }
  };
  </script>
  