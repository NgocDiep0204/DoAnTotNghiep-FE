<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
      <!-- Left: Avatar -->
      <div class="md:w-1/3 bg-gray-100 flex items-center justify-center p-6">
        <img
          :src="user?.imageUrl"
          alt="Avatar"
          class="rounded-full w-48 h-48 object-cover border-4 border-white shadow-md"
        />
      </div>

      <!-- Right: User Info -->
      <div class="md:w-2/3 p-6">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Thông tin người dùng</h2>

        <div class="space-y-3 text-gray-700">
          <p><span class="font-semibold">🆔 ID:</span> {{ user.id }}</p>
          <p><span class="font-semibold">👤 Họ tên:</span> {{ user.fullName }}</p>
          <p><span class="font-semibold">📧 Email:</span> {{ user.email }}</p>
          <p><span class="font-semibold">📱 Số điện thoại:</span> {{ user.phoneNumber }}</p>
          <p><span class="font-semibold">🔐 Quyền:</span> {{ user.roles }}</p>
          <p>
            <span class="font-semibold">⚙️ Trạng thái:</span>
            <span :class="user.status === 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
              {{ user.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}
            </span>
          </p>
        </div>

        <div class="mt-6 text-right">
          <button
            @click="$emit('close')"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['user'])
</script>
