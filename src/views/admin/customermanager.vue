<template>
   <div v-if="authStore.user?.role !=='Admin'">
      <notrolecomponent />
    </div>
    
  <div v-else class="p-4">
    <SearchBar v-model:search="search" @refresh="handleRefresh" />
    <!-- Table -->
    <table class="w-full table-auto border border-collapse border-gray-300">
      <thead class="bg-gray-100 text-left">
        <tr class="bg-gray-200">
          <th class="p-3 border border-gray-300">Họ và tên</th>
          <th class="p-3 border border-gray-300">Email</th>
          <th class="p-3 border border-gray-300">Quyền</th>
          <th class="p-3 border border-gray-300">Trạng thái</th>
          <th class="p-3 border border-gray-300">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedUsers" :key="user.id" class="border-t">
         <td class="p-3 border border-gray-300">{{ user.fullName }}</td>
         <td class="p-3 border border-gray-300">{{ user.email }}</td>
         <td class="p-3 border border-gray-300">{{ user.roles }}</td>
          <td class="p-3 border border-gray-300" :class="user.status === 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
            {{ user.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}
          </td>
          <td class="p-3 border border-gray-300 space-x-2">
            <button @click="openEditForm(user)" class="text-blue-500">✏️</button>
            <button @click="deleteUser(user.id)" class="text-red-500">🗑️</button>
            <button @click="viewDetail(user)" class="text-green-500">👁️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <Pagination :currentPage="currentPage" :totalPages="totalPages" @change-page="changePage" />

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-1/3 p-6">
        <h2 class="text-xl font-semibold mb-4">Chỉnh sửa người dùng</h2>
        <form @submit.prevent="submitEdit">
          <div class="mb-3">
            <label class="block mb-1">Họ và tên</label>
            <input v-model="editForm.fullName" class="w-full border rounded px-3 py-2" required readonly />
          </div>
          <div class="mb-3">
            <label class="block mb-1">Email</label>
            <input v-model="editForm.email" class="w-full border rounded px-3 py-2" required readonly />
          </div>
          <div class="mb-3">
            <label class="block mb-1">Quyền</label>
            <select v-model="editForm.roles" class="w-full border rounded px-3 py-2">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Dentist">Dentist</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="block mb-1">Trạng thái</label>
            <select v-model="editForm.status" class="w-full border rounded px-3 py-2">
              <option :value="0">Hoạt động</option>
              <option :value="1">Không hoạt động</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" @click="showEditModal = false" class="px-4 py-2 bg-gray-300 rounded">Hủy</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Lưu</button>
          </div>
        </form>
      </div>
    </div>
    <Customerdetail v-if="showDetail" :user="selectedUser" @close="closeDetail" />
  </div>
</template>

<script>
import Pagination from '../../components/paginationcomponent.vue'
import SearchBar from '../../components/searchbar.vue'
import notrolecomponent from '../../components/notrolecomponent.vue'
import { useAuthStore } from '../../store/user/authstore'
import Customerdetail from './customerdetail.vue'
import { useDentistStore } from '../../store/dentist'

export default {
  components: {
    Pagination,
    SearchBar,
    Customerdetail,
    notrolecomponent
  },
  data() {
    return {
      users: [],
      search: '',
      currentPage: 1,
      pageSize: 5,
      selectedUser: null,
      showDetail: false,
      showEditModal: false,
      editForm: {
        id: null,
        fullName: '',
        email: '',
        roles: '',
        status: 0
      }
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    filteredUsers() {
      const keyword = this.search.toLowerCase()
      if (!keyword) return this.users
      return this.users.filter(user =>
        user.fullName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      )
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredUsers.slice(start, start + this.pageSize)
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.pageSize)
    }
  },
  methods: {
    handleRefresh() {
      this.fetchUsers()
      this.search = ''
    },
    async fetchUsers() {
      const res = await this.authStore.getUserByRole("User")
      this.users = res || []
      this.currentPage = 1
    },
    viewDetail(user) {
      this.selectedUser = user
      this.showDetail = true
    },
    closeDetail() {
      this.selectedUser = null
      this.showDetail = false
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    openEditForm(user) {
      this.editForm = { ...user }
      this.showEditModal = true
    },
    async submitEdit() {
      const creatDentistForm = {
        id: null,
        UserId: this.editForm.id,
        specality: "",
        status: this.editForm.status,
      }

      try {
        await this.authStore.updateUserProfileByUserId(
          this.editForm.id,
          this.editForm.email,
          this.editForm.fullName,
          this.editForm.status
        )

        await this.authStore.updateUserRole(
          this.editForm.id,
          this.editForm.roles
        )

        if (this.editForm.roles === "Dentist") {
          await useDentistStore().adddentist(creatDentistForm)
        }

        alert("Cập nhật thành công")
        this.showEditModal = false
        this.fetchUsers()

      } catch (error) {
        console.error("Update failed", error)
      }
    },
    async deleteUser(userId) {
      if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
        await this.authStore.deleteUser(userId)
        this.fetchUsers()
      }
    }
  },
  mounted() {
    this.fetchUsers()
  }
}
</script>
