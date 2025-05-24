<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow p-6 space-y-4 w-full max-w-md relative">
      <!-- Nút đóng (góc phải) -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
      >
        ×
      </button>

      <h2 class="text-xl font-bold text-blue-900">Thêm bước quy trình</h2>
        <p class="text-gray-700">Dịch vụ {{ service.serviceName }}</p>
      <form @submit.prevent="addStep" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input
            v-model="newStep.title"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tiêu đề bước"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            v-model="newStep.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mô tả bước"
            required
          ></textarea>
        </div>

        <div class="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Thêm bước
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useServiceStore } from '../../store/service'

const props = defineProps(['service'])
const emit = defineEmits(['close', 'saved'])
const serviceStore = useServiceStore()

const newStep = ref({
  id: '',
  serviceId: props.service.serviceId,
  title: '',
  description: '',
})

const addStep = async () => {
  try {
    console.log('Thêm bước:', newStep.value)
    await serviceStore.addServiceStep(newStep.value)  
    newStep.value = { title: '', description: '' }  
    emit('saved')  
    emit('close')  
  } catch (error) {
    console.error('Có lỗi xảy ra khi thêm bước:', error)
    alert('Có lỗi xảy ra, vui lòng thử lại!')
  }
}

</script>
