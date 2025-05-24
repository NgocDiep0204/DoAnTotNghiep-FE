<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 class="text-lg font-semibold text-center mb-4">Reset Password</h3>
      <input v-model="resetPassword.new" type="password" placeholder="Nhập mật khẩu" class="w-full p-2 border rounded-md mb-4" />
      <input v-model="resetPassword.confirm" type="password" placeholder="Nhập lại mật khẩu" class="w-full p-2 border rounded-md mb-4" />
      <div class="flex justify-end space-x-2">
        <button @click="$router.push('/login')" class="px-4 py-2 bg-gray-400 text-white rounded-md">Cancel</button>
        <button @click="resetUserPassword" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Reset</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store/user/authstore'
export default {
  data() {
    return {
      resetPassword: { new: "", confirm: "" },
      newResetPassword: {email: "", otp:"", newpassword: "" },
    };
  },
  methods: {
    resetUserPassword() {
      if (this.resetPassword.new !== this.resetPassword.confirm) {
        alert("Nhập lại mật khẩu ko đúng!");
        return;
      }
      this.newResetPassword.newpassword = this.resetPassword.new;
      this.newResetPassword.email = this.userStore.email;
      this.newResetPassword.otp = this.userStore.otp;
      this.userStore.resetPassword(this.newResetPassword)
          .then((response) => {
            if(response ===true) {
              this.$router.push('/dang-nhap');
            }
          })
          .catch((error) => {
            console.error('Lỗi khi xác minh OTP:', error);
        });
      },
    
  },
  computed: {
    userStore() {
      return useAuthStore();
    }
  }
};
</script>
