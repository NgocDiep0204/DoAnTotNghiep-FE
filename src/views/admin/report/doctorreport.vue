 <template>
  <div class="max-w-5xl mx-auto p-4 bg-white shadow rounded-2xl">
    <h2 class="text-xl font-semibold text-center mb-6">Thống kê lịch hẹn theo bác sĩ</h2>

    <div v-if="usedDoctors.length!=0" class="w-full max-w-lg mx-auto">
    <h4 class="font-semibold text-gray-800 mb-2">Biểu đồ thống kê</h4>
       <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-center text-gray-500">Không có dữ liệu cho biểu đồ</p>

   

     <div v-if="usedDoctors.length" class="overflow-auto mt-6">
  <h4 class="font-semibold text-gray-800 mb-2">Chi tiết số liệu bác sĩ</h4>
  <table class="min-w-full border border-gray-300 text-sm text-left">
    <thead class="bg-gray-100">
      <tr>
        <th class="border px-4 py-2">#</th>
        <th class="border px-4 py-2">Tên bác sĩ</th>
        <th class="border px-4 py-2 text-green-700">Hoàn thành</th>
        <th class="border px-4 py-2 text-red-600">Đã huỷ</th>
        <th class="border px-4 py-2 text-blue-700">Tổng số</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(doctor, index) in usedDoctors" :key="'detail-'+index">
        <td class="border px-4 py-2">{{ index + 1 }}</td>
        <td class="border px-4 py-2">{{ doctor.doctorName }}</td>
        <td class="border px-4 py-2 text-green-700">{{ doctor.completed }}</td>
        <td class="border px-4 py-2 text-red-600">{{ doctor.cancelled }}</td>
        <td class="border px-4 py-2 text-blue-700 font-semibold">{{ doctor.totalAppointments }}</td>
      </tr>
    </tbody>
  </table>
</div>

<div>
  <h4 class="font-semibold text-gray-800 mb-2 mt-6">Bác sĩ chưa có lịch hẹn:</h4>
  <ul class="space-y-1 text-sm text-gray-600">
    <li v-if="!unusedDoctors.length">Không có bác sĩ nào chưa có lịch hẹn.</li>
    <li v-for="(doctor, index) in unusedDoctors" :key="'unused-'+index">
      {{ doctor.doctorName }}: 0 lịch hẹn
    </li>
  </ul>
</div>
    </div>

 

</template>

<script>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { defineProps } from 'vue'



import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import axiosClient from '../../../axiosClient'

// Đăng ký Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  components: {
    Bar
  },
  props: {
    filters: Object,
    trigger: Number
  },
  data() {
    return {
      chartData: null,
      selectedMonth: null,
      selectedYear: null,
      selectedYearOnly: null,
      yearOptions: [],
      usedDoctors: [],
      unusedDoctors: [],
      chartOptions: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    }
  },

  watch: {
  filters: {
    immediate: true,
    deep: true,
    handler() {
      //this.fetchData()
    }
  },
  trigger(newVal, oldVal) {
    this.fetchData()
  }
},
  methods: {
   
    async fetchData() {
      if (!this.filters) return; 
      try {
        this.chartData = null
        const queryParams = new URLSearchParams()
       // queryParams.append('year', this.filters.year)
         if (this.filters.from) {
          queryParams.append('from', this.filters.from);
          if (this.filters.to) {
            queryParams.append('to', this.filters.to);
          }
        } else {
          queryParams.append('year', this.filters.year);
          if (this.filters.month) {
            queryParams.append('month', this.filters.month);
          }
        }
        if (this.filters.month) queryParams.append('month', this.filters.month)
        if (this.filters.from && this.filters.to) {
          queryParams.append('from', this.filters.from)
          queryParams.append('to', this.filters.to)
        }
        const res = await axiosClient.get(`Report/GetByDoctor?${queryParams.toString()}`)
        const data = res.data.data.$values || []
        if (!data.length) {
          this.chartData = null
          return
        }

        this.usedDoctors = data.filter(s => s.totalAppointments > 0)
        this.unusedDoctors = data.filter(s => s.totalAppointments === 0)

        this.chartData = {
          labels: this.usedDoctors.map(d => d.doctorName),
          datasets: [
            {
              label: 'Hoàn thành',
              data: this.usedDoctors.map(d => d.completed),
              backgroundColor: 'rgba(34,197,94,0.7)'
            },
            {
              label: 'Đã hủy',
              data: this.usedDoctors.map(d => d.cancelled),
              backgroundColor: 'rgba(239,68,68,0.7)'
            },
            {
              label: 'Tổng số',
              data: this.usedDoctors.map(d => d.totalAppointments),
              backgroundColor: 'rgba(59,130,246,0.7)'
            }
          ]
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu API:', error)
      }
    },
    
  },
  mounted() {
     if (this.filters && this.filters.year) {
    this.fetchData()
  }
}
}
</script> 
