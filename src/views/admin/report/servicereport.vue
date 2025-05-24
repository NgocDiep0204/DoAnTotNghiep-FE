<template>
  <div class="max-w-5xl mx-auto p-4 bg-white shadow rounded-2xl">
    <h2 class="text-xl font-semibold text-center mb-6">Thống kê dịch vụ được sử dụng</h2>
    <div v-if="usedServices.length!=0" class="w-full max-w-lg mx-auto">
    <div v-if="chartData && chartData.datasets && chartData.datasets.length" class="w-full max-w-lg mx-auto">
      <Pie :data="chartData" :key="JSON.stringify(chartData)" />
    </div>
    </div>
    <p v-else class="text-center text-gray-500">Không có dữ liệu cho biểu đồ</p>


    <div v-if="usedServices.length || unusedServices.length" class="mt-6">
      <div v-if="usedServices.length">
        <h4 class="font-semibold mb-2 text-green-700">Dịch vụ đã được sử dụng:</h4>
        <ul class="space-y-1 text-sm">
          <li v-for="(service, index) in usedServices" :key="index">
            <span
              v-if="chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].backgroundColor"
              class="inline-block w-3 h-3 rounded-full mr-2"
              :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
            ></span>
            <span
              v-else
              class="inline-block w-3 h-3 rounded-full mr-2"
              style="background-color: #ccc;"
            ></span>
            {{ service.serviceName }}: {{ service.totalUsed }} lượt
          </li>
        </ul>
      </div>

      <div class="mt-6">
        <h4 class="font-semibold mb-2 text-gray-500">Dịch vụ chưa được sử dụng:</h4>
        <ul class="space-y-1 text-sm text-gray-600">
          <li v-if="!unusedServices.length">Không có dịch vụ nào chưa được sử dụng.</li>
          <li v-for="(service, index) in unusedServices" :key="'unused-'+index">
            {{ service.serviceName }}: 0 lượt
          </li>
        </ul>
      </div>
    </div>

    <p v-if="usedServices.length==0 && unusedServices.length==0" class="text-center text-gray-500 mt-6">
      Không có dữ liệu
    </p>
  </div>
</template>



<script>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js'
import axiosClient from '../../../axiosClient'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

export default {
  name: 'ServiceReport',
  components: {
    Pie
  },
  props: {
    filters: Object,
    trigger: Number
  },
  data() {
    return {
      chartData: null,
      usedServices: [],
      unusedServices: [],
      lastTrigger: null
    }
  },
 watch: {
  filters: {
    immediate: true,
    deep: true,
    // handler() {
    //   this.fetchData()
    // }
  },
  trigger(newVal, oldVal) {
    this.fetchData()
  }
},
  methods: {
    async fetchData() {
      console.log("fetchData", this.filters)
      this.chartData = null

      if (!this.filters) return; 

      try {
        const queryParams = new URLSearchParams()
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
        console.log("ffff",queryParams.toString())
        const res = await axiosClient.get(`Report/GetByService?${queryParams.toString()}`)
        const result = res.data.data.$values || []
        if (result.length === 0) {
          this.chartData = null
          this.usedServices = []
          this.unusedServices = []
          return
        }console.log(result)
        this.usedServices = result.filter(s => s.totalUsed > 0)
        this.unusedServices = result.filter(s => s.totalUsed === 0)

        const labels = this.usedServices.map(s => s.serviceName)
        const data = this.usedServices.map(s => s.totalUsed)

        this.chartData = {
          labels,
          datasets: [
            {
              label: 'Số lần sử dụng',
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8',
                '#FFA07A', '#00CED1', '#FF8A65', '#9575CD', '#4DB6AC',
                '#7986CB', '#AED581', '#F06292', '#4FC3F7', '#FFD54F',
                '#81C784', '#DCE775', '#FFB74D', '#A1887F', '#90A4AE'
              ],
              data
            }
          ]
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu API:', error)
      }
    }
  },
  mounted() {
     if (this.filters) {
    this.fetchData()
  }
  }
}
</script>
