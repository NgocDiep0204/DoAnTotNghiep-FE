<template>
    <div class="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg shadow-lg">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="absolute inset-0 transition-opacity duration-1000"
        :class="{ 'opacity-100': index === currentIndex, 'opacity-0': index !== currentIndex }"
      >
        <img :src="image" alt="Banner Image" class="w-full h-64 object-cover" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        images: [
          'https://source.unsplash.com/random/800x400?nature',
          'https://source.unsplash.com/random/800x400?city',
          'https://source.unsplash.com/random/800x400?technology',
        ],
        currentIndex: 0,
      };
    },
    mounted() {
      this.startAutoSlide();
    },
    methods: {
      startAutoSlide() {
        setInterval(() => {
          this.currentIndex = (this.currentIndex + 1) % this.images.length;
        }, 3000);
      },
    },
  };
  </script>
  
  <style scoped>
    .transition-opacity {
      transition: opacity 1s ease-in-out;
    }
  </style>
  