<template>
  <div class="relative bg-white py-8 px-4">
    <h2 class="text-xl font-bold mb-6">Hình ảnh phòng khám</h2>
    <swiper
      :modules="[Autoplay, Pagination]"
      :autoplay="{ delay: 2500, disableOnInteraction: false }"
      :slides-per-view="4"
      :space-between="20"
      :pagination="{ clickable: true }"
      loop
      class="max-w-7xl mx-auto"
    >
      <swiper-slide
        v-for="(image, index) in clinicImages"
        :key="index"
        class="flex justify-center"
      >
        <img
          :src="image"
          alt="Clinic Image"
          class="rounded-lg shadow-md object-cover h-60 w-full"
        />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const clinicImages = [
  './src/assets/img/phongkham1.jpg',
  './src/assets/img/phongkham2.jpg',
  './src/assets/img/phongkham3.jpg',
  './src/assets/img/phongkham4.jpg',
  './src/assets/img/phongkham5.jpg',
  './src/assets/img/phongkham6.jpg'
];
</script>
