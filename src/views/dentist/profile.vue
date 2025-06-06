<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center text-blue-700">Thông tin Nha sĩ</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Ảnh nha sĩ -->
      <div class="col-span-1 flex justify-center">
        <div class="bg-gray-100 rounded-xl overflow-hidden shadow-md p-4 w-full max-w-[250px]">
          <img
            :src="dentist.user?.imageUrl || 'https://via.placeholder.com/250x300?text=No+Image'"
            class="w-full h-72 object-cover rounded-lg mb-4 border"
            alt="Dentist Avatar"
          />
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-800">{{ dentist.user?.fullName }}</h3>
            <p class="text-sm text-gray-500">{{ dentist.postgraduates }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ calculateYearsExperience(dentist.years) }} năm kinh nghiệm</p>
          </div>
        </div>
      </div>

      <!-- Chi tiết nha sĩ -->
      <div class="col-span-2 space-y-3 text-gray-700 text-sm md:text-base leading-relaxed">
        <div><strong>ID:</strong> {{ dentist.id }}</div>
        <div><strong>Email:</strong> {{ dentist.user?.email }}</div>
        <div><strong>Năm hành nghề:</strong> {{ dentist.years }}</div>
        <div><strong>Giới thiệu:</strong>
          <p class="mt-1 text-justify">{{ dentist.introduce }}</p>
        </div>

        <div>
          <strong>Chuyên môn:</strong>
          <ul class="list-disc list-inside ml-4">
            <li v-for="(s, index) in splitCommaToArray(dentist.speacialty)" :key="'spec-' + index">{{ s }}</li>
          </ul>
        </div>

        <div>
          <strong>Học vấn:</strong>
          <ul class="list-disc list-inside ml-4">
            <li v-for="(edu, index) in splitCommaToArray(dentist.education)" :key="'edu-' + index">{{ edu }}</li>
          </ul>
        </div>

        <div>
          <strong>Chứng chỉ:</strong>
          <ul class="list-disc list-inside ml-4">
            <li v-for="(cert, index) in splitCommaToArray(dentist.certificate)" :key="'cert-' + index">{{ cert }}</li>
          </ul>
        </div>

        <div>
          <strong>Giá khám:</strong>
          <span class="text-blue-700 font-medium">{{ formatPrice(dentist.price) }}</span>
        </div>

        <div>
          <strong>Trạng thái:</strong>
          <span :class="dentist.status === 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
            {{ dentist.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDentistStore } from '../../store/dentist';
import {useAuthStore} from '../../store/user/authstore';
import {calculateYearsExperience, splitCommaToArray} from '../../utils/stringhelper';

export default {
  data() {
    return {
      dentist: '',
    }
  },
  computed: {
    dentistStore() {
      return useDentistStore();
    },
    useAuth() {
      return useAuthStore();
    },

  },
  methods: {
    calculateYearsExperience,
    splitCommaToArray,
    formatPrice(price) {
      if (!price || price <= 0) return 'Miễn phí';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
  },
  async mounted() {
    var userid = this.useAuth.user.id;
     this.dentist = await this.dentistStore.getDentistByUserId(userid);
  },
}
</script>
