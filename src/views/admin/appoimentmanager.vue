  <template>
    <div v-if="useUser.user?.role !=='Admin'">
      <notrolecomponent />
    </div>
    <div v-else>
      <h1><strong>Quản lý lịch hẹn</strong></h1>

      <!-- Form tìm kiếm -->
      <div class="search-form">
    <input class="border rounded" v-model="searchDoctorName" placeholder="Tìm theo bác sĩ" />
    <input class="border rounded" v-model="searchCustomerName" placeholder="Tìm theo khách hàng" />
    <input class="border rounded" type="date" v-model="searchDate" placeholder="Chọn ngày" />

    <button class="m-2 border rounded bg-blue-500 text-white" @click="searchAppointments">Tìm kiếm</button>
    <button class="m-2 border rounded bg-gray-500 text-white" @click="clearSearch">Hủy tìm kiếm</button>
  </div>

  <statuscomponent @status-clicked="filterByStatus" class="mb-6" />


      <!-- Lịch hẹn -->
      <div>
        <table>
          <thead>
            <tr>
              <th>Bác sĩ</th>
              <th>Khách hàng</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in paginatedAppointment" :key="appointment.id">
              <td>{{ appointment.dentists?.user?.fullName || 'Chưa chọn' }}</td>
              <td>{{ appointment.customers.fullName }}</td>
              <td>{{ new Date(appointment.appointmentDate).toLocaleString() }}</td>
              <td class="p-2" :class="{
                'bg-green-100 text-green-700': appointment.status === 0,
                'bg-yellow-100 text-yellow-700': appointment.status === 1,
                'bg-red-100 text-red-700': appointment.status === 2
              }">
                {{ returnStatus(appointment.status) }}
              </td>
              <td>
                <button class="bg-gray-500 ml-2 text-white px-3 py-1 rounded hover:bg-gray-500" @click="click(appointment.appointmentId, 1, appointment.customers.email)">Xác nhận</button>
                <button class="bg-red-300 ml-2 text-white px-3 py-1 rounded hover:bg-red-400" @click="click(appointment.appointmentId, 3, appointment.customers.email)">Hủy</button>
                <button class="bg-stone-500 ml-2 text-white px-3 py-1 rounded hover:bg-stone-500" @click="viewDetail(appointment)">Chi tiết</button>
                <button v-if="!appointment.dentists" class="bg-blue-500 ml-2 text-white px-3 py-1 rounded hover:bg-blue-500" @click="chooseDentist(appointment.appointmentId)">Chọn nha sĩ</button>
              </td>
            </tr>
          <appoimentdetails v-if="showDetail" :appointment="selectedAppointment" @close="closeDetail" />
          </tbody>
        </table>
        <Pagination :currentPage="currentPage" :totalPages="totalPages" @change-page="changePage" />
      </div>
    </div>
    <!-- Modal chọn nha sĩ -->
