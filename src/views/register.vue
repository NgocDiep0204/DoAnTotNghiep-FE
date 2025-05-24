<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96 mt-2 mb-2">
        <h2 class="text-2xl font-bold text-center mb-6">Đăng Ký</h2>
  
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <label class="block text-gray-700">Họ và tên:</label>
            <input v-model="request.fullName" type="text" class="w-full p-2 border rounded" required />
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700">Email:</label>
            <input v-model="request.email" type="email" class="w-full p-2 border rounded" required />
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700">Mật khẩu:</label>
            <input v-model="request.password" type="password" class="w-full p-2 border rounded" required />
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700">Xác nhận mật khẩu:</label>
            <input v-model="confirmPassword" type="password" class="w-full p-2 border rounded" required />
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
  export default {
    data() {
      return {
        request:{
          email: "htndiep0204@gmail.com",
          password: "Abc@123",
          fullName: "Diep",
          role: "User"
        },
        confirmPassword: "Abc@123",
      }
    },
    methods:{
      async handleRegister() {
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
  