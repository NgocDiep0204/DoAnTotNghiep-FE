<template>
  <div class="p-4 max-w-6xl mx-auto bg-white shadow rounded-xl flex space-x-6">

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
            :disabled="day.disabled"
            class="border rounded px-2 py-1 w-full bg-white"
            @change="onStatusChange(day)"
          >
            <option value="OFF">OFF</option>
            <option value="Free">Free</option>
            <option value="WorkingShift">Ca làm việc</option>
          </select>


          <!-- <div
            v-if="day.status === 'WorkingShift'"
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
          </div> -->

          <div
            v-if="day.status === 'WorkingShift'"
            class="flex space-x-2 items-center mt-2"
          >
            <select
              v-model="day.shift"
              @change="updateShiftTime(day)"
              class="border px-2 py-1 rounded w-full"
              :disabled="day.disabled"
            >
              <option disabled value="">Chọn ca làm việc</option>
              <option value="morning">Ca sáng (08:00 - 11:00)</option>
              <option value="afternoon">Ca chiều (13:00 - 18:00)</option>
            </select>

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
import { useServiceStore } from '../../store/service';
export default {
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      daysOfMonth: [],
      dentistId: "", 
      savedSchedules: [], 
      availableMonths: [],
      unavailableTimes: [],
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
  watch: {
  currentMonth() {
    this.fetchSchedule();
  },
  currentYear() {
    this.fetchSchedule();
  }
},

  methods: {

   validateWeeklyScheduleRules() {
  const errors = [];
  const weeks = {};

  this.daysOfMonth.forEach((day) => {
    const week = day.weekOfYear;
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(day);
  });

  for (const [weekNumber, days] of Object.entries(weeks)) {
    const offDays = days.filter(d => d.status === 'OFF');
    const workingShifts = days.filter(d => d.status === 'WorkingShift' && d.shift); // phải có ca

    const saturday = days.find(d => d.dayOfWeek === 6 && d.status === 'OFF');
    const sunday = days.find(d => d.dayOfWeek === 7 && d.status === 'OFF');

    const numOffDays = offDays.length;

    const numOffShifts = workingShifts.filter(w => w.shift === '').length + offDays.reduce((count, d) => count + 2, 0);

    if (numOffDays > 2) {
      errors.push(`Tuần ${weekNumber} nghỉ quá 2 ngày.`);
    }

    if (numOffShifts > 4) {
      errors.push(`Tuần ${weekNumber} nghỉ quá 4 ca.`);
    }

    if (saturday && sunday) {
      errors.push(`Tuần ${weekNumber} không được nghỉ cả Thứ 7 và Chủ nhật.`);
    }

    if (numOffDays === 1 && numOffShifts > 2) {
      errors.push(`Tuần ${weekNumber} đã nghỉ 1 ngày thì chỉ được nghỉ thêm tối đa 2 ca.`);
    }

    // ✅ Bổ sung: kiểm tra số ngày đăng ký có ca
    const workingShiftDays = days.filter(d => d.status === 'WorkingShift' && d.shift).length;

    if (numOffDays === 1 && workingShiftDays > 2) {
      errors.push(`Tuần ${weekNumber} đã nghỉ 1 ngày thì chỉ được đăng ký làm có ca tối đa 2 ngày.`);
    }

    if (numOffDays === 0 && workingShiftDays > 4) {
      errors.push(`Tuần ${weekNumber} không được đăng ký làm có ca quá 4 ngày.`);
    }
  }

  return errors;
},
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
        else if (day.status === "WorkingShift") baseClass += "bg-blue-50";
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

         const today = new Date();
today.setHours(0, 0, 0, 0); // đặt về 0h để so sánh chính xác
const isPast = date <= today;

  
        let status = "Free";
        let startTime = "08:00";
        let endTime = "18:00";
        let shift = "";

        if (scheduleForDay) {
  if (scheduleForDay.isDayOff) {
    status = "OFF";
  } else if (scheduleForDay.isFree) {
    status = "Free";
  } else {
    status = "WorkingShift";
    startTime = scheduleForDay.startTime.substring(0, 5);
    endTime = scheduleForDay.endTime.substring(0, 5);

    // Suy ra shift
    if (startTime === "08:00" && endTime === "11:00") {
      shift = "morning";
    } else if (startTime === "13:00" && endTime === "18:00") {
      shift = "afternoon";
    }
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
          shift,
          belongsToMonth: true,
          disabled: isPast, 

        });
      }

      this.daysOfMonth = days;
    },

    onStatusChange(day) {
      if (day.status !== "WorkingShift") {
        day.startTime = "08:00";
        day.endTime = "18:00";
      }
        day.isModified = true; 
    },
    updateShiftTime(day) {
  if (day.shift === "morning") {
    day.startTime = "08:00";
    day.endTime = "11:00";
  } else if (day.shift === "afternoon") {
    day.startTime = "13:00";
    day.endTime = "18:00";
  }
  day.isModified = true; // đánh dấu để lưu
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
    const errors = this.validateWeeklyScheduleRules();
  if (errors.length > 0) {
    alert("Lỗi đăng ký lịch:\n" + errors.join("\n"));
    return;
  }


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
        status: day.status,
        oldStatus: day.oldStatus
      };
    });

  const formatDate = (dateStr) => new Date(dateStr).toISOString().split('T')[0];
const getTime = (dateStr) => new Date(dateStr).toTimeString().substring(0, 5);

for (const item of dataToSave) {
  const itemDate = formatDate(item.date);
  const sameDayAppointments = this.unavailableTimes
    .filter(u => formatDate(u) === itemDate)
    .map(u => getTime(u));

  const hasMorning = sameDayAppointments.some(t => t >= "08:00" && t < "12:00");
  const hasAfternoon = sameDayAppointments.some(t => t >= "13:00" && t < "17:00");

  const isSwitchingToOff = item.status === "OFF" && item.oldStatus !== "OFF";
  if (isSwitchingToOff && (hasMorning || hasAfternoon)) {
    alert(`Ngày ${itemDate} đã có lịch hẹn. Không thể chọn OFF.`);
    return;
  }

  const isShift = item.status === "WorkingShift";
  const isMorningShift = item.startTime < "12:00:00";
  const isAfternoonShift = item.startTime >= "13:00:00";

  if (isShift) {
    if ( isAfternoonShift && hasMorning) {
      alert(`Ngày ${itemDate} đã có lịch hẹn buổi sáng. Vui lòng chọn lại.`);
      return;
    }
    if (isMorningShift && hasAfternoon) {
      alert(`Ngày ${itemDate} đã có lịch hẹn buổi chiều. Vui lòng chọn lại.`);
      return;
    }
  }
}


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
        const res = await axiosClient.post('/AppointmentSchedule/CreateForMonth', {
          year,
          month,
          dentistId: this.dentistId
        });

        if (res.status !== 200) {
          alert(`Không thể tạo lịch cho tháng ${month}/${year}`);
          return;
        }

        return this.saveSchedule(); // Gọi lại sau khi tạo tháng
      }
    }

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
    this.unavailableTimes = await useServiceStore().getAppoinetmentTimeById(this.dentistId);
    console.log(this.unavailableTimes, 'unavailableTimes');

  },
};
</script>

<style scoped>
/* Bạn có thể bổ sung style cho list nếu muốn */
</style>
