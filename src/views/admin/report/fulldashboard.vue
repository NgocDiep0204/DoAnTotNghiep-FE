<template>
   <div v-if="useUser.user?.role !=='Admin'">
      <notrolecomponent />
    </div>
  <div v-else class="p-6 space-y-6">
    <h1 class="text-3xl font-bold mb-4">📊 Báo cáo tổng hợp lịch hẹn</h1>
     <div class="flex flex-wrap gap-4 items-end">
      <div>
        <label class="block text-sm">Năm</label>
        <input type="number" v-model="filters.year" class="border p-2 rounded w-32" />
      </div>
      <div>
        <label class="block text-sm">Tháng</label>
        <select v-model="filters.month" class="border p-2 rounded w-32">
          <option value="">-- Chọn tháng --</option>
          <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <span class="text-gray-500">Hoặc</span>

      <div>
        <label class="block text-sm">Từ ngày</label>
        <input type="date" v-model="filters.from" class="border p-2 rounded" />
      </div>
      <div>
        <label class="block text-sm">Đến ngày</label>
        <input type="date" v-model="filters.to" class="border p-2 rounded" />
      </div>

      <button @click="onFilter" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Lọc
      </button>
    </div>

      <OverviewReport :filters="filters" :trigger="trigger" />
      <DoctorReport :filters="filters" :trigger="trigger" />
      <ServiceReport :filters="filters" :trigger="trigger" />


    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    </div>
  </div>
</template>

<script setup>
import OverviewReport from './overviewreport.vue'
import DoctorReport from './doctorreport.vue'
import ServiceReport from './servicereport.vue'
import notrolecomponent from '../../../components/notrolecomponent.vue'
import { useAuthStore } from '../../../store/user/authstore'
import { ref, watch } from 'vue'

const useUser = useAuthStore()

const filters = ref({
  year: new Date().getFullYear(),
  month: '',
  from: '',
  to: ''
})

const trigger = ref(0)

// Watch year and month: nếu có dữ liệu thì reset from/to
watch(() => [filters.value.year, filters.value.month], ([newYear, newMonth]) => {
  if (newYear || newMonth) {
    filters.value.from = ''
    filters.value.to = ''
  }
})

// Watch from and to: nếu có dữ liệu thì reset year/month
watch(() => [filters.value.from, filters.value.to], ([newFrom, newTo]) => {
  if (newFrom || newTo) {
    filters.value.year = ''
    filters.value.month = ''
  }
})

function onFilter() {
  if ((filters.value.from && !filters.value.to) || (!filters.value.from && filters.value.to)) {
    alert('Vui lòng chọn cả "Từ ngày" và "Đến ngày".')
    return
  }

  if (filters.value.from && filters.value.to) {
    if (new Date(filters.value.from) > new Date(filters.value.to)) {
      alert('"Từ ngày" không được lớn hơn "Đến ngày".')
      return
    }
  }

  if (!filters.value.year && !filters.value.month && !filters.value.from && !filters.value.to) {
    alert('Vui lòng nhập điều kiện lọc.')
    return
  }

  trigger.value++
}
</script>
