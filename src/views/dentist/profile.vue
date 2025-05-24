<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Hồ sơ cá nhân</h2>
    <div class="space-y-2">
      <p><strong>Họ và tên:</strong> {{ doctor.name }}</p>
      <p><strong>Email:</strong> {{ doctor.email }}</p>
      <p><strong>Chuyên môn:</strong> {{ doctor.specialty }}</p>
      <p><strong>Số năm kinh nghiệm:</strong> {{ doctor.experience }} năm</p>
    </div>
    <div class="mt-4">
      <button class="bg-blue-600 text-white px-4 py-2 rounded">Chỉnh sửa hồ sơ</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      doctor: {
        name: 'BS. Hoàng Thị Ngọc Điệp',
        email: 'htndiep2277@gmail.com',
        specialty: 'Nha chu',
        experience: 5
      }
    }
  }
}
</script>
