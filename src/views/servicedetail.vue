<template>
  <div class="max-w-5xl mx-auto p-6 space-y-12" >
    <!-- Tiêu đề + Ảnh -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 class="text-3xl font-bold text-blue-900 mb-4">{{ useService.service.serviceName }}</h1>
        <p class="text-gray-700 leading-relaxed">
          {{ useService.service.serviceDescription }}
        </p>
      </div>
      <div>
        <img :src="useService.service.imgService" :alt="useService.service.serviceName" class="rounded-xl shadow-lg" />
      </div>
    </div>

    <!-- Lợi ích -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold text-blue-800">Lợi ích</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div  class="p-4 bg-blue-50 rounded-xl shadow text-gray-800"v-for="(benefit, index) in splitCommaToArray(useService.service.benefit)" :key="index">
        ✅ {{ benefit }}
      </div>
      </div>
    </div>

    <!-- Quy trình thực hiện -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold text-blue-800">Quy trình thực hiện</h2>
    <ol class="space-y-8 relative border-l-4 border-blue-600 pl-10"  v-if="useService.service.serviceSteps">
    <li
        v-for="(step, index) in useService.service.serviceSteps.$values"
        :key="index"
        class="relative"
    >
        <!-- Số thứ tự tròn, phủ lên border, không che chữ -->
        <span
        class=" -left-5 top-1 w-8 h-8 rounded-full bg-white border-4 border-blue-600 text-blue-600 flex items-center justify-center font-bold shadow"
        >
        {{ index + 1 }}
        </span>

        <div class="ml-2">
        <h3 class="text-lg font-semibold text-blue-900">{{ step.title }}</h3>
        <p class="text-gray-700">{{ step.description }}</p>
        </div>
    </li>
    </ol>
    </div>

    <!-- Nút đặt lịch -->
    <div class="text-center pt-4">
      <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow">
        Đặt lịch ngay
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceStore } from '../store/service';
import { splitCommaToArray } from '../utils/stringhelper.js';


const route = useRoute();
const useService = useServiceStore();
onMounted(() => {
  const serviceId = route.params.id;
  useService.getServiceById(serviceId)
    .then(() => {
      console.log('Service details fetched successfully', useService.service);
    })
    .catch((error) => {
      console.error('Error fetching service details:', error);
    });
});

const service = useService.service;



</script>
