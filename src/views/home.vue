<template>
  <div>
    <!-- Banner -->
    <banner />

    <!-- About Section -->
    <section class="bg-white py-16">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h2 class="text-xl font-bold text-blue-800 mb-4">Về phòng khám của chúng tôi</h2>
        <p class="text-gray-600 text-base">
          Chúng tôi tự hào mang đến dịch vụ nha khoa chất lượng cao, kết hợp giữa công nghệ hiện đại và đội ngũ bác sĩ tận tâm để mang lại nụ cười tự tin cho bạn.
        </p>
      </div>
    </section>

    <!-- Services Section -->
  <section class="bg-white py-12 px-4 relative">
  <!-- Nền xanh 1/8 phần dưới của Service -->
  <div class="absolute bottom-0 left-0 w-full h-[15%] bg-gradient-to-r from-blue-900 via-blue-900 to-blue-900 z-0"></div>
  
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start relative z-10">
    <!-- Tiêu đề -->
    <div class="flex flex-col justify-center h-full">
      <h2 class="text-xl font-bold text-gray-800 leading-snug">Dịch vụ từ tâm cho</h2>
      <h2 class="text-2xl font-bold text-blue-600 leading-snug mb-4">trải nghiệm xứng tầm</h2>
      <router-link :to="{ name: 'service' }" class="inline-flex text-blue-600 hover:underline text-sm font-medium">
        Xem thêm dịch vụ
      </router-link>
    </div>

    <!-- Danh sách dịch vụ -->
    <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(service, index) in useService?.services.slice(0, 6)"
        :key="index"
        class="flex flex-col items-center rounded-2xl px-6 py-6 text-center shadow-md transition duration-300 ease-in-out bg-white hover:bg-blue-800"
      >
        <img :src="getIcon(index)" alt="icon" class="w-16 h-16 mb-4" />
        <div class="text-xl font-semibold text-black">
          {{ service.serviceName }}
        </div>
      </div>
    </div>
  </div>
</section>


  <div class="bg-gradient-to-r from-blue-900 via-blue-900 to-blue-900 py-10 h-96">
  <div class="max-w-6xl mx-auto px-4 text-center flex flex-col md:flex-row items-center justify-center">
    <!-- Tiêu đề bên trái -->
    <div class="text-left md:w-1/2 mb-6 md:mb-0">
      <h2 class="text-xl font-extrabold text-white mb-2 tracking-wide drop-shadow">
        Tại sao chọn chúng tôi?
      </h2>
      <p class="text-gray-100 text-sm text-base max-w-2xl mx-auto mb-6">
        Chúng tôi cam kết mang đến dịch vụ nha khoa tốt nhất với công nghệ tiên tiến và đội ngũ bác sĩ chuyên nghiệp.
      </p>
    </div>

    <!-- Slogan bên phải -->
    <div class="relative flex justify-center items-center md:w-1/2  md:mt-0">
      <img class="rounded-xl w-[80%]" :src="imgUrl" alt="rangdep" />
    </div>
  </div>
</div>






    <!-- Doctors Section -->
     <section class="bg-white py-10 px-4">
      <div class="relative max-w-6xl mx-auto">
        <div class="text-left mb-6">
          <p class="text-xl font-bold text-gray-800">Đội ngũ bác sĩ chuyên nghiệp</p>
          <p class="text-gray-600 mt-2">An tâm đồng hành cùng dội ngũ bác sĩ chuyên môn cao cùng nhiều năm kinh nghiệm</p>
        </div>

        <doctors :doctors="useDentist.activeDentists" />

        <router-link
          :to="{ name: 'doctorspage' }"
          class="inline-flex text-blue-600 hover:underline text-sm font-medium mt-3 block"
        >
          Xem thêm chi tiết
        </router-link>
      </div>
    </section> 

    <aboutdentistry />

    <!-- Testimonials -->
    <customercomment/>

    <!-- Gallery -->
    <imagecomponent />
    <!-- Call To Action -->
    <section class="bg-blue-900 py-12 text-white text-center">
      <h2 class="text-3xl font-bold">Sẵn sàng để chăm sóc nụ cười của bạn?</h2>
      <p class="mt-2 mb-4">Hãy đặt lịch hẹn với bác sĩ của chúng tôi ngay hôm nay!</p>
      <router-link
        to="/dat-lich-hen"
        class="inline-block bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
      >
        Đặt lịch hẹn
      </router-link>
    </section>
  </div>
</template>

<script>
import banner from '../components/banner.vue';
import { useDentistStore } from '../store/dentist.js';
import { useServiceStore } from '../store/service.js';
import doctors from '../components/doctors.vue';
import aboutdentistry from './aboutdentistry.vue';
import customercomment from './customercomment.vue';
import imagecomponent from './image.vue'

export default {
  components: {
    banner,
    doctors,
    aboutdentistry,
    customercomment,
    imagecomponent,
  },
  data() {
    return {
      imgUrl: 'src/assets/img/rangdep.jpg',
    };
  },
  computed: {
    useDentist() {
      return useDentistStore();
    },
    useService() {
      return useServiceStore();
    },
  },
  mounted() {
    this.useDentist.getdentists();
    this.useService.getServiceByStatus(1);
    this.useDentist.getDentistbyStatus();
  },
  methods: {
    getIcon(index) {
      const images = [
        '/src/assets/img/ivi.png',
        '/src/assets/img/macai.png',
        '/src/assets/img/nhorang.png',
        '/src/assets/img/rangxu.png',
        '/src/assets/img/Taytang.png',
        '/src/assets/img/Impalnt.png',
      ];
      return images[index % images.length];
    },
  },
};
</script>
