<template>
  <div>
        <!-- Nút đóng -->
        <button @click="showModal = false" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold">
          &times;
        </button>

        <h2 class="text-center text-xl font-bold mb-6">ĐẶT LỊCH TÁI KHÁM</h2>

        <!-- Chọn ngày và bác sĩ -->
        <div class="flex gap-4 mb-4">
          <input type="date" v-model="selectedDate" class="border p-2 rounded w-full" />
          <input type="text" :value="selectedDoctor" placeholder="Nhập tên bác sĩ" class="border p-2 rounded w-full" disabled/>
        </div>

        <!-- Danh sách khung giờ -->
        <div class="grid grid-cols-4 gap-2 mb-4">
          <button
            v-for="time in availableTimes"
            :key="time"
            :class="[ 'p-2 rounded text-center',
                      selectedTime === time ? 'bg-blue-700 text-white' : 'border',
                      isDisabled(time) ? 'opacity-50 cursor-not-allowed' : '' ]"
            :disabled="isDisabled(time)"
            @click="selectedTime = time"
          >
            {{ time }}
          </button>
        </div>

        <!-- Ghi chú -->
        <textarea v-model="dentistNotes" placeholder="Ghi chú" class="border p-2 rounded w-full mb-4"></textarea>

        <!-- Nút đặt lịch -->
        <button class="bg-blue-700 text-white py-2 px-4 rounded w-full flex items-center justify-center" @click="bookAppointment">
          📅 Đặt lịch hẹn!
        </button>
      </div>
</template>

<script>
import { useServiceStore } from '../../store/service.js';
import { useAuthStore } from '../../store/user/authstore'
import { useDentistStore } from '../../store/dentist.js';

export default {
  data() {
    return {
      dentists : [],
      selectedDate: new Date().toISOString().split('T')[0],
      selectedDoctor: '',
      selectedService: '',
      selectedTime: '',
      note: '',
      bookedTimes: [],
      availableTimes: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', 
      ],
      appointments: {
        customerid: "",
        dentistid: "",
        appointmentdate: "",
        status: 1,
        note: "",
        dentistNotes: "",
        type: 1
      },
      appointmentDetail:{
        appointmentId: "",
        serviceId: "",
      }
    };
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
    }
    
  },
  watch: {
    selectedDoctor: 'handleDoctorOrDateChange',
    selectedDate: 'handleDoctorOrDateChange'
  },
  mounted() {
    this.useService.getServices();
    this.getdata();
    this.handleDoctorOrDateChange(); 
  },
  methods: {
    async getdata(){
      const res = await this.useDentist.getdentists();
      this.dentists = res;
      console.log("ddddd",this.dentists);
    },

    isPastTime(time) {
      const now = new Date();
      const selected = new Date(this.selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      selected.setHours(hours, minutes, 0, 0);
      return selected < now;
    },
    isBookedTime(time) {
      return this.bookedTimes.includes(time);
    },
    isDisabled(time) {
      return this.isPastTime(time) || this.isBookedTime(time);
    },
    async handleDoctorOrDateChange() {
      if (!this.selectedDoctor || !this.selectedDate) return;

      try {
        const response = await this.useService.getAppoinetmentTimeById(this.selectedDoctor);
        const appointments = response || [];

        const sameDay = appointments.filter(item =>
          item.startsWith(this.selectedDate)
        );

        this.bookedTimes = sameDay.map(item => {
          const time = new Date(item);
          const hh = String(time.getHours()).padStart(2, '0');
          const mm = String(time.getMinutes()).padStart(2, '0');
          return `${hh}:${mm}`;
        });
      } catch (err) {
        console.error('Lỗi khi lấy thời gian đã đặt:', err);
      }
    },
   bookAppointment() {
  if (!this.selectedDate || !this.selectedTime) {
    alert('Vui lòng chọn ngày và giờ hẹn!');
    return;
  }

  this.appointments.customerid = this.useUser.user.id;
  this.appointments.dentistid = this.selectedDoctor || null; // Cho phép không chọn bác sĩ
  this.appointments.appointmentdate = `${this.selectedDate}T${this.selectedTime}:00`;
  this.appointments.note = this.note;

  console.log("apo", this.appointments);

  this.useService.createAppointment(this.appointments)
    .then((response) => {
      if (this.selectedService) {
        this.appointmentDetail.serviceId = this.selectedService;
        this.appointmentDetail.appointmentId = response;
        this.useService.createAppointmentDetail(this.appointmentDetail)
          .then(() => {
            alert('Đặt lịch thành công!');
          })
          .catch(err => {
            console.error('Lỗi khi tạo chi tiết lịch:', err);
          });
      } else {
        alert('Đặt lịch thành công! (Không có dịch vụ cụ thể)');
      }

      this.selectedDate = new Date().toISOString().split('T')[0];
      this.selectedDoctor = '';
      this.selectedService = '';
    })
    .catch(err => {
      console.error('Lỗi khi đặt lịch:', err);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    });
}
  }
};
</script>
