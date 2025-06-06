<template>
  <div class="p-4 max-w-3xl mx-auto">
    <!-- Component lọc trạng thái -->
    <statuscomponent @status-clicked="filterByStatus" class="mb-4" />

    <!-- Không có lịch sử -->
    <div v-if="!useService.appointments || useService.appointments.length === 0" class="text-center py-10">
      <p class="text-lg text-gray-500">Bạn chưa có lịch sử khám.</p>
    </div>

    <!-- Không tìm thấy lịch phù hợp -->
    <div v-else-if="filteredAppointments.length === 0" class="text-center py-10">
      <p class="text-lg text-gray-500">Không tìm thấy lịch theo trạng thái đã chọn.</p>
    </div>

    <!-- Danh sách lịch khám -->
    <div v-else class="space-y-4">
      <div
        v-for="(item, index) in filteredAppointments"
        :key="index"
        class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition duration-300 p-4"
      >
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Thông tin chung -->
          <div class="space-y-1 text-gray-700 text-sm">
            <p><span class="font-medium text-gray-900">Ngày:</span> {{ getDate(item.appointmentDate) }}</p>
            <p><span class="font-medium text-gray-900">Giờ:</span> {{ getTime(item.appointmentDate) }}</p>
            <p><span class="font-medium text-gray-900">Bác sĩ:</span> {{ item.dentists.user.fullName }}</p>
            <p v-if="item.notes"><span class="font-medium text-gray-900">Ghi chú của bạn:</span> {{ item.notes }}</p>
            <p v-if="item.dentistNotes"><span class="font-medium text-gray-900">Ghi chú nha sĩ:</span> {{ item.dentistNotes }}</p>
            
          </div>

          <!-- Dịch vụ, trạng thái và nút -->
          <div class="space-y-2 text-sm">
            <div>
              <p class="font-medium text-gray-900 mb-1">Dịch vụ:</p>
              <ul class="list-disc list-inside text-gray-700 space-y-0.5">
                <li v-for="(service, i) in item.appointmentDetails.$values" :key="i">{{ service.services.serviceName }}</li>
              </ul>
            </div>

            <div class="flex items-center gap-3 mt-3 flex-wrap">
              <span
                class="px-3 py-0.5 text-xs rounded-full font-medium capitalize"
                :class="{
                  'bg-green-100 text-green-600': item.status === 0,
                  'bg-yellow-100 text-yellow-600': item.status === 1,
                  'bg-red-100 text-red-600': item.status === 2,
                  'bg-gray-200 text-gray-600': item.status === 3
                }"
              >
                {{ returnString(item.status) }}
              </span>

              <button
                v-if="item.status === 0"
                @click="cancelAppointment(item.appointmentId, item.dentistId)"
                class="text-xs px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition"
              >
                Hủy lịch
              </button>
            </div>
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
