<template>
  <div v-if="authStore.user?.role !=='Admin'">
      <notrolecomponent />
    </div>
  
  <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Form thêm hoặc sửa dịch vụ -->
    <div class="bg-white shadow p-4 rounded">
      <h2 class="text-xl font-semibold mb-4">{{ isEdit ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới' }}</h2>
      <div class="grid grid-cols-2 gap-4">
        <input
          v-model="form.serviceName"
          placeholder="Tên dịch vụ"
          class="input"
          :disabled="loading"
        />
        <input
          v-model.number="form.duration"
          placeholder="Thời gian (phút)"
          type="number"
          min="1"
          class="input"
          :disabled="loading"
        />
        <select v-model="form.status" class="input" :disabled="loading">
          <option :value="0">Không hoạt động</option>
          <option :value="1">Hoạt động</option>
        </select>
        <label
          class="input flex items-center justify-between cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          <span class="text-gray-500" v-if="!form.imgService">Chọn ảnh dịch vụ...</span>
          <span v-else class="text-green-600">Đã chọn ảnh</span>
          <input
            type="file"
            @change="onFileChange"
            accept="image/*"
            class="hidden"
            :disabled="loading"
          />
        </label>

        <!-- Hiển thị ảnh đã chọn -->
        <img
          v-if="form.imgService"
          :src="form.imgService"
          alt="Hình ảnh dịch vụ"
          class="w-16 h-16 object-cover rounded border mt-2"
        />

        <textarea
          v-model="form.serviceDescription"
          placeholder="Mô tả"
          class="col-span-2 input"
          :disabled="loading"
        ></textarea>

        <textarea
          v-model="form.benefit"
          placeholder="Lợi ích"
          class="col-span-2 input"
          :disabled="loading"
        ></textarea>
      </div>

      <div class="mt-4 flex justify-between gap-2">
        <button
          @click="handleSubmit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          {{ loading ? (isEdit ? 'Đang cập nhật...' : 'Đang thêm...') : (isEdit ? 'Cập nhật' : 'Thêm') }}
        </button>
        <button
          v-if="isEdit"
          @click="resetForm"
          class="btn btn-secondary w-full"
          :disabled="loading"
        >
          Hủy
        </button>
      </div>
    </div>

    <!-- Bảng danh sách dịch vụ -->
    <div class="bg-white shadow p-4 rounded">
      <h2 class="text-xl font-semibold mb-4">Danh sách dịch vụ</h2>
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-1 text-left">Tên</th>
            <th class="p-1 text-center">Thời gian</th>
            <th class="p-1 text-center">Trạng thái</th>
            <th class="p-1 text-center">Hình ảnh</th>
            <th class="p-1 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="svc in paginatedServices" :key="svc.serviceId" class="border-b">
            <td class="p-2">{{ svc.serviceName }}</td>
            <td class="p-2 text-center">{{ svc.duration }} phút</td>
            <td class="p-2 text-center">
              <span :class="svc.status === 1 ? 'text-green-600' : 'text-red-600'">
                {{ svc.status === 1 ? 'Hoạt động' : 'Ẩn' }}
              </span>
            </td>
            <td class="p-2 text-center">
              <img
                :src="svc.imgService"
                alt="ảnh dịch vụ"
                class="w-16 h-16 object-cover rounded border mx-auto"
              />
            </td>
            <td class="p-2 text-center whitespace-nowrap">
              <div class="inline-flex space-x-1 justify-center">
                <button @click="editService(svc)" class="rounded-md p-1 bg-yellow-400 hover:bg-yellow-500">
                  Sửa
                </button>
                <button @click="deleteService(svc.serviceId)" class="rounded-md p-1 bg-red-400 hover:bg-red-500">
                  Xóa
                </button>
                <button @click="viewDetail(svc)" class="rounded-md p-1 bg-blue-500 hover:bg-blue-600">
                  Xem
                </button>
                <button @click="openServiceStep(svc)" class="rounded-md p-1 bg-purple-500 hover:bg-purple-600">
                  Thêm QT
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @change-page="changePage"
        />
      </div>
    </div>

    <!-- Popup chi tiết dịch vụ -->
    <servicedetail v-if="showDetail" :service="selectedService" @close="closeDetail" />

    <!-- Popup thêm quy trình dịch vụ -->
    <servicestep
      v-if="showForm"
      :service="selectedService"
      @close="closeServiceStep"
      @saved="serviceStore.getServices"
    />
  </div>
</template>

<script>
import { useServiceStore } from '../../store/service.js'
import { useAuthStore } from '../../store/user/authstore'
import Pagination from '../../components/paginationcomponent.vue'
import notrolecomponent from '../../components/notrolecomponent.vue'
import servicedetail from './servicedetail.vue'
import servicestep from './servicestep.vue'

export default {
  components: { Pagination, servicedetail, servicestep, notrolecomponent },

  data() {
    return {
      form: {
        serviceId: "id",
        serviceName: '',
        serviceDescription: '',
        benefit: '',
        price: 0,
        status: 1,
        duration: '',
        imgService: '',
      },
      imageFile: null,
      isEdit: false,
      loading: false,
      currentPage: 1,
      servicesPerPage: 5,
      showDetail: false,
      selectedService: null,
      showForm: false,
    }
  },

  computed: {
    
    authStore() {
      return useAuthStore()
    },
    serviceStore() {
      return useServiceStore()
    },

    services() {
      return this.serviceStore.services
    },

    totalPages() {
      return Math.ceil(this.services.length / this.servicesPerPage)
    },

    paginatedServices() {
      const start = (this.currentPage - 1) * this.servicesPerPage
      return this.services.slice(start, start + this.servicesPerPage)
    }
  },

  methods: {
    changePage(page) {
      this.currentPage = page
    },

    onFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.imageFile = file
        this.form.imgService = URL.createObjectURL(file)
      }
    },

    resetForm() {
      this.form = {
        serviceId: "id",
        serviceName: '',
        serviceDescription: '',
        benefit: '',
        price: 0,
        status: 1,
        duration: '',
        imgService: '',
      }
      this.imageFile = null
      this.isEdit = false
      this.loading = false
    },

    async handleSubmit() {
      if (!this.form.serviceName || !this.form.duration) {
        alert('Vui lòng điền đầy đủ tên dịch vụ và thời gian!')
        return
      }
      this.loading = true
      try {
        const formData = new FormData()
        if (this.form.serviceId) formData.append('ServiceId', this.form.serviceId)
        formData.append('ServiceName', this.form.serviceName)
        formData.append('ServiceDescription', this.form.serviceDescription)
        formData.append('Benefit', this.form.benefit)
        formData.append('Price', this.form.price)
        formData.append('Status', this.form.status)
        formData.append('Duration', this.form.duration)

        if (this.imageFile) {
          formData.append('FormFile', this.imageFile)
        }

        if (this.isEdit) {
          await this.serviceStore.updateService(formData)
          alert('Cập nhật dịch vụ thành công!')
        } else {
          await this.serviceStore.createService(formData)
          alert('Thêm dịch vụ thành công!')
        }
        this.resetForm()
        await this.serviceStore.getServices()
      } catch (error) {
        alert('Có lỗi xảy ra, vui lòng thử lại.')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    editService(svc) {
      this.isEdit = true
      this.imageFile = null
      this.form = {
        serviceId: svc.serviceId,
        serviceName: svc.serviceName,
        serviceDescription: svc.serviceDescription,
        benefit: svc.benefit,
        price: svc.price,
        status: svc.status,
        duration: svc.duration,
        imgService: svc.imgService,
      }
    },

    async deleteService(id) {
      if (confirm('Bạn có chắc muốn xóa dịch vụ này không?')) {
        this.loading = true
        try {
          await this.serviceStore.deleteService(id)
          alert('Xóa dịch vụ thành công!')
          await this.serviceStore.getServices()
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1
          }
        } catch (error) {
          alert('Xóa thất bại!')
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    viewDetail(svc) {
      this.selectedService = svc
      this.showDetail = true
    },

    closeDetail() {
      this.showDetail = false
      this.selectedService = null
    },

    openServiceStep(svc) {
      this.selectedService = svc
      this.showForm = true
    },

    closeServiceStep() {
      this.showForm = false
      this.selectedService = null
    },
  },

  mounted() {
    this.serviceStore.getServices()
  }
}
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  padding: 0.4rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}
.input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-primary {
  background-color: #3b82f6;
  color: white;
}
.btn-primary:hover {
  background-color: #2563eb;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background-color: #4b5563;
}
</style>
