<template>
  <div class="p-6 border rounded-2xl shadow-xl bg-white max-w-3xl mx-auto relative">
    <h2 class="text-3xl font-bold mb-6 border-b pb-2 text-blue-700">🦷 Chi tiết lịch hẹn</h2>

    <!-- Thông tin chính -->
    <div class="mb-6 space-y-2 text-base text-gray-700">
      <p><strong>👤 Khách hàng:</strong> {{ appointment.customers.fullName }}</p>
      <p><strong>🕒 Thời gian:</strong> {{ appointment.appointmentDate?.replace('T', ' ') }}</p>
      <p><strong>💰 Giá khám:</strong> {{ appointment.dentists?.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}</p>
      <p>
        <strong>📌 Trạng thái:</strong>
        <span class="text-white px-3 py-1 rounded-full"
              :class="{ 
                'bg-green-500': appointment.status === 1,
                'bg-yellow-500': appointment.status === 2,
              }">
          {{ returnStringStatus(appointment.status) }}
        </span>
      </p>
     <div class="flex items-center justify-between mb-4">
  <strong class="w-1/4">📝 Tình trạng:</strong>

  <!-- Input nếu đang sửa, hoặc hiển thị ghi chú -->
  <div class="w-2/4">
    <Textarea
      v-if="editingNote"
      v-model="editedNote"
      type="text"
      class="w-full border rounded px-2 py-1 text-sm"
    ></Textarea>
    <p v-else class="truncate italic text-gray-500">
      {{ appointment.dentistNotes || 'Không có' }}
    </p>
  </div>

  <!-- Nút thao tác -->
  <div class="w-1/4 text-right space-x-2">
    <template v-if="editingNote">
      <button
        @click="saveNote"
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
      >
        Lưu
      </button>
      <button
        @click="cancelEditNote"
        class="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
      >
        Hủy
      </button>
    </template>
    <button
      v-else
      @click="startEditNote"
      class="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
    >
      Sửa tình trạng
    </button>
  </div>
