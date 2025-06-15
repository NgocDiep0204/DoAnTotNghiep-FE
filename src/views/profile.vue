<template>
    <div  class="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h2 class="text-2xl font-bold text-center mb-4">Thông tin tài khoản</h2>
      <div v-if="userStore.user" class="flex flex-col items-center" @click="openAvatarPopup">
        <img :src="userStore.user.imageUrl" alt="Profile Image" class="w-20 h-20 rounded-full" />
      </div>
      
      <div v-if="this.userStore.user" class="mt-6">
          <!-- Name -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 w-20">Họ và tên:</label>
            <p class="p-2 rounded-md  flex-1">{{ userStore.user.fullName }}</p>
          </div>


          <!-- Email -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 w-20">Email:</label>
            <p class="p-2 rounded-md flex-1">{{ userStore.user.email }}</p>
          </div>
        </div>
        <div class="flex flex-rows items-center gap-1">
           <button @click="openPasswordPopup" class="w-full bg-blue-900 text-white p-2 mt-10 rounded-md hover:bg-blue-950 transition">Đổi Mật Khẩu</button>
           <button @click="openInfoPopup" class="w-full bg-blue-900 text-white p-2 mt-10 rounded-md hover:bg-blue-950  transition">Đổi thông tin</button>
        </div>
       
    </div>
  
    <!-- Popup đổi hình đại diện -->
    <div v-if="showAvatarPopup" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h3 class="text-lg font-semibold mb-4">Đổi ảnh đại diện</h3>
        <input type="file" @change="onFileChange" class="w-full p-2 border rounded-md mb-4" accept="image/*" />
        <div v-if="previewAvatar" class="flex justify-center mb-4">
          <img :src="previewAvatar" class="w-24 h-24 rounded-full border-2 border-gray-300" />
        </div>
        <div class="flex justify-end space-x-2">
          <button @click="showAvatarPopup = false" class="px-4 py-2 bg-gray-400 text-white rounded-md">Hủy</button>
          <button @click="updateAvatar" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Lưu</button>
        </div>
      </div>
    </div>
  
    <!-- Popup đổi mật khẩu -->
    <div v-if="showPasswordPopup" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h3 class="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
        <input v-model="passwords.currentPassword" type="password" placeholder="Current Password" class="w-full p-2 border rounded-md mb-4" />
        <input v-model="passwords.newPassword" type="password" placeholder="New Password" class="w-full p-2 border rounded-md mb-4" />
        <input v-model="confirm" type="password" placeholder="Confirm New Password" class="w-full p-2 border rounded-md mb-4" />
        <div class="flex justify-end space-x-2">
          <button @click="showPasswordPopup = false" class="px-4 py-2 bg-gray-400 text-white rounded-md">Hủy</button>
          <button @click="updatePassword" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Lưu</button>
        </div>
      </div>
    </div>
    <!-- Popup đổi thông tin -->
     <div v-if="showInfoPopup" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
       <div class="bg-white p-6 rounded-lg shadow-lg">
         <h3 class="text-lg font-semibold mb-4">Đổi thông tin</h3>
         <input v-model="fullName" type="text" placeholder="Họ và tên" class="w-full p-2 border rounded-md mb-4" />
         <input v-model="email" type="email" placeholder="Email" class="w-full p-2 border rounded-md mb-4" />
         <div class="flex justify-end space-x-2">
           <button @click="showInfoPopup = false" class="px-4 py-2 bg-gray-400 text-white rounded-md">Hủy</button>
           <button @click="updateInfo" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Lưu</button>
         </div>
       </div>
     </div>
  </template>

  <script>
  import { useAuthStore } from '../store/user/authstore'
  export default {
    data() {
      return {
        showAvatarPopup: false,
        showPasswordPopup: false,
        showInfoPopup: false,
        selectedFile: null,
        previewAvatar: "",
        passwords: {
          currentPassword: "",
          newPassword:   "",
        },
        confirm: "",
        fullName: "",
        email: "",

      };
    },
    methods: {
    openAvatarPopup() {
      this.previewAvatar = this.userStore.user.imageUrl;
      this.selectedFile = null; // reset file
      this.showAvatarPopup = true;
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.previewAvatar = URL.createObjectURL(file); // preview
        this.selectedFile = file; // lưu lại file thật
      }
    },
    async updateAvatar() {
      const success = await this.userStore.updateUserProfile(this.userStore.user, this.selectedFile);
      if (success) {
        alert("Cập nhật ảnh đại diện thành công!");
        this.userStore.user.imageUrl = this.previewAvatar; // cập nhật ảnh đại diện trong store
      } else {
        alert("Cập nhật ảnh đại diện thất bại!");
      }
      this.showAvatarPopup = false;
    },
      openPasswordPopup() {
        this.passwords = { currentPassword: "Abc@123", newPassword: "Abc@1234" };
        this.showPasswordPopup = true;
      },
      openInfoPopup() {
        this.fullName = this.userStore.user.fullName;
        this.email = this.userStore.user.email;
        this.showInfoPopup = true;
      },
      async updatePassword() {
        if (this.passwords.newPassword !== this.confirm) {
          alert("New passwords do not match!");
          return;
        }

        console.log("fffff", this.passwords);
        try {
          const result = await this.userStore.changePassword(this.passwords); // thêm await ở đây
          if (result === true || result.success === true) {
            alert("Đã thay đổi mật khẩu thành công!");
            this.passwords.currentPassword = "";
            this.passwords.newPassword = "";
            this.confirm = "";
          } else {
            alert(result.message || "Đổi mật khẩu thất bại!");
          }
        } catch (error) {
          alert("Đã xảy ra lỗi không xác định");
        }
      },
      async updateInfo(){
        var res = await this.userStore.updateUserProfileByUserId(this.userStore.user.id,this.email,this.fullName, 0)
       if(res == true){
         alert("Cập nhật thông tin thành công!");
          this.showInfoPopup = false;
          this.userStore.getUser()
       }
       else{
         alert(res.message);
       }
      }


    }, 
    mounted() {
    },
    computed:{
      userStore() {
        return useAuthStore();
      }
    }
  };
  </script>
  
  <style>
  body {
    background-color: #f3f4f6;
  }
  </style>
  