<div
    v-if="showDentistModal"
    class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded shadow-lg w-1/3 text-gray-800 max-h-[80vh] flex flex-col">
      <h2 class="text-xl font-bold mb-4">Chọn nha sĩ</h2>

      <!-- Ô tìm kiếm -->
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Tìm theo tên..."
        class="mb-4 px-3 py-2 border rounded w-full text-sm focus:outline-none"
      />

      <!-- Danh sách nha sĩ có scroll -->
      <ul class="overflow-y-auto flex-1 pr-1">
        <li
          v-for="dentist in filteredDentists"
          :key="dentist.dentistId"
          class="mb-2"
        >
          <button
            class="w-full text-left p-2 border rounded hover:bg-gray-100 !text-black"
            @click="assignDentistToAppointment(dentist)"
          >
            {{ dentist.user?.fullName || 'Không có tên' }}
          </button>
        </li>
      </ul>

      <button
        class="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        @click="showDentistModal = false"
      >
        Đóng
      </button>
    </div>
  </div>


  </template>

  <script>
  import Pagination from '../../components/paginationcomponent.vue';
  import statuscomponent from '../../components/statuscomponent.vue';
  import appoimentdetails from './appointmentdetail.vue';
  import notrolecomponent from '../../components/notrolecomponent.vue';
  import { returnStringStatus } from '../../utils/returnString.js';
  import { useServiceStore } from '../../store/service.js';
  import { useAuthStore } from '../../store/user/authstore';
  import { useDentistStore } from '../../store/dentist.js';

  export default {
    data() {
    return {
      appointments: [],
      filteredResults: [],    // <-- Thêm biến lưu kết quả tìm kiếm
      loading: false,
      error: null,
      searchDoctorName: '',
      searchCustomerName: '',
      searchDate: '',
      selectedStatus: null,
      currentPage: 1,
      pageSize: 5,
      showDetail: false,
      selectedAppointment: null,
      showDentistModal: false,
      selectedAppointmentId: null,
      dentists: [],
       searchTerm: ''

    };
  },

    components: {
      Pagination,
      statuscomponent,
      appoimentdetails,
      notrolecomponent
    },
    mounted() {
      this.fetchAppointments();
    },
    computed: {
      useService() {
        return useServiceStore();
      },
      useUser() {
        return useAuthStore();
      },
      useDentist() {
        return useDentistStore();
      },
      paginatedAppointment() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredResults.slice(start, start + this.pageSize);
      },
      totalPages() {
        return Math.ceil(this.filteredResults.length / this.pageSize);
      },
      filteredDentists() {
    if (!this.searchTerm) {
      return this.dentists;
    }
    return this.dentists.filter(dentist => 
      (dentist.user?.fullName || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  },

    },
    methods: {
    returnStatus(status) {
      return returnStringStatus(status);
    },
    async fetchAppointments() {
      const res = await this.useService.getAppointments();
      this.appointments = res;
      this.filteredResults = res; // ban đầu lấy hết
      this.currentPage = 1;
    },
  
    searchAppointments() {
    this.filteredResults = this.appointments.filter((appointment) => {
      const matchDoctor = this.searchDoctorName
        ? (appointment.dentists?.user?.fullName || '').toLowerCase().includes(this.searchDoctorName.toLowerCase())
        : true;
      const matchCustomer = this.searchCustomerName
        ? (appointment.customers?.fullName || '').toLowerCase().includes(this.searchCustomerName.toLowerCase())
        : true;
      const matchDate = this.searchDate
        ? new Date(appointment.appointmentDate).toLocaleDateString() === new Date(this.searchDate).toLocaleDateString()
        : true;
      const matchStatus = this.selectedStatus !== null
        ? appointment.status === this.selectedStatus
        : true; // Kiểm tra trạng thái nếu có chọn

      return matchDoctor && matchCustomer && matchDate && matchStatus;
    });
    this.currentPage = 1; // Đặt lại trang về trang 1 sau mỗi lần tìm kiếm
  },

    clearSearch() {
      this.searchDoctorName = '';
      this.searchCustomerName = '';
      this.searchDate = '';
      this.selectedStatus = null;
      this.filteredResults = [...this.appointments];
      this.currentPage = 1;
    },
    filterByStatus(statusId) {
    if (statusId === -1 || statusId === 4) { // Trạng thái lọc không chọn
      this.selectedStatus = null;
    } else {
      this.selectedStatus = statusId;
    }
    this.searchAppointments(); // Gọi lại search để lọc theo trạng thái
  },
    changePage(newPage) {
      this.currentPage = newPage;
    },
    async click(id, status, email) {
    const appointment = this.appointments.find(a => a.appointmentId === id);
    if (!appointment) {
      alert("Không tìm thấy lịch hẹn.");
      return;
    }

    if (appointment.status === 3) {
      alert("Lịch hẹn đã bị hủy, không thể thay đổi trạng thái.");
      return;
    }
    if (appointment.status === 1) {
      alert("Lịch hẹn đã được xác nhận!");
      return;
    }

    if (appointment.status === 2) {
      alert("Lịch hẹn đã hoàn thành, không thể thay đổi trạng thái.");
      return;
    }

     const dentistId = appointment.dentistId; // Lấy dentistId nếu có

    if (!dentistId) {
      alert("Vui lòng chọn nha sĩ trước khi xác nhận lịch hẹn.");
      return;
    }

    const update = {
      appointmentId: id,
      dentistId: dentistId,
      status: status,
    };

     const emailType = status === 1 ? 0 : 1;

  const res = await this.useService.updateAppointment(update);
  if (res) {
    await this.fetchAppointments();
    const mailSent = await this.useService.sendMailToUser(email, id, emailType);
    if (mailSent) {
      alert("Cập nhật trạng thái thành công và đã gửi mail cho khách hàng");
    } else {
      alert("Cập nhật trạng thái thành công nhưng không gửi mail được cho khách hàng");
    }
  } else {
    alert("Cập nhật trạng thái thất bại");
  }
},
    viewDetail(appointment) {
      this.selectedAppointment = appointment;
      this.showDetail = true;
    },
    closeDetail() {
        this.selectedUser = null
        this.showDetail = false
      },
    async chooseDentist(appointmentId) {
      this.selectedAppointmentId = appointmentId;
      this.dentists = await this.useDentist.getdentists(); 
      this.showDentistModal = true;
    },

async assignDentistToAppointment(dentist) {
  const update = {
    appointmentId: this.selectedAppointmentId,
    dentistId: dentist.id,
    status: 0, 
  };
  console.log("update", update);
  const res = await this.useService.updateAppointment(update);
  if (res) {
    alert("Chọn nha sĩ thành công");
    this.showDentistModal = false;
    await this.fetchAppointments();
  } else {
    alert("Lỗi khi chọn nha sĩ");
  }
}


  }
  };
  </script>

  <style scoped>
  .search-form {
    margin-bottom: 20px;
  }
  .search-form input {
    margin-right: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  table, th, td {
    border: 1px solid #ddd;
  }
  th, td {
    padding: 10px;
    text-align: left;
  }
  button {
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }
  button:hover {
    background-color: darkred;
  }
  </style>
