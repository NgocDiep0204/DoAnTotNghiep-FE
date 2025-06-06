<template>
 <AppointmentDetail 
  v-if="selectedAppointment" 
  :key="selectedAppointment.appointmentId"
  :appointment="selectedAppointment" 
  @close="selectedAppointment = null" 
/>
  
  <div v-else class="p-6 max-w-6xl mx-auto">
    <!-- Lịch hẹn theo ngày -->
    <h1 class="text-xl font-bold mb-4">Lịch hẹn ngày {{ formatDate(currentDate) }}</h1>
    <div class="mb-4 flex justify-between items-center">
      <button @click="changeDate(-1)" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">← Ngày trước</button>
      <button @click="changeDate(1)" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Ngày sau →</button>
    </div>

    <div class="mb-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
      <!-- Lọc trạng thái -->
      <div class="flex space-x-2">
        <button :class="[ 'px-4 py-2 rounded', statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300' ]" @click="statusFilter = ''">Tất cả</button>
        <button :class="[ 'px-4 py-2 rounded', statusFilter === '1' ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300' ]" @click="statusFilter = '1'">Đã xác nhận</button>
        <button :class="[ 'px-4 py-2 rounded', statusFilter === '2' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300' ]" @click="statusFilter = '2'">Hoàn thành</button>
      </div>
      <div class="w-full md:w-1/2">
        <input type="text" v-model="searchQuery" placeholder="Nhập tên, thời gian..." class="border p-2 rounded w-full" />
      </div>
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2 text-left">Tên khách hàng</th>
          <th class="border p-2 text-left">Thời gian</th>
          <th class="border p-2 text-left">Trạng thái</th>
          <th class="border p-2 text-center">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="appointment in paginatedDailyAppointments" :key="appointment.appointmentId" class="hover:bg-gray-50">
          <td class="border p-2">{{ appointment.customers?.fullName }}</td>
          <td class="border p-2">{{ appointment.appointmentDate?.replace('T', ' ') }}</td>
          <td class="border p-2">
            <span :class="{ 'text-yellow-600': appointment.status === 1, 'text-green-600': appointment.status === 2 }">
              {{ returnStringStatus(appointment.status) }}
            </span>
          </td>
          <td class="border p-2 text-center space-x-2">
            <button v-if="appointment.status != 2" @click="updateStatus(appointment.appointmentId, 2)" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-900">Hoàn thành</button>
            <button @click="selectedAppointment = appointment" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-900">Xem chi tiết</button>
          </td>
        </tr>
        <tr v-if="paginatedDailyAppointments.length === 0">
          <td colspan="4" class="text-center p-4 text-gray-500">Không có lịch hẹn trong ngày.</td>
        </tr>
      </tbody>

    </table>
          <div class="mt-2 text-right text-gray-600">Tổng lịch hẹn trong ngày: {{ filteredAppointments.length }}</div>

    <Pagination v-if="filteredAppointments.length > 0"
      :currentPage="dailyCurrentPage"
      :totalPages="dailyTotalPages"
      @change-page="handleChangeDailyPage"/>

    <!-- Toàn bộ lịch hẹn -->
    <h2 class="text-xl font-bold mt-12 mb-4">Toàn bộ lịch hẹn</h2>
    <div class="flex justify-between items-center mb-4">
      <input type="text" v-model="globalSearchQuery" placeholder="Tìm kiếm tên hoặc thời gian..." class="border p-2 rounded w-full md:w-1/2" />
    </div>

    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2 text-left">Tên khách hàng</th>
          <th class="border p-2 text-left">Thời gian</th>
          <th class="border p-2 text-left">Trạng thái</th>
          <th class="border p-2 text-center">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="appointment in paginatedGlobalAppointments" :key="appointment.appointmentId" class="hover:bg-gray-50">
          <td class="border p-2">{{ appointment.customers ? appointment.customers.fullName : ''  }}</td>
          <td class="border p-2">{{ appointment.appointmentDate?.replace('T', ' ') }}</td>
          <td class="border p-2">{{ returnStringStatus(appointment.status) }}</td>
          <td>
            <button v-if="appointment.status != 2" @click="updateStatus(appointment.appointmentId, 2)" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-900">Hoàn thành</button>
            <button @click="selectedAppointment = appointment" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-900">Xem chi tiết</button>
          </td>

        </tr>
        <tr v-if="filteredGlobalAppointments.length === 0">
          <td colspan="3" class="text-center p-4 text-gray-500">Không có lịch hẹn nào.</td>
        </tr>
      </tbody>
    </table>
    <div class="mt-2 text-right text-gray-600">Tổng số toàn bộ lịch hẹn: {{ filteredGlobalAppointments.length }}</div>

    <Pagination v-if="filteredGlobalAppointments.length > 0"
      :currentPage="globalCurrentPage"
      :totalPages="globalTotalPages"
      @change-page="handleChangeGlobalPage"
    />
  </div>
</template>

