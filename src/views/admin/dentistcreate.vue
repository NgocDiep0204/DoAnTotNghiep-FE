<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
    >
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-2xl font-bold transition"
        aria-label="Đóng"
      >
        ×
      </button>

      <form @submit.prevent="submitForm" class="space-y-5">
        <h2 class="text-2xl font-semibold mb-6 text-center">
                {{ editData ? 'Chỉnh sửa tài nha sĩ' : 'Thêm mới nha sĩ' }}
        </h2>


  <!-- Form chia 2 cột -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <!-- Cột trái -->
    <div class="space-y-5">
      <!-- Dropdown chọn nha sĩ -->
      <div v-if="!editData ">
        <label class="block mb-1 font-medium">Chọn nha sĩ <span class="text-red-500">*</span></label>
        <select
          v-model="selectedDentistId"
          class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required>
          <option disabled value="">Chọn nha sĩ</option>
          <option v-for="dentist in dentists" :key="dentist.id" :value="dentist.id">
            {{ dentist.fullName }}
          </option>
        </select>
      </div>
      <div v-else-if="editData">
        <label class="block mb-1 font-medium">Nha sĩ</label>
        <input
          v-model="fullName"
          class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          readonly />
        
      </div>    

      <div>
        <label class="block mb-1 font-medium">Năm hành nghề <span class="text-red-500">*</span></label>
        <input
          v-model="form.years"
          ref="yearsRef"
          @input="autoResize('yearsRef')"
          class="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="number"
          placeholder="Nhập năm hành nghề"
          required />
      </div>

      <div>
        <label class="block mb-1 font-medium">Giá khám <span class="text-red-500">*</span></label>
        <input
          v-model="form.price"
          ref="priceRef"
          @input="autoResize('priceRef')"
          class="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="number"
          placeholder="Nhập giá khám (VNĐ)"
          required />
      </div>

      <div>
        <label class="block mb-1 font-medium">Trình độ học vấn <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.education"
          ref="educationRef"
          @input="autoResize('educationRef')"
          class="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="1"
          placeholder="Nhập trình độ học vấn"
          required />
      </div>
    </div>

    <!-- Cột phải -->
    <div class="space-y-5">
      <div>
        <label class="block mb-1 font-medium">Chứng chỉ chuyên sâu <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.certificate"
          ref="certificateRef"
          @input="autoResize('certificateRef')"
          class="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="1"
          placeholder="Nhập chứng chỉ"
          required />
      </div>

      <div>
        <label class="block mb-1 font-medium">Chuyên môn <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.speacialty"
          ref="specialtyRef"
          @input="autoResize('specialtyRef')"
          class="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="1"
          placeholder="Nhập chuyên môn"
          required />
      </div>

      <div>
        <label class="block mb-1 font-medium">Giới thiệu</label>
        <textarea
          v-model="form.introduce"
          ref="introduceRef"
          @input="autoResize('introduceRef')"
          class="w-full border border-gray-300 rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="1"
          placeholder="Nhập giới thiệu về nha sĩ" />
      </div>

      <div>     
        <label class="block mb-1 font-medium">Chứng chuyên </label>
        <select
          v-model="form.postgraduates"
          class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
          <option disabled value="">Chọn học vị</option>
          <option value="Thạc sĩ">Thạc sĩ</option>
          <option value="Tiến sĩ">Tiến sĩ</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Trạng thái & nút -->
  <div class="mt-6 space-y-4">
    <div>
      <label class="block mb-1 font-medium">Trạng thái <span class="text-red-500">*</span></label>
      <select
        v-model="form.status"
        class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required>
        <option value="">-- Chọn trạng thái --</option>
        <option value=0>Đang hoạt động</option>
        <option value=1>Ngưng hoạt động</option>
      </select>
    </div>

    <div class="flex justify-end gap-4">
      <button
        type="button"
        @click="$emit('close')"
        class="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition">
        Hủy
      </button>
      <button
        type="submit"
        class="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
        Thêm mới
      </button>
    </div>
  </div>
</form>

    </div>
  </div>
</template>

<script>
import { useDentistStore } from '../../store/dentist'
import { useAuthStore } from '../../store/user/authstore'
export default {
  emits: ['success', 'close'],
  props: {
  editData: {
    type: Object,
    default: null
  }
},
  data() {
    return {
      dentists: [],
      selectedDentistId: '',
      form: {
        id: 'some-unique-id', 
        userId: '',
        years: '',
        education: '',
        certificate: '',
        introduce: '',
        speacialty: '',
        postgraduates: '',
        price: '',
        status: ''
      },
      fullName: '',
    }
  },
 watch: {
  selectedDentistId(newId) {
    const selected = this.dentists.find(d => d.id === newId)
    this.fullName = selected ? selected.user.fullName : ''
  },
  editData: {
    immediate: true,
    handler(newVal) {
      if (newVal) {
        this.form = { ...newVal }
        this.selectedDentistId = newVal.userId
        this.fullName = newVal.user.fullName || ''
      }
    }
  }
},
    computed: {
        dentistStore() {
            return useDentistStore()
        },
        authStore() {
        return useAuthStore()
        }
    },  

  async mounted() {
   this.dentists = await this.authStore.getUserByRole('Dentist')
   console.log('Danh sách nha sĩ:', this.dentists)
    // Tự động resize các textarea sau khi mount
    this.$nextTick(() => {
      const refs = [
        'yearsRef',
        'educationRef',
        'certificateRef',
        'introduceRef',
        'specialtyRef',
        'postgraduatesRef',
        'priceRef'
      ]
      refs.forEach(refName => {
        this.autoResize(refName)
      })
    })
  },
  methods: {
   
    autoResize(refName) {
      const el = this.$refs[refName]
      if (!el) return
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    },
    async submitForm() {
  try {
    const dataToSend = {
      ...this.form,
      status: parseInt(this.form.status),
      userId: this.selectedDentistId
    }

    
    if (this.editData) {
      var resUpdate = await this.dentistStore.updatedentist(dataToSend)
      if(resUpdate === true){
        alert('Cập nhật nha sĩ thành công!')
    }
    } else {
      var resAdd = await this.dentistStore.adddentist(dataToSend)
      if(resAdd === true){
        alert('Thêm nha sĩ thành công!')
      }else {
      alert(resAdd.message || 'Thao tác thất bại.')
    }
    }
      this.$emit('close')
      this.$emit('success')
  } catch (err) {
    console.error(err)
    alert('Đã xảy ra lỗi!')
  }
}
  }
}
</script>