</div>
      <p><strong>📝 Ghi chú bệnh nhân:</strong> <span class="italic text-gray-500">{{ appointment.Notes || 'Không có' }}</span></p>
    </div>

    <!-- Nút thêm dịch vụ -->
    <div  class="flex justify-end mb-4">
      <button
         @click="click(appointment.status)"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
      >
        ➕ Thêm dịch vụ
      </button>
    </div>

    <!-- Bảng chi tiết -->
    <div v-if="appointment.appointmentDetails.$values && appointment.appointmentDetails.$values.length" class="overflow-x-auto">
      <h3 class="text-xl font-semibold mb-3 border-b pb-1">🧾 Các dịch vụ</h3>
      <table class="min-w-full text-sm text-left border border-gray-300 rounded-lg">
        <thead class="bg-gray-100 text-gray-700 uppercase tracking-wider">
          <tr>
            <th class="border px-4 py-2">STT</th>
            <th class="border px-4 py-2">Dịch vụ</th>
            <th class="border px-4 py-2">Số lượng</th>
            <th class="border px-4 py-2">Giá</th>
            <th class="border px-4 py-2">Tổng tiền</th>
            <th class="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
         <tr
            v-for="(item, index) in (appointmentDetails).filter(i => i && i.services)"
            :key="index"
            class="hover:bg-gray-50"
            >
            <td class="border px-4 py-2">{{ index + 1 }}</td>
            <td class="border px-4 py-2">{{ item.services?.serviceName }}</td>
            <td class="border px-4 py-2">{{ item.quantity }}</td>
            <td class="border px-4 py-2">{{ item.services?.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}</td>
            <td class="border px-4 py-2">
                {{ (item.services?.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }}
            </td>
            <td class="border px-4 py-2 flex justify-center">
                <button
                  @click="openEdit(item, appointment.status)"
                  class="text-blue-600 hover:text-blue-800 border border-gray-300 px-3 py-1 rounded transition-colors mr-2"
                >
                  Sửa
                </button>

                 <button
                  @click="deleteDetail(appointment.appointmentId, item.services.serviceId, index, appointment.status)"
                  class="text-red-600 hover:text-red-800 border border-gray-300 px-3 py-1 rounded transition-colors"
                >
                  Xóa
                </button>
            </td>
            </tr>

        </tbody>
      </table>
    </div>
    <div v-else class="text-gray-500 text-center mt-4">
      Không có dịch vụ nào được thêm vào lịch hẹn này.
    </div>
    <!-- Tổng tiền -->
    <div class="mt-4 text-lg font-semibold">
      <span class="text-gray-700">Tổng tiền: </span>
      <span class="text-blue-600">
  {{
    (
      appointmentDetails.reduce(
        (total, item) => total + (item.services?.price * item.quantity || 0),
        0
      ) + (appointment.dentists?.price || 0)
    ).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }}
</span>

    </div>
    <!-- Nút quay lại -->
    <div class="mt-6 flex justify-end">
      <button
        @click="$emit('close')"
        class="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded transition-colors"
      >
        ← Quay lại danh sách
      </button>
    </div>

    <!-- Popup thêm dịch vụ -->
    <createappointmentdetail
        v-if="showAddService"
        :appointmentId="appointment.appointmentId"
        :appointmentdetail="selectedAppointmentDetail"
        @close="showAddService = false"
        @submit="fetchappointmentDetails"
        />
  </div>
</template>

<script>
import { returnStringStatus } from '../../utils/returnString';
import createappointmentdetail from './createappoimentdetail.vue';
import { useServiceStore } from '../../store/service';
export default {
  components: {
    createappointmentdetail,
  },
  props: {
    appointment: {
      type: Object,
      required: true,
    }
  },
  watch: {
    appointment: {
      handler(newVal) {
        if (newVal && newVal.appointmentDetails && !newVal.appointmentDetails.$values) {
          newVal.appointmentDetails.$values = [];
        }
      },
      immediate: true,
    },
    appointmentDetails: {
      handler(newVal) {
        if (newVal && !newVal.$values) {
          newVal.$values = [];
        }
      },
      immediate: true,
    },
  },
  emits: ['close', 'remove-service', 'submit'],
  data() {
    return {
      appointmentDetails: [],
      showAddService: false,
      editingNote: false,
      editedNote: '',
      selectedAppointmentDetail: null,
    };
  },
    computed: {
    useServices() {
        return useServiceStore();
        },
    },
    async mounted() {
      await this.fetchappointmentDetails();
      
    },
  methods: {
    async fetchappointmentDetails() {
      this.appointmentDetails = await this.useServices.getAppointmentDetailByAppointmentId(this.appointment.appointmentId);
    },
    canModify(status) {
  if (status === 2) {
    alert('Lịch hẹn đã hoàn thành, không thể chỉnh sửa.');
    return false;
  }
  if (status === 3) {
    alert('Lịch hẹn đã hủy, không thể chỉnh sửa.');
    return false;
  }
  return true;
},
     openEdit(item, status) {
      if (!this.canModify(status)) return;
    this.selectedAppointmentDetail = item;
         
         this.showAddService = true;

    },


    returnStringStatus,
    handleAddOrUpdateDetail(detail) {
  let appointmentDetails = this.appointment.appointmentDetails.$values;

  const index = appointmentDetails.findIndex(d => d.serviceId === detail.serviceId);

  if (index !== -1) {
    appointmentDetails.splice(index, 1, detail);
  } else {
    appointmentDetails.push(detail);
  }
  console.log('Chi tiết lịch hẹn sau khi thêm/cập nhật:', appointmentDetails);
  this.showAddService = false; // Đóng popup thêm dịch vụ
},
    click(status){
        if (!this.canModify(status)) return;
        this.selectedAppointmentDetail = null; 
            this.showAddService = true;
    },
    async deleteDetail(appointment, service, index, status) {
        if (!this.canModify(status)) return;
        
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
          return;
        }
        var appointmentDetailDelete = {
            appointmentId: appointment,
            serviceId: service,
        }
        console.log('Xóa dịch vụ:', appointmentDetailDelete);
        await this.useServices.deleteAppointmentDetail(appointmentDetailDelete)
          .then(() => {
            this.$emit('remove-service', index);
            alert('Xóa dịch vụ thành công');
            this.fetchappointmentDetails(); 
          })
          .catch((error) => {
            console.error('Lỗi khi xóa dịch vụ:', error);
            alert('Không thể xóa dịch vụ này.');
          });
      
    },
    startEditNote() {
    this.editingNote = true;
    this.editedNote = this.appointment.dentistNotes || '';
  },
  cancelEditNote() {
    this.editingNote = false;
    this.editedNote = '';
  },
  async saveNote() {
    var update =  {
      appointmentId: this.appointment.appointmentId,
      dentistId: this.appointment.dentists?.dentistId,
      dentistNotes: this.editedNote,
      status: this.appointment.status,
    }
    try {
      await this.useServices.updateAppointment(update);

      this.appointment.dentistNotes = this.editedNote;
      this.$emit('submit', update);
      this.editingNote = false;
      alert('Đã lưu ghi chú');
    } catch (error) {
      console.error('Lỗi khi lưu ghi chú:', error);
      alert('Không thể lưu ghi chú.');
    }
  }
  },
};
</script>
