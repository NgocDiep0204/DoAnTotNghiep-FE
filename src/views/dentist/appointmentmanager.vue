<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Quản lý lịch hẹn ngày {{ formatDate(currentDate) }}</h1>
    
    <div class="mb-4 flex justify-between items-center">
      <button 
        @click="changeDate(-1)" 
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Ngày trước
      </button>
      <button 
        @click="changeDate(1)" 
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Ngày sau →
      </button>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left">Tên khách hàng</th>
          <th class="border border-gray-300 p-2 text-left">Thời gian</th>
          <th class="border border-gray-300 p-2 text-left">Trạng thái</th>
          <th class="border border-gray-300 p-2 text-center">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="appointment in filteredAppointments" :key="appointment.id" class="hover:bg-gray-50">
          <td class="border border-gray-300 p-2">{{ appointment.customerName }}</td>
          <td class="border border-gray-300 p-2">{{ appointment.time }}</td>
          <td class="border border-gray-300 p-2">
            <span 
              :class="{
                'text-yellow-600': appointment.status === 'Chờ duyệt',
                'text-green-600': appointment.status === 'Đã xác nhận',
                'text-red-600': appointment.status === 'Từ chối'
              }"
            >
              {{ appointment.status }}
            </span>
          </td>
          <td class="border border-gray-300 p-2 text-center space-x-2">
            <button 
              @click="updateStatus(appointment.id, 'Đã xác nhận')" 
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              :disabled="appointment.status !== 'Chờ duyệt'"
            >
              Xác nhận
            </button>
            <button 
              @click="updateStatus(appointment.id, 'Từ chối')" 
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              :disabled="appointment.status !== 'Chờ duyệt'"
            >
              Từ chối
            </button>
          </td>
        </tr>
        <tr v-if="filteredAppointments.length === 0">
          <td colspan="4" class="text-center p-4 text-gray-500">Không có lịch hẹn trong ngày.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: new Date(),
      appointments: [
        { id: 1, customerName: 'Nguyễn Văn A', time: '09:00', status: 'Chờ duyệt', date: '2025-05-23' },
        { id: 2, customerName: 'Trần Thị B', time: '11:00', status: 'Đã xác nhận', date: '2025-05-23' },
        { id: 3, customerName: 'Lê Văn C', time: '14:00', status: 'Chờ duyệt', date: '2025-05-24' },
      ],
    };
  },
  computed: {
    filteredAppointments() {
      const dateStr = this.currentDate.toISOString().slice(0, 10);
      return this.appointments.filter(a => a.date === dateStr);
    }
  },
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    changeDate(days) {
      this.currentDate.setDate(this.currentDate.getDate() + days);
      // force Vue update
      this.currentDate = new Date(this.currentDate);
    },
    updateStatus(id, newStatus) {
      const appt = this.appointments.find(a => a.id === id);
      if (appt && appt.status === 'Chờ duyệt') {
        appt.status = newStatus;
        alert(`Lịch hẹn của ${appt.customerName} đã được cập nhật: ${newStatus}`);
      }
    }
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