<script>
import { useServiceStore } from '../../store/service';
import { useDentistStore } from '../../store/dentist';
import {useAuthStore} from '../../store/user/authstore';
import { returnStringStatus } from '../../utils/returnString';
import AppointmentDetail from './appointmentdetail.vue';
import Pagination from '../../components/paginationcomponent.vue';


export default {
  components: {
    AppointmentDetail,
    Pagination
  },
  data() {
    return {
      currentDate: new Date(),
      appointments: [],
      update: {
        appointmentId: '',
        dentistId: '',
        status: '',
        dentistNotes: ''
      },
      searchQuery: '',
      statusFilter: '',
      selectedAppointment: null,
      globalSearchQuery: '',
      globalCurrentPage: 1,
      pageSize: 5,
      dailyCurrentPage: 1,
      dailyPageSize: 5,
      dentistId: '',
    };
  },
  computed: {
    useService() {
      return useServiceStore();
    },
    useDentist() {
      return useDentistStore();
    },
    useAuth() {
      return useAuthStore();
    },
   filteredAppointments() {
  const dateStr = this.currentDate.toLocaleDateString('sv-SE');
  return this.appointments.filter(a => {
    if (!a.appointmentDate || !a.customers || !a.customers.fullName) return false;

    const sameDate = a.appointmentDate.slice(0, 10) === dateStr;
    const query = this.searchQuery.toLowerCase().trim();
    const fullName = a.customers.fullName.toLowerCase();
    const time = a.appointmentDate.slice(11, 16);
    const statusText = this.returnStringStatus(a.status).toLowerCase();

    const matchQuery = query === '' || fullName.includes(query) || time.includes(query) || statusText.includes(query);
    const matchStatus = this.statusFilter !== '' ? a.status === Number(this.statusFilter) : true;

    return sameDate && matchQuery && matchStatus;
  });
},
  totalAppointments() {
    return this.filteredAppointments.length;
  },
  dailyTotalPages() {
    return Math.ceil(this.totalAppointments / this.dailyPageSize);
  },
  paginatedDailyAppointments() {
    const start = (this.dailyCurrentPage - 1) * this.dailyPageSize;
    return this.filteredAppointments.slice(start, start + this.dailyPageSize);
  },
   filteredGlobalAppointments() {
    const query = this.globalSearchQuery.toLowerCase().trim();
    return this.appointments.filter(a => {
      const fullName = a.customers?.fullName.toLowerCase();
      const time = (a.appointmentDate ? a.appointmentDate.replace('T', ' ') : '').toLowerCase();
      const statusText = this.returnStringStatus(a.status).toLowerCase();

      return query === '' || fullName.includes(query) || time.includes(query) || statusText.includes(query);
    });
  },
  globalTotalPages() {
    return Math.ceil(this.filteredGlobalAppointments.length / this.pageSize);
  },
  paginatedGlobalAppointments() {
    const start = (this.globalCurrentPage - 1) * this.pageSize;
    return this.filteredGlobalAppointments.slice(start, start + this.pageSize);
  },
    
  },
  async mounted() {
    var userid = this.useAuth.user.id;
    var dentist = await this.useDentist.getDentistByUserId(userid);
    this.dentistId = dentist.id;
    console.log('Dentist ID:', dentist.id);
    try {
      this.appointments = await this.useService.getAppointmentByDentist(this.dentistId);
      console.log('Appointments fetched:', this.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    console.log('Appointments:', this.appointments);
  },
  watch: {
  currentDate() {
    this.dailyCurrentPage = 1;
  },
  statusFilter() {
    this.dailyCurrentPage = 1;
  },
  searchQuery() {
    this.dailyCurrentPage = 1;
  },
   globalSearchQuery() {
    this.globalCurrentPage = 1;
  },
},
  methods: {
    
    returnStringStatus(status) {
      return returnStringStatus(status);
    },
    formatDate(date) {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    changeDate(days) {
      this.currentDate.setDate(this.currentDate.getDate() + days);
      this.currentDate = new Date(this.currentDate);
    },
    async updateStatus(id, newStatus) {
      const appointment = this.appointments.find(a => a.appointmentId === id);
      if (!appointment) return alert('Lịch hẹn không tồn tại.');
      if (appointment.status === 2) return alert("Lịch hẹn đã hoàn thành.");

      this.update = {
        appointmentId: id,
        status: Number(newStatus),
        dentistId: appointment.dentistId,
        dentistNotes: appointment.dentistNotes || ''
      };

      try {
        await this.useService.updateAppointment(this.update);
        alert('Cập nhật thành công!');
      this.appointments = await this.useService.getAppointmentByDentist(this.dentistId);
      } catch (err) {
        console.error(err);
        alert('Cập nhật thất bại!');
      }
    },
    handleChangeGlobalPage(newPage) {
      this.globalCurrentPage = newPage;
    },
    handleChangeDailyPage(newPage) {
    this.dailyCurrentPage = newPage;
  },
  changeDailyPage(page) {
    if (page >= 1 && page <= this.dailyTotalPages) {
      this.dailyCurrentPage = page;
    }
  },
  }
};
</script>
