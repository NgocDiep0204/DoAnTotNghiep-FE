<template>
  <!-- Tiêu đề -->
<div class="flex flex-col md:flex-row items-center justify-center bg-blue-50 p-6 gap-4">
  <!-- Cột trái: Tiêu đề và mô tả -->
  <div class="w-full md:w-1/2 flex flex-col md:text-left px-4">
    <h1 class="text-3xl font-bold text-blue-900 mb-4">Đội ngũ bác sĩ</h1>
    <p class="text-gray-700 text-[20px]">
      Chúng tôi tự hào với đội ngũ bác sĩ giỏi chuyên môn, tận tâm và nhiều năm kinh nghiệm trong nghề.
    </p>
  </div>

  <!-- Cột phải: Ảnh nhóm bác sĩ -->
  <div class="w-full md:w-1/2 flex justify-center">
    <img src="/src/assets/img/allbs.png" alt="Đội ngũ bác sĩ" class="w-[60%] rounded-lg" />
  </div>
</div>

  <div class="space-y-6 p-6 bg-white shadow-lg overflow-hidden"
    v-for="doctor in useDentist.activeDentists"
    :key="doctor.id">

  <strong class="text-xl"> Bác sĩ {{doctor.user.fullName}}</strong>
    <div
      class="flex flex-col md:flex-row bg-blue-50"
    >
      <!-- Hình ảnh bác sĩ -->
      <img
        :src="doctor.user.imageUrl"
        alt="Ảnh bác sĩ"
        class="md:w-1/3 w-full object-cover h-full"
      />

      <!-- Thông tin bác sĩ -->
      <div class="flex-1  flex flex-col justify-between ">
        <!-- Học vấn -->
        <p class="text-sm text-gray-800 mb-4 p-6">
          <span class="text-gray-700">Học vấn và đào tạo:</span>
          <div v-for="(education, index) in getEducationPart(doctor.education)" :key="index">
            <strong class="mt-4">• {{ education }}</strong>
          </div>
        </p>

        <!-- Chuyên môn & Kinh nghiệm -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[1px] w-full bg-blue-50">
          <div class="bg-blue-900 p-6 text-sm">
            <span class="text-white " >Chuyên môn chính:</span><br />
            <strong class="text-white ">
              {{ doctor.speacialty }}
            </strong>
          </div>
          <div class="bg-blue-900 p-4 ">
            <span class="text-white text-sm">Kinh nghiệm:</span><br />
            <strong class="text-white text-sm">
              {{ getYearsExperience(doctor.years) }} năm
            </strong>
          </div>
        </div>
      </div>
      
    </div>
    <!-- Mô tả -->
        <p class="text-gray-700 text-sm mb-4">{{ doctor.introduce }}</p>
         <p
          @click="goToDetailDoctor(doctor.id)"
          class="inline-flex text-blue-600 hover:underline text-sm font-medium mt-3 block cursor-pointer"
        >
          Xem thêm chi tiết bác sĩ
  </p>
  </div>
  
</template>

<script>
import { useDentistStore } from '../store/dentist.js';
import { splitCommaToArray, calculateYearsExperience } from '../utils/stringhelper.js';


 export default{
  data() {
    return{
      spealtypart: [],
      educationpart: [],
    }
  },
  computed:{
    useDentist() {
      return useDentistStore();
    },
  },
  methods:{
    getEducationPart(education) {
    return splitCommaToArray(education); 
  },
  getYearsExperience(years) {
    return calculateYearsExperience(years);   
  },
  goToDetailDoctor(doctorId) {
    this.$router.push({ name: 'doctorprofile', params: { id: doctorId } });
  }

  },
  mounted() {
    this.useDentist.getDentistbyStatus();
  },
 }

</script>
