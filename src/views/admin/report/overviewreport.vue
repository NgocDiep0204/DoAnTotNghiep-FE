 <template>
  <div class="max-w-5xl mx-auto p-4 bg-white shadow rounded-2xl">
      <h2 class="text-xl font-semibold text-center mb-6">Thống kê lịch hẹn</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-gray-100 p-4 rounded shadow text-center">
        <p class="text-gray-600">Tổng số</p>
        <p class="text-2xl font-bold">{{ overview.total }}</p>
      </div>
      <div class="bg-yellow-100 p-4 rounded shadow text-center">
        <p class="text-gray-600">Đang chờ</p>
        <p class="text-2xl font-bold">{{ overview.pending }}</p>
      </div>
      <div class="bg-green-100 p-4 rounded shadow text-center">
        <p class="text-gray-600">Đã xác nhận</p>
        <p class="text-2xl font-bold">{{ overview.confirmed }}</p>
      </div>
      <div class="bg-red-100 p-4 rounded shadow text-center">
        <p class="text-gray-600">Đã huỷ</p>
        <p class="text-2xl font-bold">{{ overview.cancelled }}</p>
      </div>
    </div>

    <apexchart
      width="100%"
      type="bar"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import axiosClient from '../../../axiosClient'
import ApexChart from 'vue3-apexcharts'
import { defineProps } from 'vue'


const props = defineProps({
  filters: Object,
  trigger: Number
})

watch(
  () => props.trigger,
  (newTrigger) => {
    if (newTrigger) {
      fetchData()
    }
  }
)
 


const chartOptions = ref({
  chart: {
    id: 'appointments-chart'
  },
  xaxis: {
    categories: []
  },
  title: {
    text: 'Biểu đồ lịch hẹn theo ngày',
    align: 'center'
  }
})
const overview = ref({
  total: 0,
  pending: 0,
  confirmed: 0,
  cancelled: 0,
  completed: 0
})
const chartSeries = ref([])

const fetchData = async () => {
  if (!props.filters) return; 

  try {
    const queryParams = new URLSearchParams()
        if (props.filters.from) {
          queryParams.append('from', props.filters.from);
          if (props.  filters.to) {
            queryParams.append('to', props.filters.to);
          }
        } else {
          queryParams.append('year', props.filters.year);
          if (props.filters.month) {
            queryParams.append('month', props.filters.month);
          }
        }

    const res = await axiosClient.get(`Report/GetOverviewAppointment?${queryParams.toString()}`)
    console.log('res', res)
    overview.value = res.data.overview
    const stats = res.data.statistics.$values || []

    chartOptions.value.xaxis.categories = stats.map(s => s.date)
    chartSeries.value = [
      { name: 'Tổng', data: stats.map(s => s.total) },
      { name: 'Xác nhận', data: stats.map(s => s.confirmed) },
      { name: 'Huỷ', data: stats.map(s => s.cancelled) }
    ]
  } catch (err) {
    console.error('Lỗi khi gọi API', err)
  }
}

fetchData()
onMounted(() => {
  if (props.filters) {
    fetchData()
  }
})

</script>

<style scoped>
input,
select {
  min-width: 120px;
}
</style> 