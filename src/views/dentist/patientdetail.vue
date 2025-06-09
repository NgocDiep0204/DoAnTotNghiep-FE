<template>
  <!-- Overlay -->
  <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
    <!-- Popup content -->
    <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
      <!-- Nút đóng -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        title="Đóng"
      >
        ×
      </button>

      <!-- Thông tin bệnh nhân -->
      <div class="mb-6" v-if="patient">
        <h2 class="text-2xl font-semibold mb-4 border-b pb-2">Thông tin bệnh nhân</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><strong>Họ tên:</strong> {{ patient.fullName }}</div>
          <div><strong>Giới tính:</strong> {{ patient.gender }}</div>
          <div><strong>Email:</strong> {{ patient.email }}</div>
        </div>
      </div>

      <!-- Lịch sử khám -->
      <div>
        <h3 class="text-xl font-semibold mb-4 border-b pb-2">Lịch sử khám</h3>
        <div v-if="appointmentList.length">
          <table class="w-full border text-sm text-left">
            <thead class="bg-gray-100">
              <tr>
                <th class="border px-3 py-2">STT</th>
                <th class="border px-3 py-2">Ngày khám</th>
                <th class="border px-3 py-2">Ghi chú bệnh nhân</th>
                <th class="border px-3 py-2">Tình trạng</th>
                <th class="border px-3 py-2">Dịch vụ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(appt, index) in appointmentList" :key="index">
                <td class="border px-3 py-2">{{ index + 1 }}</td>
                <td class="border px-3 py-2">{{ formatDate(appt.appointmentDate) }}</td>
                <td class="border px-3 py-2">{{ appt.notes || 'Không có' }}</td>
                <td class="border px-3 py-2">{{ appt.dentistNotes || 'Không có' }}</td>
               <td class="border px-3 py-2">
  <ul
    v-if="appointmentdetail && appointmentdetail.length"
    class="list-disc pl-4"
  >
    <li
      v-for="(service, sIndex) in appointmentdetail.filter(s => s.appointmentId === appt.appointmentId)"
      :key="sIndex"
      class="text-sm text-gray-700"
    >
      {{ service.services.serviceName }} (x{{ service.quantity }})
    </li>
  </ul>
  <span
    v-else
    class="text-gray-500 italic"
  >
    Không có
  </span>
</td>

              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 italic">Chưa có lịch hẹn nào đã hoàn thành.</p>
      </div>
    </div>
  </div>
</template>


<script>
import { useServiceStore } from '../../store/service';

export default {
  name: 'PatientDetail',
  props: {
    patient: Object
  },
  emits: ['close'],
  data() {
    return {
      appointmentList: [],
      appointmentdetail: []
    };
  },
  mounted() {
    this.fetchPatientDetails();
    console.log('Mounted PatientDetail with patient:', this.patient);
  },
  methods: {
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN');
    },
    async fetchPatientDetails() {
      try {
        const response = await useServiceStore().GetPatientDetail(this.patient.customerId);
        this.appointmentList = response.$values.map(appt => ({
          ...appt,
          appointmentDate: new Date(appt.appointmentDate).toLocaleString('vi-VN'),
        }));
        this.appointmentdetail = response.$values
  .flatMap(appt => appt.appointmentDetails?.$values || []);

        console.log('Chi tiết bệnh nhân:', this.appointmentdetail);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết bệnh nhân:', error);
      }
    }
  }
};
</script>
