<template>
  <div class="p-4 max-w-6xl mx-auto bg-white shadow rounded-xl flex space-x-6">

    <!-- Phần đăng ký lịch làm việc (bên trái 2/3) -->
    <div class="w-2/3">
      <div class="flex justify-between items-center mb-4">
        <div class="text-2xl font-bold text-gray-700">
          Đăng ký thời gian làm việc
        </div>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow"
          @click="saveSchedule"
        >
          💾 Lưu dữ liệu
        </button>
      </div>

      <div class="flex items-center space-x-2 mb-4 text-lg font-medium text-gray-600">
        <button
          @click="changeMonth(-1)"
          class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          &#8592;
        </button>
        <span>Tháng {{ currentMonth + 1 }} / {{ currentYear }}</span>
        <button
          @click="changeMonth(1)"
          class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          &#8594;
        </button>
      </div>

      <ul class="space-y-2 border rounded-lg p-4 bg-white shadow max-h-[600px] overflow-y-auto">
        <li
          v-for="(day) in daysOfMonth"
          :key="day.date"
          :class="getDayClass(day) + ' flex flex-col p-3 rounded'"
        >
          <div class="font-semibold mb-1">
            {{ day.dayLabel }} ({{ getDayOfMonth(day.date) }})
          </div>

          <select
            v-model="day.status"
            class="border rounded px-2 py-1 w-full bg-white"
            @change="onStatusChange(day)"
          >
            <option value="OFF">OFF</option>
            <option value="Free">Free</option>
            <option value="Khung gio">Khung giờ làm</option>
          </select>

          <div
            v-if="day.status === 'Khung gio'"
            class="flex space-x-2 items-center mt-2"
          >
            <input
              type="time"
              v-model="day.startTime"
              class="border px-2 py-1 rounded w-1/2"
              :min="'08:00'"
              :max="'18:00'"
                @input="day.isModified = true"

            />
            <span>-</span>
            <input
              type="time"
              v-model="day.endTime"
              class="border px-2 py-1 rounded w-1/2"
              :min="'08:00'"
              :max="'18:00'"
                @input="day.isModified = true"

            />
          </div>
        </li>
      </ul>
    </div>

    <!-- Bên phải 1/3 -->
    <div
      class="w-1/3 mt-6 bg-gray-50 p-4 rounded-xl shadow-inner overflow-y-auto max-h-[600px]"
    >
      <h2 class="text-xl font-bold mb-4 text-gray-700">Lịch làm việc theo tuần</h2>
      <div
        v-for="week in groupedByWeek"
        :key="week.weekNumber"
        class="mb-4 border-b pb-2"
      >
        <h3 class="text-lg font-semibold text-gray-700 mb-2">
          Tuần {{ week.weekNumber }}
        </h3>
        <ul class="list-disc pl-6 text-sm text-gray-700">
          <li
            v-for="day in week.days"
            :key="day.date"
            class="mb-1"
          >
            {{ day.date }} ({{ day.dayLabel }}):
            <span v-if="day.status === 'OFF'" class="text-red-600 font-medium">OFF</span>
            <span v-else-if="day.status === 'Free'" class="text-green-600 font-medium">Free</span>
            <span v-else class="text-blue-600 font-medium">
              {{ day.startTime }} - {{ day.endTime }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axiosClient from '../../axiosClient';
import { useDentistStore } from '../../store/dentist';
import {useAuthStore} from '../../store/user/authstore';
export default {
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      daysOfMonth: [],
      dentistId: "", // TODO: thay id thật
      savedSchedules: [], // lưu dữ liệu đã load từ server
      availableMonths: []
    };
  },
  computed: {
    groupedByWeek() {
      const weeks = {};
      this.daysOfMonth.forEach((day) => {
        if (!weeks[day.weekOfYear]) {
          weeks[day.weekOfYear] = [];
        }
        weeks[day.weekOfYear].push(day);
      });
      return Object.keys(weeks).map((weekNumber) => ({
        weekNumber,
        days: weeks[weekNumber],
      }));
    },
  },
  methods: {
    getDayOfMonth(dateString) {
      return new Date(dateString).getDate();
    },
    getDayClass(day) {
      let baseClass = "p-2 rounded ";
      if (!day.belongsToMonth) {
        baseClass += "text-gray-400";
      } else {
        if (day.status === "Free") baseClass += "bg-green-50";
        else if (day.status === "OFF") baseClass += "bg-red-50";
        else if (day.status === "Khung gio") baseClass += "bg-blue-50";
      }
      return baseClass;
    },
    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return weekNo;
    },

