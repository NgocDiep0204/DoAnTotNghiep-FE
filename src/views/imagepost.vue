<template>
  <div v-if="images?.length" class="grid gap-1" :class="gridClass">
    <div
      v-for="(img, index) in images"
      :key="index"
      class="relative overflow-hidden rounded cursor-pointer"
      :class="getGridItemClass(index)"
      @click="openViewer(index)"
    >
      <img :src="img.imageUrl" class="object-cover w-full h-full" />
    </div>
  </div>

  <!-- Popup Viewer -->
  <div v-if="showViewer" class="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
    <div class="relative w-full max-w-4xl px-4">
      <img :src="currentImage" class="w-full max-h-[90vh] object-contain rounded" />
      <button @click="closeViewer" class="absolute top-2 right-2 text-white text-3xl">×</button>
      <button
        @click="prevImage"
        class="absolute top-1/2 left-2 text-white text-3xl -translate-y-1/2"
        v-if="currentIndex > 0"
      >
        ‹
      </button>
      <button
        @click="nextImage"
        class="absolute top-1/2 right-2 text-white text-3xl -translate-y-1/2"
        v-if="currentIndex < images.length - 1"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
})

const gridClass = computed(() => {
  const count = props.images.length
  if (count === 3) return 'grid-cols-3 grid-rows-2 grid-areas-3-img'
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  return 'grid-cols-3 md:grid-cols-4'
})

const getGridItemClass = (index) => {
  if (props.images.length === 3) {
    if (index === 0) return 'area-a'
    if (index === 1) return 'area-b'
    if (index === 2) return 'area-c'
  }
  return ''
}

// Viewer logic
const showViewer = ref(false)
const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value]?.imageUrl)

const openViewer = (index) => {
  currentIndex.value = index
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
}

const prevImage = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) currentIndex.value++
}
</script>

<style scoped>
.grid > div {
  aspect-ratio: 1 / 1;
}

.grid-areas-3-img {
  display: grid;
  grid-template-areas:
    "a c"
    "b c";
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 1fr 1fr;
}
.area-a {
  grid-area: a;
}
.area-b {
  grid-area: b;
}
.area-c {
  grid-area: c;
}
</style>
