<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold text-center mb-4">Tìm tài khoản</h2>
        <p class="mb-4">Vui lòng nhập email để tìm tài khoản của bạn.</p>
        <form @submit.prevent="handleRequest">
          <div class="mb-4">
            <input v-model="email" type="email" class="w-full p-2 border rounded" placeholder="Nhập email" required  />
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <p v-if="message" class="text-green-500 text-sm">{{ message }}</p>
          <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded mt-4">Gửi Yêu Cầu</button>
        </form>
      </div>
    </div>
  </template>
  
  <script >
  import { useAuthStore } from '../store/user/authstore'
  export default{
      data(){
        return{
          email: 'htndiep0204@gmail.com',
        }
      },
      computed:{
        userStore(){
          return useAuthStore();
        }
      },
      mounted(){
        this.userStore.saveEmail(this.email)
          console.log('Email saved', this.userStore.email);
        
        
      },
      methods:{
        handleRequest(){
          //this.userStore.sendResetRequest(this.email)
          if(this.userStore.sendResetRequest(this.email)){
          this.$router.push('/verifyotp'); 
            
          }
        },
      }
       
    }
  </script>
  