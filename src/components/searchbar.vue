<template>
    <div class="flex items-center justify-between mb-4">
      <input
        v-model="searchText"
        placeholder="Nhập từ khóa tìm kiếm..."
        class="border rounded px-3 py-1 w-1/3"
      />
      <button @click="onRefresh" class="ml-2 bg-blue-500 text-white px-3 py-1 rounded">
        Refresh
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      search: {
        type: String,
        default: ''
      }
    },
    emits: ['update:search', 'refresh'],
    computed: {
      searchText: {
        get() {
          return this.search
        },
        set(value) {
          this.$emit('update:search', value)
        }
      }
    },
    methods: {
      onRefresh() {
        this.$emit('refresh') // Gọi refresh khi nhấn nút
      }
    }
  }
  </script>
  