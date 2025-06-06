<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Danh sách bệnh nhân</h2>
    <table class="w-full border text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-3 py-2">Họ tên</th>
          <th class="border px-3 py-2">Email</th>
          <th class="border px-3 py-2">Lịch sử khám</th>
          <th class="border px-3 py-2">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(patient, index) in patients" :key="index">
          <td class="border px-3 py-2">{{ patient.name }}</td>
          <td class="border px-3 py-2">{{ patient.email }}</td>
          <td class="border px-3 py-2">{{ patient.history }}</td>
          <td class="border px-3 py-2 space-x-2">
            <button class="bg-blue-500 text-white px-2 py-1 rounded">Xem</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { useDentistStore } from '../../store/dentist';
import { useServiceStore } from '../../store/service';
import Pagination from '../../components/paginationcomponent.vue';
import {useAuthStore} from '../../store/user/authstore';

export default {
  data() {
    return {
      appointments: [],
    }
  }
}
</script>
