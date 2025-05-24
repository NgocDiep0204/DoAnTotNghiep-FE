<template class="bg-white">
  <div class="max-w-full mx-auto bg-white shadow-md overflow-hidden pl-8" v-if="dentist">
    <div class="md:flex gap-4">
      <!-- Ảnh và chuyên môn -->
      <div class="md:w-2/3">
        <strong class="text-xl text-gray-700 mb-3 block">Bác sĩ {{ dentist.user.fullName }}</strong>

        <!-- Hình ảnh không bị che mặt -->
        <div class="w-full max-h-[700px] overflow-hidden">
          <img
            class="w-full h-[700px] object-cover object-top"
            :src="dentist.user.imageUrl"
            alt="Bác sĩ"
          />
        </div>

        <!-- Thông tin dưới ảnh -->
        <div class="bg-blue-900 text-white p-4 flex justify-start gap-x-8">
          <div class="flex flex-col text-left w-1/2">
            <p class="text-sm">Chuyên môn chính:</p>
            <p class="font-bold text-sm">{{ dentist.speacialty }}</p>
          </div>
          <div class="flex flex-col text-left w-1/2">
            <p class="text-sm">Kinh nghiệm:</p>
            <p class="font-bold text-sm">{{ getYearsExperience(dentist.years) }}</p>
          </div>
        </div>
      </div>

      <!-- Dịch vụ nổi bật + Quote -->
      <div class="md:w-1/3 pr-8">
        <div class="w-full max-w-md mx-auto bg-white">
          <h2 class="font-bold text-gray-800 text-base mb-4 border-b pb-2">Dịch vụ nổi bật</h2>

          <div v-for="(service, index) in useService.services.slice(0, 6)" :key="index">
            <div
              @click="selectedIndex = index"
              class="flex justify-between items-center px-4 py-3 cursor-pointer transition-colors duration-200 mb-2 
                bg-[#F5F5F5] hover:bg-blue-900 hover:text-white"
            >
              <span class="text-sm font-medium">{{ service.serviceName }}</span>
              <span class="text-xl font-bold">+</span>
            </div>
          </div>
        </div>

        <!-- Quote truyền cảm hứng -->
        <div class="p-10 bg-blue-900 shadow text-white mt-6 self-start">
          <p class="text-2xl font-semibold leading-relaxed">
            Hãy trở thành<br />
            phiên bản hoàn<br />
            hảo nhất của <br />
            chính mình
          </p>
          <router-link
            class="inline-flex text-white hover:underline text-sm font-medium mt-3 block cursor-pointer"
            :to="{ name: 'bookdoctors' }"
          >
            Đặt lịch tư vấn
          </router-link>
        </div>
      </div>
    </div>

    <!-- Giới thiệu + Học vấn + Chứng chỉ -->
    <div class="flex flex-col my-5 md:flex-row gap-4">
      <div class="md:w-2/3">
        <strong class="text-blue-900 pb-4">Giới thiệu</strong><br />
        <p class="p-2">{{ dentist.introduce }}</p>

        <strong class="text-blue-900 pb-4">Học vấn và đào tạo</strong><br />
        <div v-for="(education, index) in getStringPart(dentist.education)" :key="index">
          <p class="p-2">• {{ education }}</p>
        </div>

        <strong class="text-blue-900 pb-4">Chứng chỉ</strong><br />
        <div v-for="(certificate, index) in getStringPart(dentist.certificate)" :key="index">
          <p class="p-2">• {{ certificate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDentistStore } from '../store/dentist.js'
import { useServiceStore } from '../store/service.js'
import { splitCommaToArray, calculateYearsExperience } from '../utils/stringhelper.js'

export default {
  data() {
    return {
      dentist: null,
      selectedIndex: 0,
    }
  },
  methods: {
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
  mounted() {
    this.useDentist.getdentistbyid(this.$route.params.id).then((res) => {
      this.dentist = res
    })
    this.useService.getServiceByStatus(1)
  },
}
</script>
