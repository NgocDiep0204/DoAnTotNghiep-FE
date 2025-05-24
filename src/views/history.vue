<template>
  <div class="p-6 max-w-4xl mx-auto">
    <statuscomponent @status-clicked="filterByStatus" class="mb-6" />

    <!-- Nếu chưa có lịch sử nào (tổng thể) -->
    <div v-if="!useService.appointments || useService.appointments.length === 0" class="text-gray-500">
      Chưa có lịch sử khám nào.
    </div>

    <div v-else-if="filteredAppointments.length === 0" class="text-gray-500 mt-6">
      Chưa có lịch sử khám nào.
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="(item, index) in filteredAppointments"
        :key="index"
        class="bg-white shadow rounded-2xl p-4 border border-gray-100"
      >
        <div class="flex justify-between items-center">
          <div>
            <p class="text-lg font-semibold text-blue-600">Ngày : {{ getDate(item.appointmentDate) }}</p>
            <p>Giờ: {{ getTime(item.appointmentDate) }}</p>
            <p class="text-gray-600">Bác sĩ: {{ item.dentistName }}</p>
            <p class="text-gray-500 italic mt-1">Dịch vụ khám: {{ item.serviceName }}</p>
          </div>
          <div class="text-right">
            <span
              class="px-3 py-1 rounded-full text-sm font-medium block mb-2"
              :class="{
                'bg-green-100 text-green-700': item.status === 0,
                'bg-yellow-100 text-yellow-700': item.status === 1,
                'bg-red-100 text-red-700': item.status === 2
              }"
            >
              {{ returnString(item.status) }}
            </span>
            <!-- Nút Hủy -->
            <button
              v-if="item.status === 0"
              @click="cancelAppointment(item.appointmentId, item.dentistId)"
              class="bg-red-400 hover:bg-red-600 text-black text-sm px-3 py-1 rounded-md"
            >
              Hủy lịch hẹn
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { useServiceStore } from '../store/service.js'
import { useAuthStore } from '../store/user/authstore'
import statuscomponent from '../components/statuscomponent.vue'
import { returnStringStatus } from '../utils/returnString.js';

export default {
  data() {
    return {
      img: "/src/assets/img/niengrang.jpg",
      showMenu: false,
      update: {
        appointmentId: null,
        dentistId: null,
        status: null,
      },
      selectedStatus: null, 
      filteredAppointments: [] 
    };
  },
  components: {
    statuscomponent,
  },
  computed: {
    useService() {
      return useServiceStore();
    },
    useUser() {
      return useAuthStore();
    },
   
  },
  mounted() {
    if (this.useUser.user) {
      this.getHistory();
    }
  },
  methods: {
    returnString(status) {
      return returnStringStatus(status);
    },
    
    async getHistory() {
      await this.useService.getAppointmentByUserId(this.useUser.user.id);
      this.filterAppointments(); // Lọc cuộc hẹn khi đã có dữ liệu
    },
    getDate(dateTime) {
      const date = new Date(dateTime);
      return date.toISOString().split("T")[0]; // yyyy-MM-dd
    },
    getTime(dateTime) {
      const date = new Date(dateTime);
      return date.toTimeString().split(" ")[0]; 
    },
    
    cancelAppointment(id, dentistId) {
      this.update.appointmentId = id;
      this.update.dentistId = dentistId;
      this.update.status = 3; // Trạng thái hủy
      if (confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
        this.useService.updateAppointment(this.update).then(() => {
          alert("Hủy lịch hẹn thành công!");
          this.getHistory(); // Cập nhật lại danh sách lịch sử khám
        }).catch((error) => {
          console.error("Lỗi khi hủy lịch hẹn:", error);
          alert("Có lỗi xảy ra khi hủy lịch hẹn.");
        });
      }
    },
    filterByStatus(statusId) {
      if (statusId === -1) {
        this.selectedStatus = null;
      } else {
        this.selectedStatus = statusId;
      }
      this.filterAppointments();
    },
    filterAppointments() {
      if (this.selectedStatus === null || this.selectedStatus === 4) {
        // Khi không có status được chọn, lấy tất cả cuộc hẹn
        this.filteredAppointments = this.useService.appointments;
      } else {
        // Khi có status, lọc theo status đó
        this.filteredAppointments = this.useService.appointments.filter(
          (item) => item.status === this.selectedStatus
        );
      }
    },
  },
};
</script>

<style scoped>
body {
  background-color: #f9fafb;
}
</style>
