<template>
  <header class="w-full">
    <!-- Thanh trên -->
    <div class="bg-gray-100 text-gray-600 text-sm py-2">
      <div class="container mx-auto flex justify-between items-center px-4">
        <span>099 888 8888 | 096 666 6666</span>
        <div class="flex items-center space-x-4 relative">
          <a href="#" class="hover:text-blue-600">Hỗ trợ</a>
          <a href="#" class="hover:text-blue-600">Tuyển dụng</a>
          <router-link :to="{ name: 'contact' }" class="hover:text-blue-600">Liên hệ</router-link>
          <router-link v-if="!isLoggedIn" :to="{ name: 'login' }" class="hover:text-blue-600">Đăng nhập</router-link>

          <!-- Avatar & Menu -->
          <div v-if="useUser.user" class="relative">
            <img
            ref="avatarRef"
            :src="useUser.user.imageUrl"
            alt="Avatar"
            class="w-8 h-8 rounded-full border cursor-pointer"
            @click="toggleMenu"
            />

            <!-- Dropdown Menu -->
            <div
            v-if="showMenu"
            ref="menuRef"
            class="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md overflow-hidden z-10"
            >
            <router-link @click.prevent="getProfile" to="#" class="block px-4 py-2 hover:bg-gray-100">
              👤 Xem hồ sơ
            </router-link>
            <button @click="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
              🚪 Đăng xuất
            </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Thanh dưới -->
    <div class="bg-white shadow-sm">
      <div class="container mx-auto flex justify-between items-center py-4 px-4">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <span class="text-lg font-semibold text-blue-900">DENTAL CLINIC</span>
        </div>

        <!-- Menu -->
          <div class="flex justify-center items-center w-full">
          <nav v-if="!useUser.user || useUser.user.role === 'User'" class="hidden md:flex gap-x-6 text-gray-700 font-medium text-sm whitespace-nowrap">
            <router-link :to="{ name: 'home' }" class="hover:text-blue-600">Trang chủ</router-link>
            <router-link :to="{ name: 'doctorspage' }" class="hover:text-blue-600">Đội ngũ bác sĩ</router-link>
            <router-link :to="{ name: 'service' }" class="hover:text-blue-600">Dịch vụ</router-link>
            <router-link :to="{ name: 'history' }" class="hover:text-blue-600">Lịch sử khám</router-link>
            <router-link :to="{ name: 'blogs' }" class="hover:text-blue-600">Blogs</router-link>
          </nav>

          
          <nav v-else class="hidden md:flex gap-x-6 text-gray-700 font-medium text-sm whitespace-nowrap justify-self-start">
            <router-link :to="{ name: 'customermanager' }" class="hover:text-blue-600">Quản lý khách hàng</router-link>
            <router-link :to="{ name: 'dentistmanager' }" class="hover:text-blue-600">Quản lý nha sĩ</router-link>
            <router-link :to="{ name: 'listservice' }" class="hover:text-blue-600">Quản lý dịch vụ</router-link>
            <router-link :to="{ name: 'appoimentmanager' }" class="hover:text-blue-600">Quản lý lịch hẹn </router-link>
            <router-link :to="{ name: 'fulldashboard' }" class="hover:text-blue-600">Báo cáo</router-link>
            <router-link :to="{ name: 'chatadmincomponent' }" class="hover:text-blue-600">Tin nhắn</router-link>
            <router-link :to="{ name: 'dentistappoiment' }" class="hover:text-blue-600">QL lịch hẹn cá nhân</router-link>
  


          </nav>
         
      </div>
      <!-- <chatadmincomponent
      v-if="useUser.user?.role === 'Admin'"
      class="ml-4"
      :inline="true"
    /> -->
  <button v-if="useUser.user?.role === 'Admin'"
    class="bg-gradient-to-r from-blue-500 to-blue-950 text-white px-4 py-2 ml-4 rounded-2xl flex items-center space-x-2 hover:bg-blue-700 whitespace-nowrap">
    <span>📅</span>
    <router-link :to="{ name: 'bookdoctors' }">Đặt lịch hẹn</router-link>
  </button>
      </div>
    </div>
  </header>
   
</template>

<script>
import { useAuthStore } from '../store/user/authstore';
import chatadmincomponent from './chatadmincomponent.vue';
import axiosClient from '../axiosClient';
export default {
  data() {
    return {
      img: "/src/assets/img/niengrang.jpg",
      showMenu: false,
    };
  },
  components: {
    chatadmincomponent
  },
  computed: {
    useUser() {
      return useAuthStore();
    },
    isLoggedIn() {
      return this.useUser.user;
    }
  },
  async mounted() {
  if(localStorage.getItem('token')){
    await this.useUser.getUser(); 
  }
  window.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    closeMenu() {
      this.showMenu = false;
    },

    handleClickOutside(event) {
      const avatar = this.$refs.avatarRef;
      const menu = this.$refs.menuRef;

      if (
        this.showMenu &&
        !menu?.contains(event.target) &&
        !avatar?.contains(event.target)
      ) {
        this.closeMenu();
      }
    },

    getProfile() {
      this.closeMenu();
      this.$router.push('/ho-so-ca-nhan').then(() => {
      });
    },
    async logout() {
      try{
        const response = await axiosClient.post('Authentication/Logout');
        if(response.status === 200) {
          this.useUser.removeToken(localStorage.getItem('token')); 
          this.$router.push('/dang-nhap').then(() => {
            window.location.reload();
          });
        }
      }catch{
        console.log('Logout failed');
      }
    },
  },
};
</script>
