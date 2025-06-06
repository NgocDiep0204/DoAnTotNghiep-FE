<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] p-6 overflow-y-auto">
      <h2 class="text-2xl font-semibold mb-6 text-center">
        {{ user ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới' }}
      </h2>

      <form @submit.prevent="submitCreate" class="grid grid-cols-2 gap-8">
        <!-- Left Column -->
        <div class="space-y-5">
          <div>
            <input
                v-model="form.fullName"
                type="text"
                placeholder="Họ và tên"
                required
                :class="[
                'w-full border rounded-md px-4 py-2 focus:outline-none',
                errors.fullName ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'
                ]"
            />
            <p v-if="errors.fullName" class="text-red-500 text-sm mt-1">{{ errors.fullName }}</p>
          </div>

          <div>
            <input
                v-model="form.email"
                type="text"
                placeholder="Email"
                required
                :class="[
                'w-full border rounded-md px-4 py-2 focus:outline-none',
                errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'
                ]"
            />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <div v-if="!user">
            <input
              v-model="form.password"
              type="password"
              placeholder="Mật khẩu"
              required
              :class="[
                'w-full border rounded-md px-4 py-2 focus:outline-none',
                errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'
              ]"
            />
            <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <div>
            <select
            v-model="formupdate.gender"
            required
            class="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option disabled value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          </div>

          <div v-if="user">
            <select
            v-model="status"
            required
            class="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option disabled value="">Chọn trạng thái</option>
            <option value="0">Hoạt động</option>
            <option value="1">Không hoạt động</option>
          </select>
          </div>

          <div>
           <select
                v-model="form.role"
                required
                class="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                <option disabled value="">Chọn vai trò</option>
                <option value="User">Bệnh nhân</option>
                <option value="Admin">Quản trị viên</option>
                <option value="Dentist">Nha Sĩ</option>
                </select>
            
          </div>
        </div>

        <!-- Right Column -->
        <div class="flex flex-col items-center">
          <label class="block mb-2 font-medium text-gray-700 w-full text-center">Ảnh đại diện</label>
          <div
            @click="$refs.fileInput.click()"
            class="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors w-full max-w-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-14 w-14 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-3-3m3 3l3-3M16 6l-4-4-4 4m8 0H8"
              />
            </svg>
            <span>Click để chọn ảnh</span>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleFileChange"
            />
          </div>
          <div v-if="imagePreview" class="mt-6">
            <img
              :src="imagePreview"
              alt="Ảnh đại diện"
              class="w-40 h-40 rounded-full object-cover border-4 border-green-400 shadow-md"
            />
          </div>
        </div>

        <!-- Buttons span full width under both columns -->
        <div class="col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
            <span v-if="isSubmitting">Đang lưu...</span>
            <span v-else>Lưu</span>
            </button>

            <!-- Nút "Hủy" chỉ hiển thị khi không đang submit -->
            <button
            type="button"
            v-if="!isSubmitting"
            @click="$emit('close')"
            class="px-6 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition-colors"
            >
            Hủy
            </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../../store/user/authstore'
import { isValidFullNameLength, isStrongPassword, isValidEmail } from '../../utils/validation'
export default {
  emits: ['close', 'created'],
  props: {
  user: {
    type: Object,
    default: null
  }
},

  data() {
    return {
      form: {
        fullName: '',
        email: '',
        password: '',
        role: '',
      },
      formupdate: {
        fullName: '',
        gender: '',
        file: '',
      },
      errors: {
        fullName: '',
        email: '',
        password: '',
        },
      imagePreview: null,
      isSubmitting: false, 
      status: '',
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  watch: {
  user: {
    immediate: true,
    handler(user) {
      if (user) {
        this.form.fullName = user.fullName || ''
        this.form.email = user.email || ''
        this.form.password = ''  // không để mật khẩu cũ
        this.form.role = user.roles || ''
        this.status = user.status
        this.formupdate.gender = user.gender || ''
        this.imagePreview = user.imageUrl || null
      }
    }
  }
},
  methods: {
    validateForm() {
    this.errors.fullName = ''
    this.errors.email = ''
    this.errors.password = ''

    let isValid = true

    if (!isValidFullNameLength(this.form.fullName)) {
      this.errors.fullName = 'Họ và tên phải từ 6 đến 255 ký tự.'
      isValid = false
    }

    if (!isValidEmail(this.form.email)) {
      this.errors.email = 'Email phải có định dạng hợp lệ (@gmail.com).'
      isValid = false
    }

    if (!this.user && !isStrongPassword(this.form.password)) {
      this.errors.password = 'Mật khẩu cần ít nhất 6 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.'
      isValid = false
    }

    return isValid
  },

    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.formupdate.file = file
        this.imagePreview = URL.createObjectURL(file)
      } else {
        this.formupdate.file = null
        this.imagePreview = null
      }
    },
   
   async submitCreate() {
        if (!this.validateForm()) return

  this.isSubmitting = true
  try {
    this.formupdate.fullName = this.form.fullName
    console.log('Form data:', this.form)
    console.log('Form update data:', this.formupdate)
    if (this.user) {
      // Cập nhật tài khoản
      await this.authStore.UpdateUserProfiles(this.formupdate, this.form.email)
       await this.authStore.updateUserProfileByUserId(
        this.user.id,
        this.form.email,
        this.form.fullName,
        this.status
      )
       await this.authStore.updateUserRole(
        this.user.id,
        this.form.role
      )
      alert('Cập nhật tài khoản thành công!')
    } else {
      // Thêm mới tài khoản
      await this.authStore.register(this.form)
      await this.authStore.UpdateUserProfiles(this.formupdate, this.form.email)
      alert('Tạo tài khoản thành công!')
      this.form.fullName = '',
      this.form.email = '',
      this.form.role = '',
      this.formupdate.gender = ''
      this.imagePreview = ''
    }
   
    this.$emit('created', { ...this.form })
  } catch (error) {
    console.error('Error creating user:', error)
    alert('Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.')
  } finally {
    this.isSubmitting = false
  }
},
mounted() {
  if (this.user) {
    this.form.fullName = this.user.fullName || ''
    this.form.email = this.user.email || ''
    this.form.role = this.user.role || ''
    this.formupdate.gender = this.user.gender || ''
    this.imagePreview = this.user.imageUrl || null
  }
}


}
}

</script>
