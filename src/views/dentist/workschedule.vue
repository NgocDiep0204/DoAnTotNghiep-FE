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

  <!-- Chuyển từ grid sang ul/li -->
  <ul class="space-y-2 border rounded-lg p-4 bg-white shadow max-h-[600px] overflow-y-auto">
    <li
      v-for="(day, index) in daysOfMonth"
      :key="index"
      :class="getDayClass(day) + ' flex flex-col p-3 rounded'"
    >
      <div class="font-semibold mb-1">
        T{{ day.dayOfWeek }} ({{ getDayOfMonth(day.date) }})
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
        />
        <span>-</span>
        <input
          type="time"
          v-model="day.endTime"
          class="border px-2 py-1 rounded w-1/2"
          :min="'08:00'"
          :max="'18:00'"
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
            {{ day.date }} (T{{ day.dayOfWeek }}):
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
export default {
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      daysOfMonth: [],
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
    generateDaysOfMonth() {
  const days = [];
  const year = this.currentYear;
  const month = this.currentMonth;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    days.push({
      date: date.toISOString().split("T")[0],
      dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
      weekOfYear: this.getWeekNumber(date),
      status: "Free",
      startTime: "08:00",
      endTime: "13:00",
      belongsToMonth: true, // 💡 đánh dấu rõ ràng
    });
  }

  this.daysOfMonth = days;
},
    onStatusChange(day) {
      if (day.status !== "Khung gio") {
        day.startTime = "08:00";
        day.endTime = "13:00";
      }
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

      this.generateDaysOfMonth();
    },
    saveSchedule() {
      console.log("Dữ liệu lịch làm việc:", this.daysOfMonth);
      alert("Lưu dữ liệu thành công (chỉ ví dụ)!");
    },
  },
  mounted() {
    this.generateDaysOfMonth();
  },
};
</script>
