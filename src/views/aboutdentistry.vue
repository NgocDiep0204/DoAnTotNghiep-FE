<template>
    <div class="relative h-screen w-full bg-white flex overflow-hidden">
      <!-- Ảnh nền thụt lùi bên phải -->
      <div
        class="absolute right-0 top-0 h-full w-[70%] bg-cover bg-center transition-all duration-500 rounded-l-2xl"
        :style="{ backgroundImage: activeIndex !== null ? `url(${cards[activeIndex].bg})` : 'none' }"
      ></div>
  
      <!-- Khối chữ bên trái lấn sang ảnh -->
      <div class="relative z-10 w-[60%] sm:w-[50%] md:w-[40%] lg:w-[35%] h-full bg-white/90 p-6 backdrop-blur-md shadow-2xl">
        <span class="text-gray-500 text-sm">Nha khoa Dental Clinic</span>
        <h2 class="text-xl font-bold text-blue-800 mb-4">
          Nơi trí tuệ và công nghệ cùng kết nối
        </h2>
  
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="(card, index) in cards"
            :key="index"
            @click="activeIndex = index"
            class="cursor-pointer p-4 rounded-lg border transition-all duration-300 text-sm"
            :class="{
              'bg-blue-800 text-white border-blue-800': activeIndex === index,
              'bg-white text-blue-800 hover:bg-blue-100': activeIndex !== index
            }"
          >
            <h3 class="font-semibold uppercase mb-1">{{ card.title }}</h3>
            <p class="text-xs">{{ card.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
    <script setup>
    import { ref } from 'vue'
  
    const activeIndex = ref(0)
  
    const cards = [
      {
        title: 'PHÒNG KHÁM HOẠT ĐỘNG 19 NĂM',
        description: 'Được thành lập từ 2006 với hơn 10.000 bệnh nhân mỗi năm.',
        bg: '/src/assets/img/giaithuong.png'
      },
      {
        title: 'CƠ SỞ VẬT CHẤT HIỆN ĐẠI',
        description: 'Trang bị máy móc như iTero Lumina hiện đại nhất thế giới.',
        bg: '/src/assets/img/tb.png'
      },
      {
        title: 'VẬT LIỆU CHÍNH HÃNG',
        description: 'Chỉ dùng mắc cài Ormco và khay Invisalign chính hãng.',
        bg: '/src/assets/img/chatlieu_.jpg'
      },
      {
        title: 'Quy trình chuẩn Hoa Kỳ',
        description: 'Tư vấn - điều trị - chăm sóc theo chuẩn Mỹ.',
        bg: '/src/assets/img/qt.jpg'
      }
    ]
    </script>
  
    <style scoped>
    /* Đảm bảo ảnh nền luôn đầy đủ */
    </style>
  