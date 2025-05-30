<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96 mt-2 mb-2">
        <h2 class="text-2xl font-bold text-center mb-6">Đăng Ký</h2>
  
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <label class="block text-gray-700">Họ và tên:</label>
            <input
              v-model="request.fullName"
              type="text"
              class="w-full p-2 border rounded focus:outline-none"
              :class="errors.fullName ? 'border-red-500' : 'border-gray-300'"
              required
            />
          <p v-if="errors.fullName" class="text-red-500 text-sm mt-1">{{ errors.fullName }}</p>
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700">Email:</label>
             <input
                v-model="request.email"
                type="text"
                class="w-full p-2 border rounded focus:outline-none"
                :class="errors.email ? 'border-red-500' : 'border-gray-300'"
                required
              />
              <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700">Mật khẩu:</label>
            <input
                v-model="request.password"
                type="password"
                class="w-full p-2 border rounded focus:outline-none"
                :class="errors.password ? 'border-red-500' : 'border-gray-300'"
                required
              />
              <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700">Xác nhận mật khẩu:</label>
             <input
                v-model="confirmPassword"
                type="password"
                class="w-full p-2 border rounded focus:outline-none"
                :class="errors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
                required
              />
              <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">{{ errors.confirmPassword }}</p>
          </div>
  
          <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">
            Đăng Ký
          </button>
        </form>
  
        <p class="mt-4 text-center text-gray-600">
          Đã có tài khoản?
          <router-link to="/dang-nhap" class="text-blue-500 hover:underline">Đăng nhập</router-link>
        </p>
      </div>
    </div>
  </template>
  <script>
  import { useAuthStore } from '../store/user/authstore'
  import { isValidFullNameLength, isStrongPassword, isValidEmail } from '../utils/validation'
  export default {
    data() {
      return {
        request:{
          email: "htndiep0204@gmail.com",
          password: "Abc@123",
          fullName: "Diep",
          role: "User"
        },
        errors: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        },
        confirmPassword: "Abc@123",
      }
    },
    methods:{
      validateForm() {
    this.errors.fullName = ''
    this.errors.email = ''
    this.errors.password = ''
    this.errors.confirmPassword = ''

    let isValid = true

    if (!isValidFullNameLength(this.request.fullName)) {
      this.errors.fullName = 'Họ và tên phải từ 6 đến 255 ký tự.'
      isValid = false
    }

    if (!isValidEmail(this.request.email)) {
      this.errors.email = 'Email phải có định dạng hợp lệ (@gmail.com).'
      isValid = false
    }

    if (!isStrongPassword(this.request.password)) {
      this.errors.password = 'Mật khẩu cần ít nhất 6 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.'
      isValid = false
    }
    if(this.request.password !== this.confirmPassword) {
      this.errors.confirmPassword  = 'Mật khẩu và xác nhận mật khẩu không khớp.'
      isValid = false
    }

    return isValid
  },
      async handleRegister() {
        if (!this.validateForm()) {
          return;
        }
        if (this.request.password !== this.confirmPassword) {
          alert("Mật khẩu không khớp!");
          return;
        }
        try {
          const result = await this.userStore.register(this.request);

          if (result === true) {
            this.$router.push("/dang-nhap");
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.error("Lỗi khi xác minh OTP:", error);
          alert("Đã xảy ra lỗi không xác định");
        }
      },
    },
    computed:{
      userStore() {
        return useAuthStore();
      }
    },
  }
  </script>
  