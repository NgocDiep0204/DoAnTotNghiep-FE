<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold text-center mb-6">Đăng Nhập</h2>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-700">Email:</label>
          <input v-model="email" type="email" class="w-full p-2 border rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Mật khẩu:</label>
          <input v-model="password" type="password" class="w-full p-2 border rounded" required />
        </div>

        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">
          Đăng Nhập
        </button>
      </form>

      <p class="mt-4 text-center text-gray-600 cursor-pointer">
        Chưa có tài khoản?
        <router-link :to="{ name: 'register' }" class="hover:text-blue-600">Đăng ký</router-link>
      </p>
      <p class="mt-4 text-center text-gray-600 cursor-pointer">
        <router-link :to="{ name: 'forgotpassword' }" class="hover:text-blue-600">Quên mật khẩu?</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axiosClient from '../axiosClient'
import { useAuthStore } from '../store/user/authstore'

export default {
  data() {
    return {
      email: 'htndiep0204@gmail.com',
      password: 'Abc@123',
      authStore: useAuthStore(), // Lưu store vào biến data để sử dụng trong methods
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axiosClient.post('Authentication/Login', {
          email: this.email,
          password: this.password,
        })

        if (response.data?.token) {
          this.authStore.setToken(response.data.token) 
          this.$router.replace("/trang-chu").then(() => {
            window.location.reload();
          });

        } else {
          alert('Login failed. Please check your email and password.')
        }
      } catch (error) {
          if (error.response) {
              console.error('Login error:', error.response.data);
              if (error.response.status === 404) {
                  alert('Email không tồn tại. Vui lòng kiểm tra lại.');
              } else  if (error.response.status === 409) {
                  alert('Mật khẩu không đúng.');
              }else  if (error.response.status === 403) {
                  alert('Tài khoản của bạn đã bị khóa.');
              }
          } else if (error.request) {
              console.error('Login error: No response from server', error.request);
          } else {
              console.error('Login error:', error.message);
          }
      }
    },
  },
}
</script>
