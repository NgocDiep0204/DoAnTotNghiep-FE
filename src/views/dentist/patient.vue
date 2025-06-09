<template>
  <div class="p-4">
    <h2 class="text-2xl font-semibold mb-4">Danh sách bệnh nhân</h2>

    <!-- Ô tìm kiếm -->
    <div class="mb-4 flex items-center">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Tìm theo tên hoặc email..."
        class="border px-3 py-2 rounded w-full max-w-md"
      />
    </div>

    <!-- Bảng danh sách -->
    <table class="w-full border text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2">Họ tên</th>
          <th class="border px-3 py-2">Email</th>
          <th class="border px-3 py-2">Tổng lịch hẹn</th>
          <th class="border px-3 py-2">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(patient, index) in paginatedPatients" :key="index">
          <td class="border px-3 py-2">{{ patient.fullName }}</td>
          <td class="border px-3 py-2">{{ patient.email }}</td>
          <td class="border px-3 py-2">{{ patient.totalCompletedAppointments }}</td>
          <td class="border px-3 py-2 space-x-2">
            <button @click="openDetail(patient)" class="bg-blue-500 text-white px-2 py-1 rounded">Chi tiết</button>
          </td>
        </tr>
        <tr v-if="paginatedPatients.length === 0">
          <td colspan="4" class="text-center text-gray-500 py-4">Không tìm thấy bệnh nhân.</td>
        </tr>
      </tbody>
    </table>

    <!-- Phân trang -->
    <PaginationComponent
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-changed="currentPage = $event"
      class="mt-4"
    />
    <patientdetail
      v-if="showdetail"
      :patient="selectPatient"
      @close="showdetail = false"
    />
  </div>
</template>

<script>
import { useServiceStore } from '../../store/service';
import { useDentistStore } from '../../store/dentist';
import { useAuthStore } from '../../store/user/authstore';
import PaginationComponent from '../../components/paginationcomponent.vue';
import patientdetail from './patientdetail.vue';

export default {
  data() {
    return {
      dentistid: null,
      allPatients: [],
      searchQuery: '',
      filteredPatients: [],
      currentPage: 1,
      pageSize: 5,
      searchDebounce: null,
      showdetail: false,
      selectPatient: null,
    }
  },
  components: {
    PaginationComponent,
    patientdetail,
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredPatients.length / this.pageSize) || 1;
    },
    paginatedPatients() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredPatients.slice(start, start + this.pageSize);
    },
  },
  async mounted() {
    const userid = useAuthStore().user.id;
    const dentist = await useDentistStore().getDentistByUserId(userid);
    this.dentistid = dentist.id;
    await this.fetchPatients();
  },
  methods: {
    openDetail(patient) {
      this.selectPatient = patient;
      this.showdetail = true;
    },
    async fetchPatients() {
      try {
        const response = await useServiceStore().GetPatientList(this.dentistid);
        this.allPatients = response;
        this.filteredPatients = response;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bệnh nhân:', error);
      }
    },
    handleSearch() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        const q = this.searchQuery.trim().toLowerCase();
        this.filteredPatients = this.allPatients.filter(p =>
          (p.fullName || '').toLowerCase().includes(q) ||
          (p.email || '').toLowerCase().includes(q)
        );
        this.currentPage = 1;
      }, 300); // debounce 300ms
    },
  },
}
</script>

<style scoped>
</style>
