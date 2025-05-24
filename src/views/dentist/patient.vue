<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Danh sách bệnh nhân</h2>
    <table class="w-full border text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2">Họ tên</th>
          <th class="border px-3 py-2">Ngày sinh</th>
          <th class="border px-3 py-2">Số điện thoại</th>
          <th class="border px-3 py-2">Lịch sử khám</th>
          <th class="border px-3 py-2">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(patient, index) in patients" :key="index">
          <td class="border px-3 py-2">{{ patient.name }}</td>
          <td class="border px-3 py-2">{{ patient.birthDate }}</td>
          <td class="border px-3 py-2">{{ patient.phone }}</td>
          <td class="border px-3 py-2">{{ patient.history }}</td>
          <td class="border px-3 py-2 space-x-2">
            <button class="bg-blue-500 text-white px-2 py-1 rounded">Xem</button>
            <button class="bg-red-500 text-white px-2 py-1 rounded">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      patients: [
        {
          name: 'Nguyễn Văn A',
          birthDate: '1995-01-01',
          phone: '0901234567',
          history: 'Cạo vôi răng, Trám răng'
        },
        {
          name: 'Lê Thị B',
          birthDate: '1990-05-10',
          phone: '0919876543',
          history: 'Nhổ răng khôn'
        }
      ]
    }
  }
}
</script>
