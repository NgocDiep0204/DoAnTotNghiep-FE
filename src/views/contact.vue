<template>
    <div class="flex flex-col lg:flex-row gap-6 p-6">
      <!-- Left Side: Clinic Info -->
      <div class="lg:w-1/2">
        <h2 class="text-2xl font-bold">NHA KHOA CLINIC DENTAL</h2>
        <p class="mt-2 text-gray-600">
          Nha khoa CLINIC cam kết luôn tận tâm và nỗ lực tối ưu hóa quá trình chỉnh nha để
          mang đến khách hàng sự an tâm tuyệt khi trải nghiệm dịch vụ chỉnh nha thẩm mỹ và hoàn thiện nụ cười.
        </p>
        <div class="mt-4 space-y-3 text-gray-700">
          <p><span class="font-semibold">📍 Địa chỉ:</span> Cầu Giấy, Hà Nội</p>
          <p><span class="font-semibold">📞 Điện thoại:</span> 099 888 8888 - 096 666 6666</p>
          <p><span class="font-semibold">🕒 Giờ làm việc:</span> 08:30 - 18:30 các ngày trong tuần</p>
          <p><span class="font-semibold">📅 Ngày làm việc:</span> Từ thứ 2 - Chủ nhật</p>
        </div>
      </div>
      
      <div class="lg:w-1/2">
        <img class="md:block hidden rounded-xl" :src=imgUrl alt="rangdep">
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "DentalClinicInfo",
    data() {
      return {
         imgUrl: "src/assets/img/rangdep.jpg",
      };
    },
  };
  </script>
  
  <style scoped>
  </style>
  