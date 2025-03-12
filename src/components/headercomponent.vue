<template>
  <header class="w-full">
  <!-- Thanh trên -->
  <div class="bg-gray-100 text-gray-600 text-sm py-2">
    <div class="container mx-auto flex justify-between items-center px-4">
      <span>099 888 8888 | 096 666 6666</span>
      <div class="space-x-4">
        <a href="#" class="hover:text-blue-600">Hỗ trợ</a>
        <a href="#" class="hover:text-blue-600">Tuyển dụng</a>
        <a href="#" class="hover:text-blue-600">Liên hệ</a>
        <a href="#" class="hover:text-blue-600">Đăng nhập</a>
        <select class="bg-transparent focus:outline-none">
          <option>Tiếng Việt</option>
          <option>English</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Thanh dưới -->
  <div class="bg-white shadow-sm">
    <div class="container mx-auto flex justify-between items-center py-4 px-4">
      <!-- Logo -->
      <div class="flex items-center space-x-2">
        <!-- <img src="logo.png" alt="Logo" class="h-10"> -->
        <span class="text-lg font-semibold text-blue-900">DENTAL CLINIC</span>
      </div>

      
      <!-- Menu -->
      <nav class="hidden md:flex items-center gap-x-6 text-gray-700 font-medium text-sm whitespace-nowrap">
        <a href="#" class="hover:text-blue-600">Trang chủ</a>
        <a href="#" class="hover:text-blue-600">Về chúng tôi</a>
        <a href="#" class="hover:text-blue-600">Dịch vụ</a>
        <a href="#" class="hover:text-blue-600">Đội ngũ bác sĩ</a>
        <a href="#" class="hover:text-blue-600">Khách hàng</a>
        <a href="#" class="hover:text-blue-600">Chuyên gia tư vấn</a>
        <a href="#" class="hover:text-blue-600">Cửa hàng</a>
        <a href="#" class="hover:text-blue-600">Kiến thức</a>
      </nav>

      <!-- Nút Đặt lịch hẹn -->
      <button class="bg-blue-600 text-white px-2 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 whitespace-nowrap">
        <span>📅</span>
        <span>Đặt lịch hẹn</span>
      </button>
    </div>
  </div>
</header>

</template>