<template>
   <div v-if="useUser.user?.role !=='Admin'">
      <notrolecomponent />
    </div>
   
    <div v-else class="p-6">

      <div class="flex justify-between mb-4">
        <h1 class="text-2xl font-bold">Quản lý Nha sĩ</h1>

        <button @click="openForm()" class="bg-green-600 text-white px-4 py-2 rounded">
          + Thêm Nha sĩ
        </button>
      </div>
      <SearchBar v-model:search="search" @refresh="handleRefresh" />
      <table class="w-full table-auto border border-collapse border-gray-300">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="p-3 border border-gray-300">Họ tên</th>
            <th class="p-3 border border-gray-300">Email</th>
            <th class="p-3 border border-gray-300">Chuyên môn</th>
            <th class="p-3 border border-gray-300">Trạng thái</th>
            <th class="p-3 border border-gray-300">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dentist in paginatedDentists" :key="dentist.id" class="border-t">
            <td class="p-3 border border-gray-300">{{ dentist.user?.fullName }}</td>
            <td class="p-3 border border-gray-300">{{ dentist.user?.email }}</td>
            <td class="p-3 border border-gray-300">{{ dentist.speacialty }}</td>
            <td class="p-3 border border-gray-300">
              <span :class="dentist.status === 0 ? 'text-green-600' : 'text-red-500'">
                {{ dentist.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </td>
           <td class="p-3 border border-gray-300 text-center space-x-3">
                <svg @click="viewDetail(dentist)" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600 inline cursor-pointer hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>

                <svg @click="openForm(dentist)" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500 inline cursor-pointer hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-2.036a2.5 2.5 0 00-3.536 0L4 16.5V20h3.5L19 8.5a2.5 2.5 0 000-3.536z" />
                </svg>

                <svg @click="deleteDentist(dentist.id, dentist.userId)" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 inline cursor-pointer hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-1.5a1 1 0 01-1-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 01-1 1H8a1 1 0 00-1 1" />
                </svg>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :currentPage="currentPage" :totalPages="totalPages" @change-page="changePage" />

      <DentistForm v-if="showForm" :dentist="selectedDentist" @close="closeForm" @saved="fetchDentists" />
      <DentistDetail v-if="showDetail" :dentist="selectedDentist" @close="closeDetail" />
    </div>
  </template>
  
  <script>
import DentistForm from './dentistform.vue'
import DentistDetail from './dentistdetail.vue'
import Pagination from '../../components/paginationcomponent.vue'
import SearchBar from '../../components/searchbar.vue'
import notrolecomponent from '../../components/notrolecomponent.vue'
import { useDentistStore } from '../../store/dentist.js'
import { useAuthStore } from '../../store/user/authstore.js'
export default {
  components: {
    DentistForm,
    DentistDetail,
    Pagination,
    SearchBar,
    notrolecomponent
  },
  data() {
    return {
      dentists: [],               // Tất cả dentists lấy từ server
      selectedDentist: null,
      showForm: false,
      showDetail: false,
      dentistStore: useDentistStore(),
      currentPage: 1,
      pageSize: 5,
      search: ''                  // Keyword tìm kiếm
    }
  },
  mounted() {
    this.fetchDentists()
  },
  computed: {
    useUser() {
      return useAuthStore()
    },
   filteredDentists() {
  if (!Array.isArray(this.dentists)) return []
  const keyword = this.search.toLowerCase()
  if (!keyword) return this.dentists
  return this.dentists.filter(dentist =>
    dentist.user?.fullName?.toLowerCase().includes(keyword) ||
    dentist.user?.email?.toLowerCase().includes(keyword)
  )
},
   paginatedDentists() {
  const start = (this.currentPage - 1) * this.pageSize
  return Array.isArray(this.filteredDentists)
    ? this.filteredDentists.slice(start, start + this.pageSize)
    : []
},
    totalPages() {
      return Math.ceil(this.filteredDentists.length / this.pageSize)
    }
  },
  methods: {
    async fetchDentists() {
      const res = await this.dentistStore.getdentists()
      this.dentists = res
      this.currentPage = 1  
    },
    handleRefresh(){
      this.fetchDentists()
      this.search = ''
    },
    changePage(page) {
      this.currentPage = page
    },
    openForm(dentist = null) {
      this.selectedDentist = dentist
      this.showForm = true
    },
    closeForm() {
      this.selectedDentist = null
      this.showForm = false
    },
    viewDetail(dentist) {
      this.selectedDentist = dentist
      this.showDetail = true
    },
    closeDetail() {
      this.selectedDentist = null
      this.showDetail = false
    },
    async deleteDentist(id, userId) {
      if (!confirm('Bạn chắc chắn muốn xóa nha sĩ và tài khoản này?')) return
      try {
        await this.dentistStore.deleteDentist(id, userId)
        this.fetchDentists()
      } catch (err) {
        alert('Xóa thất bại!')
        console.error(err)
      }
    }
  }
}
</script>



  