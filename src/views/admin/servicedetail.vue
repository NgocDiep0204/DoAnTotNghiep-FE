<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-semibold mb-4">Chi tiết dịch vụ</h2>
      <div class="mb-2"><strong>ID:</strong> {{ service.serviceId }}</div>
      <div class="mb-2"><strong>Tên dịch vụ:</strong> {{ service.serviceName }}</div>
      <div class="mb-2"><strong>Giá cả:</strong> {{ service.price }}</div>
      <div class="mb-4"><strong>Trạng thái:</strong> {{ service.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}</div>
      <div class="mb-2"><strong>Mô tả:</strong> {{ service.serviceDescription }}</div>
      <div class="mb-2">
      <strong>Lợi ích: </strong>
        <div v-for="(benefit, index) in splitCommaToArray(service.benefit)" :key="index">
        • {{ benefit }}
        </div>
      </div>
      <div class="mb-2">
        <strong>Quy trình:</strong>
        <ul v-if="service.serviceSteps">
          <li
            v-for="(step, index) in service.serviceSteps.$values"
            :key="step.id"
            class="mb-3 border-b pb-2"
          >
            <div v-if="editStepId !== step.id">
              <span class="font-medium">{{ index + 1 }}. {{ step.title }}</span><br />
              - {{ step.description }}
              <button class="text-blue-500 ml-2 text-sm" @click="startEdit(step)">Sửa</button>
              <button class="text-blue-500 ml-2 text-sm" @click="deleteStep(step.id)">Xóa</button>

            </div>

            <div v-else class="mt-1">
              <input v-model="editedStep.title" placeholder="Tiêu đề" class="border px-2 py-1 mr-2 w-full mb-1" />
              <input v-model="editedStep.description" placeholder="Mô tả" class="border px-2 py-1 mr-2 w-full mb-1" />
              <div class="text-right">
                <button class="bg-green-500 text-white px-2 py-1 mr-2 rounded text-sm" @click="saveEdit(editedStep)">Lưu</button>
                <button class="bg-gray-400 text-white px-2 py-1 rounded text-sm" @click="cancelEdit">Hủy</button>
              </div>
            </div>
          </li>
        </ul>
        <div v-else>Không có quy trình nào.</div>
      </div>

      <div class="text-right mt-4">
        <button @click="$emit('close')" class="bg-blue-500 text-white px-4 py-1 rounded">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useServiceStore } from '../../store/service'
import { splitCommaToArray } from '../../utils/stringhelper.js'

const props = defineProps(['service'])
const emit = defineEmits(['reload'])

const serviceStore = useServiceStore()
const editStepId = ref(null)
const editedStep = ref({id: '', serviceId: '', title: '', description: '' })

function startEdit(step) {
  editStepId.value = step.id
  editedStep.value = { ...step }
}

function cancelEdit() {
  editStepId.value = null
  editedStep.value = {id:'', serviceId: '', title: '', description: '' }
}

async function saveEdit(editedStep) {
  try {
    const updateSuccess = await serviceStore.updateServiceStep(editedStep);
    
    if (updateSuccess) {
      const index = props.service.serviceSteps.$values.findIndex(step => step.id === editedStep.id)
      if (index !== -1) {
        props.service.serviceSteps.$values[index] = { ...editedStep }
      }
      cancelEdit()
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật bước:', error)
  }
}
function deleteStep(id) {
  if (confirm('Bạn có chắc muốn xóa bước này?')) {
    serviceStore.deleteServiceStepByServiceId(id).then(() => {
      const index = props.service.serviceSteps.$values.findIndex(step => step.id === id)
      if (index !== -1) {
        props.service.serviceSteps.$values.splice(index, 1)
      }
    }).catch((error) => {
      console.error('Error deleting step:', error)
    })
  }
}


</script>
