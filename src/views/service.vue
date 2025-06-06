<template>
  <div class="flex flex-col gap-7 max-w-5xl mx-2.5">
    <strong class="text-xl text-gray-800">Dịch vụ của chúng tôi</strong>
    <div
      v-for="(service, index) in useService.services"
      :key="service.serviceId"
      class="grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-md text-sm"
    >
     <!-- Ảnh bên trái -->
<div class="bg-[#eaf6ff] flex justify-center items-center h-64 overflow-hidden">
  <img
    :src="service.imgService"
    alt="Ảnh dịch vụ"
    class="w-[60%] h-full object-cover"
  />
</div>

<!-- Nội dung bên phải -->
<div class="bg-blue-800 text-white px-6 py-6 flex flex-col justify-between min-h-[288px]">
  <div>
    <h3 class="text-base font-semibold mb-2">Dịch vụ {{ service.serviceName }}</h3>
    <p class="text-sm leading-snug line-clamp-3 mt-10">
      • {{ service.serviceDescription }}
    </p>
  </div>
  <button
    @click="goToServiceDetail(service.serviceId)"
    class="text-white font-medium underline underline-offset-2 hover:opacity-90 w-fit text-xs mt-4"
  >
    Xem chi tiết dịch vụ →
  </button>
</div>
    </div>
  </div>
</template>

<script>
import { useServiceStore } from '../store/service';

export default {
  computed: {
    useService() {
      return useServiceStore();
    },
  },
  mounted() {
    this.useService.getServiceByStatus(1);
  },
  methods: {
    goToServiceDetail(serviceId) {
      this.$router.push({ name: 'servicedetail', params: { id: serviceId } });
    },
  },
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