async fetchSchedule() {
  try {
    var response = await axiosClient.get(`AppointmentSchedule/GetById?id=${this.dentistId}`);
    if (response.status !== 200) {
      this.generateDaysOfMonth([]);
      return;
    }
    var schedules = await response.data.$values;

    // Tạo monthsSet đúng cách
    var monthsSet = new Set(
      schedules.map(sch => {
        const d = new Date(sch.date);
        return `${d.getFullYear()}-${d.getMonth()}`;  // ví dụ: "2025-5"
      })
    );
    

    // Lọc lịch theo tháng và năm hiện tại
    var filteredSchedules = schedules.filter(sch => {
      const d = new Date(sch.date);
      return d.getFullYear() === this.currentYear && d.getMonth() === this.currentMonth;
    });
    console.log(schedules, 'dddddd,,,,,,,,,')
    this.savedSchedules = filteredSchedules;

    this.generateDaysOfMonth(filteredSchedules);
  } catch (error) {
    console.error("Lỗi khi load lịch làm việc:", error);
    this.generateDaysOfMonth([]);
  }
},


    generateDaysOfMonth(apiSchedules = []) {
      const days = [];
      const year = this.currentYear;
      const month = this.currentMonth;

      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

      const lastDayOfMonth = new Date(year, month + 1, 0);
      const totalDays = lastDayOfMonth.getDate();

      for (let day = 2;day <= totalDays + 1; day++) {
        const date = new Date(year, month, day);
        const jsDay = date.getDay();
        const dayOfWeek = jsDay === 0 ? 7 : jsDay;
        const dayLabel = dayNames[jsDay];

        const scheduleForDay = apiSchedules.find(sch => sch.date === date.toISOString().split("T")[0]);

        let status = "Free";
        let startTime = "08:00";
        let endTime = "18:00";

        if (scheduleForDay) {
          if (scheduleForDay.isDayOff) {
            status = "OFF";
          } else if (scheduleForDay.isFree) {
            status = "Free";
          } else {
            status = "Khung gio";
            startTime = scheduleForDay.startTime.substring(0, 5);
            endTime = scheduleForDay.endTime.substring(0, 5);
          }
        }

        days.push({
          id: scheduleForDay?.id || null,
          date: date.toISOString().split("T")[0],
          dayOfWeek,
          dayLabel,
          weekOfYear: this.getWeekNumber(date),
          status,
          startTime,
          endTime,
          belongsToMonth: true,
        });
      }

      this.daysOfMonth = days;
    },

    onStatusChange(day) {
      if (day.status !== "Khung gio") {
        day.startTime = "08:00";
        day.endTime = "18:00";
      }
        day.isModified = true; // đánh dấu đã chỉnh sửa

    },
changeMonth(delta) {
  let newMonth = this.currentMonth + delta;
  let newYear = this.currentYear;

  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }
    this.currentMonth = newMonth;
    this.currentYear = newYear;
    this.fetchSchedule();
},

async saveSchedule() {
  const dataToSave = this.daysOfMonth
    .filter(day => day.isModified)
    .map((day) => {
      let isFree = false;
      let isDayOff = false;

      if (day.status === "Free") {
        isFree = true;
      } else if (day.status === "OFF") {
        isDayOff = true;
      }

      return {
        date: day.date,
        isDayOff,
        isFree,
        startTime: day.startTime + ':00',
        endTime: day.endTime + ':00',
        id: day.id,
        dentistId: this.dentistId,
      };
    });

  const monthGroups = {};
  for (const item of dataToSave) {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthGroups[key]) monthGroups[key] = [];
    monthGroups[key].push(item);
  }

  try {
    for (const monthKey of Object.keys(monthGroups)) {
      const [year, month] = monthKey.split('-').map(Number);

      const anySchedule = monthGroups[monthKey].find(i => !i.id);

      if (anySchedule) {
        // Tạo tháng mới
        const res = await axiosClient.post('/AppointmentSchedule/CreateForMonth', {
          year,
          month,
          dentistId: this.dentistId
        });

        if (res.status !== 200) {
          alert(`Không thể tạo lịch cho tháng ${month}/${year}`);
          return;
        }

        return this.saveSchedule(); 
      }
    }

    // Tiếp tục update các ngày
    for (const i of dataToSave) {
      const response = await axiosClient.put('/AppointmentSchedule/Update', i);
      if (response.status !== 200) {
        alert('Lưu lịch thất bại! Vui lòng thử lại.');
        return;
      }
    }

    alert('Lưu lịch làm việc thành công!');
    this.fetchSchedule();

  } catch (err) {
    alert('Lỗi kết nối server khi lưu lịch!');
    console.error(err);
  }
}

},

  async mounted() {
    var userid = useAuthStore().user.id;
    var dentist = await useDentistStore().getDentistByUserId(userid);
    this.dentistId = dentist.id;
    this.fetchSchedule();
  },
};
</script>

<style scoped>
/* Bạn có thể bổ sung style cho list nếu muốn */
</style>
