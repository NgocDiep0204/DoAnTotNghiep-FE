<template>
  <div class="p-4 max-w-6xl mx-auto bg-white shadow rounded-xl flex space-x-6">
    <!-- Khung đăng ký lịch (bên trái 2/3) -->
    <div class="w-2/3">
      <div class="flex justify-between items-center mb-4">
        <div class="text-2xl font-bold text-gray-700">Đăng ký thời gian làm việc</div>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow"
          @click="saveSchedule"
        >
          💾 Lưu dữ liệu
        </button>
      </div>

      <div class="flex items-center space-x-2 mb-4 text-lg font-medium text-gray-600">
        <button @click="changeMonth(-1)" class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">&#8592;</button>
        <span>Tháng {{ currentMonth + 1 }} / {{ currentYear }}</span>
        <button @click="changeMonth(1)" class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">&#8594;</button>
      </div>

      <div class="rounded-lg overflow-hidden border">
        <div
          v-for="(day, index) in daysOfMonth"
          :key="index"
          class="flex items-center px-4 py-2 border-b last:border-b-0"
          :class="{
            'bg-green-50': day.status === 'Free',
            'bg-red-50': day.status === 'OFF',
            'bg-blue-50': day.status === 'Khung gio'
          }"
        >
          <div class="w-14 font-semibold text-gray-700">T{{ day.dayOfWeek }}</div>

          <div class="w-36">
            <select v-model="day.status" class="border rounded px-2 py-1 w-full bg-white" @change="onStatusChange(day)">
              <option value="OFF">OFF</option>
              <option value="Free">Free</option>
              <option value="Khung gio">Khung giờ làm</option>
            </select>
          </div>

          <div v-if="day.status === 'Khung gio'" class="flex space-x-1 items-center ml-4">
            <input
              type="time"
              v-model="day.startTime"
              class="border px-2 py-1 rounded"
              :min="'08:00'"
              :max="'18:00'"
            />
            <span>-</span>
            <input
              type="time"
              v-model="day.endTime"
              class="border px-2 py-1 rounded"
              :min="'08:00'"
              :max="'18:00'"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="w-1/3 mt-6 bg-gray-50 p-4 rounded-xl shadow-inner overflow-y-auto max-h-[600px]">
      <div v-for="(week, index) in groupedByWeek" :key="index" class="mb-4">
        <h3 class="text-lg font-bold mb-2 text-gray-700">Tuần {{ index + 1 }}</h3>
        <ul class="list-disc pl-6 text-sm text-gray-700">
          <li v-for="day in week" :key="day.date" class="mb-1">
            {{ day.date }} (T{{ day.dayOfWeek }}):
            <span v-if="day.status === 'OFF'" class="text-red-600 font-medium">OFF</span>
            <span v-else-if="day.status === 'Free'" class="text-green-600 font-medium">Free</span>
            <span v-else class="text-blue-600 font-medium">{{ day.startTime }} - {{ day.endTime }}</span>
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
      const weeks = [];
      let currentWeek = [];
      this.daysOfMonth.forEach((day, idx) => {
        currentWeek.push(day);
        if ((idx + 1) % 7 === 0 || idx === this.daysOfMonth.length - 1) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });
      return weeks;
    },
  },
  methods: {
    generateDaysOfMonth() {
      const days = [];
      const date = new Date(this.currentYear, this.currentMonth, 1);
      while (date.getMonth() === this.currentMonth) {
        days.push({
          date: date.toISOString().split("T")[0],
          dayOfWeek: (date.getDay() + 6) % 7 + 2,
          status: "Free",
          startTime: "08:00",
          endTime: "13:00",
        });
        date.setDate(date.getDate() + 1);
      }
      this.daysOfMonth = days;
    },

    changeMonth(amount) {
      this.currentMonth += amount;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.generateDaysOfMonth();
    },

    parseTime(t) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    },

    checkWorkingHours(day) {
      const start = this.parseTime(day.startTime);
      const end = this.parseTime(day.endTime);

      if (start < this.parseTime("08:00") || end > this.parseTime("18:00")) {
        alert(`Ngày ${day.date}: Giờ làm phải nằm trong khoảng 08:00 đến 18:00!`);
        return false;
      }

      const workingMinutes = end - start;
      const totalMinutes = 10 * 60; // 8h-18h = 600 phút
      const restMinutes = totalMinutes - workingMinutes;

      if (workingMinutes < 5 * 60) {
        alert(`Ngày ${day.date}: Phải làm tối thiểu 5 tiếng/ngày!`);
        return false;
      }
      if (restMinutes > 5 * 60) {
        alert(`Ngày ${day.date}: Không được nghỉ quá 5 tiếng trong khung 8h-18h!`);
        return false;
      }
      return true;
    },

    checkWeekOffRules() {
      const weeks = this.groupedByWeek;
      for (let i = 0; i < weeks.length; i++) {
        const week = weeks[i];
        let offCount = 0;
        week.forEach(day => {
          if (day.status === "OFF") offCount++;
        });
        if (offCount > 2) {
          alert(`Tuần ${i + 1}: Không được nghỉ quá 2 buổi/tuần!`);
          return false;
        }
        const sat = week.find(d => d.dayOfWeek === 7);
        const sun = week.find(d => d.dayOfWeek === 8);
        if (sat && sun && sat.status === "OFF" && sun.status === "OFF") {
          alert(`Tuần ${i + 1}: Không được nghỉ cả 2 buổi cuối tuần!`);
          return false;
        }
      }
      return true;
    },

    onStatusChange(day) {
      if (day.status !== "Khung gio") {
        day.startTime = "08:00";
        day.endTime = "13:00";
      }
    },

    saveSchedule() {
      for (const day of this.daysOfMonth) {
        if (day.status === "Khung gio") {
          if (!this.checkWorkingHours(day)) return;
        }
      }
      if (!this.checkWeekOffRules()) return;

      alert("Lưu lịch làm việc thành công!");
      console.log("Dữ liệu lưu:", this.daysOfMonth);
    },
  },

  mounted() {
    this.generateDaysOfMonth();
  },
};
</script>

<style scoped>
select {
  background-color: white;
}
</style>
