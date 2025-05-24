<template>
  <div class="relative bg-white py-8 px-4">
    <h2 class="text-2xl font-bold mb-6">Đánh giá của khách hàng</h2>
    <swiper
      :modules="[Autoplay, Pagination]"
      :autoplay="{ delay: 2500, disableOnInteraction: false }"
      :slides-per-view="1"
      :space-between="20"
      :breakpoints="{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 }
      }"
      :pagination="{ clickable: true }"
      loop
      class="max-w-7xl mx-auto"
    >
      <swiper-slide
  v-for="(comment, index) in customerComments"
  :key="index"
  class="bg-gray-50 p-4  rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-center"
>
  <img
    :src="comment.imageUrl"
    alt="Avatar"
    class="w-16 h-16 rounded-full mb-3 border-2 border-yellow-400 object-cover"
  />
  <div class="text-yellow-500 text-lg mb-2">
    <span v-for="n in comment.rating" :key="n">★</span>
    <span v-for="n in 5 - comment.rating" :key="n + 'o'" class="text-gray-300">★</span>
  </div>
  <p class="text-gray-800 italic mb-4 px-2">"{{ comment.comment }}"</p>
  <div class="font-semibold text-blue-600">- {{ comment.name }}</div>
</swiper-slide>

    </swiper>
  </div>
</template>
<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const customerComments = [
  {
    name: 'Nguyễn Văn A',
    comment: 'Dịch vụ rất tốt, bác sĩ nhiệt tình và chu đáo.',
    rating: 5,
    imageUrl: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Trần Thị B',
    comment: 'Phòng khám sạch sẽ, nhân viên thân thiện.',
    rating: 4,
    imageUrl: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Lê Văn C',
    comment: 'Tôi rất hài lòng với kết quả điều trị.',
    rating: 5,
    imageUrl: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'Phạm Thị D',
    comment: 'Giá cả hợp lý, dịch vụ chuyên nghiệp.',
    rating: 4,
    imageUrl: 'https://i.pravatar.cc/150?img=4',
  },
  {
    name: 'Nguyễn Văn E',
    comment: 'Tôi sẽ giới thiệu phòng khám này cho bạn bè.',
    rating: 5,
    imageUrl: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'Trần Thị F',
    comment: 'Đội ngũ bác sĩ rất tận tâm và chuyên nghiệp.',
    rating: 5,
    imageUrl: 'https://i.pravatar.cc/150?img=6',
  },
];
</script>