<template>
  <div class="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg h-96">
    <div
      v-for="(image, index) in images"
      :key="index"
      class="absolute inset-0 w-full h-full transition-opacity duration-1000"
      :class="{ 'opacity-100 z-10': index === currentIndex, 'opacity-0 z-0': index !== currentIndex }"
    >
      <img :src="image" alt="Banner Image" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [
        'src/assets/img/qt.jpg',
        'src/assets/img/khamrang.jpg',
        'src/assets/img/khamrang2.jpg',
        'src/assets/img/rangdep.jpg',
        'src/assets/img/niengrang.jpg',
      ],
      currentIndex: 0,
      intervalId: null,
    };
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 3000);
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
};
</script>

<style scoped>
.transition-opacity {
  transition: opacity 1s ease-in-out;
}
</style>
