<template>
  <section class="bg-blue-100 py-10 h-[20%]">
    <div class=" mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <!-- Phần nội dung -->
      <div class="md:w-1/2 space-y-4">
        <h1 class="text-3xl md:text-4xl font-bold text-blue-900">Đội ngũ bác sĩ</h1>
        <p class="text-gray-700 text-base">
          Trang bao gồm tất cả các bác sĩ và trợ tá tại Nha khoa
        </p>
      </div>

      <!-- Ảnh bác sĩ -->
      <div class="md:w-1/2 relative">
        <img
          src="/src/assets/img/allbs.png"
          alt="Đội ngũ bác sĩ"
          class="w-[90%] object-contain pl-32"
        />

      </div>
    </div>
  </section>
  <div v-for="(item, index) in dentist" :key="index" class="max-w-6xl mx-auto p-1 bg-white shadow-md mb-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Nha sĩ {{ item.user?.fullName }}</h2>

    <!-- GRID 2 cột -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-[1px] items-stretch">
      <!-- Ảnh bác sĩ -->
      <div class="flex flex-col items-center text-center">
        <img
          :src="item.user?.imageUrl"
          alt="Ảnh bác sĩ"
          class="w-[90%] h-full max-h-[500px] object-cover "
        />
      </div>

      <!-- Thông tin -->
      <div class="flex flex-col justify-between space-y-[1px]">
        <!-- Học vấn -->
        <div class="bg-blue-50 p-4 w-full m-[1px] h-[130%]">
          <h3 class="font-semibold text-gray-800 mb-2">Học vấn và đào tạo</h3>
          <div v-for="(education, i) in getStringPart(item.education)" :key="i">
            <p class="text-sm text-gray-700">• {{ education }}</p>
          </div>
        </div>

        <!-- Chuyên môn và kinh nghiệm -->
        <div class="grid grid-cols-2 gap-[1px] text-sm text-white">
          <div class="bg-blue-900 p-4">
            <p><strong>Chuyên môn chính:</strong> {{ item.speacialty }}</p>
            <p v-if="item.postgraduates">
              <strong>Bằng cấp sau đại học:</strong> {{ item.postgraduates }}
            </p>
          </div>
          <div class="bg-blue-900 p-4">
            <p><strong>Kinh nghiệm:</strong> {{ getYearsExperience(item.years) }}</p>
            <p><strong>Giá khám:</strong> {{ formatPrice(item.price) }}</p>

          </div>
        </div>
      </div>
    </div>

    <!-- Giới thiệu -->
    <div class="mt-4">
      <p class="text-lg text-gray-900">{{ item.introduce }}</p>
    </div>
    <router-link
      class="inline-flex text-blue-600 hover:underline text-sm font-medium mt-3  cursor-pointer"
      :to="{ name: 'doctorprofile', params: { id: item.id } }"
      @click.native="selectedIndex = index"
    >
      Xem chi tiết nha sĩ
    </router-link>
  </div>
</template>

<script>
import { useDentistStore } from '../store/dentist.js'
import { useServiceStore } from '../store/service.js'
import { splitCommaToArray, calculateYearsExperience } from '../utils/stringhelper.js'

export default {
  data() {
    return {
      dentist: [],
      selectedIndex: 0,
    }
  },
  methods: {
    formatPrice(price) {
      if (!price) return 'Chưa cập nhật'
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
    },
    getStringPart(string) {
      return splitCommaToArray(string)
    },
    getYearsExperience(years) {
      return calculateYearsExperience(years)
    },
  },
  computed: {
    useDentist() {
      return useDentistStore()
    },
    useService() {
      return useServiceStore()
    },
  },
  async mounted() {
    var result = await   this.useDentist.getDentistbyStatus()
    this.dentist = result
    
    this.useService.getServiceByStatus(1)
    console.log('lll',this.dentist)
  },
}
</script>
