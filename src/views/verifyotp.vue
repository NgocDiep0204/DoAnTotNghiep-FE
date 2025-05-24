<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold text-center mb-4">Xác Minh OTP</h2>
        <form @submit.prevent="isVerifyOtp">
          <div class="mb-4">
            <label class="block text-gray-700">Nhập mã OTP</label>
            <input v-model="otp" type="text" class="w-full p-2 border rounded text-center tracking-widest" 
              maxlength="6" required />
          </div>
          <!-- <p v-if="error" class="text-red-500 text-sm">{{ error }}</p> -->
          <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded mt-4">Xác Minh</button>
        </form>
      </div>
    </div>
  </template>
  
  <script >
  import { useAuthStore } from '../store/user/authstore'
    export default {
    data() {
      return {
        otp: "",
      }
    },
    methods:{
      async isVerifyOtp() {
        try {
          const result = await this.userStore.verifyOtp(this.otp, this.userStore.email);

          if (result === true) {
            console.log("Xác minh OTP thành công, chuyển hướng...");
            this.$router.push("/reset-mat-khau");
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.error("Lỗi khi xác minh OTP:", error);
          alert("Đã xảy ra lỗi không xác định");
        }
      },


    },
    computed: {
      userStore() {
        return useAuthStore();
      }
    },
  }
  </script>
  