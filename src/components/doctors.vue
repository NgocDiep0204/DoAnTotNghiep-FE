<template>
  <div class="relative bg-white py-8 px-4">
    <swiper
      :modules="[Autoplay]"
      :autoplay="{ delay: 2500, disableOnInteraction: false }"
      :slides-per-view="1"
      :space-between="20"
      :breakpoints="{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 }
      }"
      loop
      class="max-w-7xl mx-auto"
    >
    <swiper-slide
  v-for="doctor in doctors"
  :key="doctor.id"
  class="text-center p-4 rounded-lg transition duration-300 hover:bg-gray-100 cursor-pointer"
>
  <div class="overflow-hidden rounded-lg">
    <img
      :src="doctor.user.imageUrl"
      class="rounded-lg shadow-lg w-full h-auto mb-2 transition-transform duration-300 hover:scale-110"
    />
  </div>
  <div class="bg-yellow-500 text-white py-2 rounded font-semibold">
    BS. {{ doctor.user.fullName }}
  </div>
</swiper-slide>

    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

defineProps({
  doctors: {
    type: Array,
    required: true
  }
});
</script>
