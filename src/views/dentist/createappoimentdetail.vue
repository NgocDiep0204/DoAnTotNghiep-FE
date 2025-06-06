<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
      <h2 class="text-xl font-bold text-blue-700 mb-4">➕ Thêm dịch vụ</h2>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4" >
          <label class="block mb-1 font-medium text-gray-700">Tên dịch vụ</label>
          <select
            v-if="!appointmentdetail"
            v-model="form.serviceId"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option disabled value=""> Chọn dịch vụ </option>
            <option v-for="service in services" :key="service.serviceId" :value="service.serviceId">
              {{ service.serviceName }}
            </option>
          </select>

          <input type="text" v-else :value="appointmentdetail?.services?.serviceName || 'Không có serviceName'" class="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed" disabled />

          <label class="block mb-1 font-medium text-gray-700">Số lượng</label>
          <input
            v-model="form.quantity"
            type="number"
            min="1"
            placeholder="Nhập số lượng(theo số lượng răng hoặc toàn bộ )"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Thêm
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useServiceStore } from '../../store/service';
import Appointmentdetail from './appointmentdetail.vue';

export default {
  props: {
    appointmentId: {
      type: [String, Number],
      required: true
    },
    appointmentdetail: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      services: [],
      form: {
        appointmentId: '',
        serviceId: '',
        quantity: 1 
      }
    };
  },
  watch:{
    appointmentdetail: {
      immediate: true,
      handler(appointmentdetail) {
        if (appointmentdetail) {
          this.form.appointmentId = appointmentdetail.appointmentId;
          this.form.serviceId = appointmentdetail.services?.serviceId || '';
          this.form.quantity = appointmentdetail.quantity || 1;
        }
      }
    },
    services(newVal) {
    if (this.form.serviceId && newVal.length > 0) {
      const matchedService = newVal.find(s => s.serviceId === this.form.serviceId);
      if (!matchedService) {
        // Nếu không tìm thấy dịch vụ tương ứng, reset serviceId
        this.form.serviceId = '';
      }
    }
  },
  },
  computed: {
    useServices() {
      return useServiceStore();
    }
  },
  async mounted() {
    this.services = await this.useServices.getServiceByStatus(1);
  },
  methods: {
    async handleSubmit() {
      if(this.appointmentdetail) {
        await this.useServices.updateAppointmentDetail(this.form);
        alert('Cập nhật dịch vụ thành công');
         this.$emit('close');
        return;
      }else{
         if (!this.form.serviceId) {
        alert('Vui lòng chọn dịch vụ.');
        return;
      }

        this.form.appointmentId = this.appointmentId;
        const res = await this.useServices.createAppointmentDetail(this.form);

      if (res === true) {
        alert('Thêm dịch vụ thành công');

        // Lấy đối tượng dịch vụ đầy đủ theo serviceId
        const selectedService = this.services.find(s => s.serviceId === this.form.serviceId);

        // Gửi về component cha object đầy đủ bao gồm service info
        this.$emit('submit', {
          appointmentId: this.form.appointmentId,
          serviceId: this.form.serviceId,
          quantity: this.form.quantity,
          services: selectedService
        });

        // Reset form
        this.form.serviceId = '';

      } else if (res && typeof res === 'object' && res.message) {
        alert(res.message);
      } else {
        alert('Đã xảy ra lỗi không xác định.');
      }
      }

     

      // Gọi API tạo appointment detail
      
    }
  }
};
</script>
