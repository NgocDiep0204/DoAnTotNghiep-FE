<template>
  <div class="max-w-2xl mx-auto p-6 pt-10 m-10 bg-white shadow-lg rounded-lg">
    <strong>
      <h2 class="flex justify-center mb-10">ĐẶT LỊCH HẸN</h2>
    </strong>

    <!-- Chọn ngày và bác sĩ -->
    <div class="flex gap-4 mb-4">
      <input
        type="date"
        v-model="selectedDate"
        class="border p-2 rounded w-full"
      />

      <select v-model="selectedDoctor" class="border p-2 rounded w-full">
        <option value="" disabled>Chọn bác sĩ</option>
        <option v-for="dentist in dentists" :key="dentist.id" :value="dentist.id">
          BS. {{ dentist.user.fullName }}
        </option>
      </select>
    </div>

    <!-- Dịch vụ -->
    <select v-model="selectedService" class="border p-2 rounded w-full mb-4">
      <option value="" disabled>Chọn dịch vụ</option>
      <option
        v-for="service in useService.services"
        :key="service.serviceId"
        :value="service.serviceId"
      >
        {{ service.serviceName }}
      </option>
    </select>

    <!-- Danh sách khung giờ -->
    <div class="grid grid-cols-4 gap-2 mb-4">
      <button
        v-for="time in availableTimes"
        :key="time"
        :class="[
          'p-2 rounded text-center',
          selectedTime === time ? 'bg-blue-700 text-white' : 'border',
          isDisabled(time) ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :disabled="isDisabled(time)"
        @click="selectedTime = time"
      >
        {{ time }}
      </button>
    </div>

    <!-- Ghi chú -->
    <textarea
      v-model="note"
      placeholder="Ghi chú"
      class="border p-2 rounded w-full mb-4"
    ></textarea>

    <!-- Nút đặt lịch -->
    <button
      class="bg-blue-700 text-white py-2 px-4 rounded w-full flex items-center justify-center"
      @click="bookAppointment"
    >
      📅 Đặt lịch hẹn!
    </button>
  </div>
</template>

<script>
import { useServiceStore } from '../store/service.js';
import { useAuthStore } from '../store/user/authstore';
import { useDentistStore } from '../store/dentist.js';
import axiosClient from '../axiosClient'

export default {
  data() {
    return {
      dentists: [],
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
        note: "",
      },
      appointmentDetail: {
        appointmentId: "",
        serviceId: "",
      },
      workingSchedules: [], // Lịch làm việc của bác sĩ trong tháng
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
    async getdata() {
      const res = await this.useDentist.getdentists();
      this.dentists = res;
      console.log("Danh sách bác sĩ:", this.dentists);
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

    isWithinWorkingHours(time) {
  // Nếu không chọn bác sĩ => cho đặt bất kỳ khung giờ nào
  if (!this.selectedDoctor) return true;

  if (!this.workingSchedules.length) return false;

  // Tìm lịch làm việc của ngày được chọn
  const scheduleOfDay = this.workingSchedules.find(sch =>
    sch.date.startsWith(this.selectedDate)
  );

  // Không có lịch => không cho đặt
  if (!scheduleOfDay) return false;

  // Nếu ngày nghỉ cả ngày => không cho đặt bất kỳ khung giờ nào
  if (scheduleOfDay.isDayOff === true) return false;

  // Nếu không có giờ bắt đầu/kết thúc thì coi như nghỉ
  if (!scheduleOfDay.startTime || !scheduleOfDay.endTime) return false;

  // Kiểm tra xem thời gian có nằm trong khoảng làm việc không
  const [hour, minute] = time.split(':').map(Number);
  const [startHour, startMinute] = scheduleOfDay.startTime.split(':').map(Number);
  const [endHour, endMinute] = scheduleOfDay.endTime.split(':').map(Number);

  const timeValue = hour * 60 + minute;
  const startValue = startHour * 60 + startMinute;
  const endValue = endHour * 60 + endMinute;

  return timeValue >= startValue && timeValue <= endValue;
},

    isDisabled(time) {
      return this.isPastTime(time) || this.isBookedTime(time) || !this.isWithinWorkingHours(time);
    },

    async fetchSchedule() {
      if (!this.selectedDoctor) {
        this.workingSchedules = [];
        return;
      }
      try {
        const year = new Date(this.selectedDate).getFullYear();
        const month = new Date(this.selectedDate).getMonth();
        const response = await axiosClient.get(`AppointmentSchedule/GetById?id=${this.selectedDoctor}`);
        if (response.status !== 200) {
          this.workingSchedules = [];
          return;
        }
        const schedules = response.data.$values || [];

        // Lọc lịch của tháng hiện tại (năm + tháng)
        this.workingSchedules = schedules.filter(sch => {
          const d = new Date(sch.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });

        console.log("Lịch làm việc bác sĩ tháng:", this.workingSchedules);

      } catch (error) {
        console.error("Lỗi khi load lịch làm việc:", error);
        this.workingSchedules = [];
      }
    },

    async handleDoctorOrDateChange() {
      if (!this.selectedDoctor || !this.selectedDate) return;

      await this.fetchSchedule();

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

      console.log("Đặt lịch:", this.appointments);

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

          // Reset form
          this.selectedDate = new Date().toISOString().split('T')[0];
          this.selectedDoctor = '';
          this.selectedService = '';
          this.selectedTime = '';
          this.note = '';
          this.bookedTimes = [];
          this.workingSchedules = [];
        })
        .catch(err => {
          console.error('Lỗi khi đặt lịch:', err);
          alert('Có lỗi xảy ra, vui lòng thử lại!');
        });
    }
  }
};
</script>
