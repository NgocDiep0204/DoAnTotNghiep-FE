<template>
  <div class="w-60 bg-blue-900 h-full p-4 border-r">
    <div v-for="item in menu" :key="item.name" class="mb-2">
      <button
        @click="$emit('changeComponent', item.name)"
        class="w-full text-white text-left px-4 py-2 rounded hover:bg-blue-100 hover:text-gray-900"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    menu: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
</style>
