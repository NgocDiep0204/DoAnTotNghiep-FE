<template>
  <div v-if="authStore.user?.role !== 'Admin'">
    <notrolecomponent />
  </div>

  <div v-else class="p-4">
    <div class="flex justify-end mb-4">
  <button @click="openCreate()" class="px-4 py-2 bg-green-600 text-white rounded">+ Thêm tài khoản</button>
    </div>
    <SearchBar v-model:search="search" @refresh="handleRefresh" />

    <!-- Table -->
    <table class="w-full table-auto border border-collapse border-gray-300">
      <thead class="bg-gray-100 text-left">
        <tr class="bg-gray-200">
          <th class="p-3 border border-gray-300">Họ và tên</th>
          <th class="p-3 border border-gray-300">Email</th>
          <th class="p-3 border border-gray-300">Vai trò</th>
          <th class="p-3 border border-gray-300">Trạng thái</th>
          <th class="p-3 border border-gray-300">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedUsers" :key="user.id" class="border-t">
          <td class="p-3 border border-gray-300">{{ user.fullName }}</td>
          <td class="p-3 border border-gray-300">{{ user.email }}</td>
          <td class="p-3 border border-gray-300">{{ returnString(user.roles) }}</td>
          <td class="p-3 border border-gray-300" :class="user.status === 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
            {{ user.status === 0 ? 'Hoạt động' : 'Không hoạt động' }}
          </td>
          <td class="p-3 border border-gray-300 space-x-2">
            <button @click="openEdit(user)" class="text-blue-500">✏️</button>
            <button @click="deleteUser(user.id)" class="text-red-500">🗑️</button>
            <button @click="viewDetail(user)" class="text-green-500">👁️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <Pagination :currentPage="currentPage" :totalPages="totalPages" @change-page="changePage" />
    <Customerdetail v-if="showDetail" :user="selectedUser" @close="closeDetail" />
    <usercreateform v-if="showCreateModal" :user="selectedUser" @close="showCreateModal = false" @created="handleUserCreated" />
  </div>
</template>
<script>
import Pagination from '../../components/paginationcomponent.vue'
import SearchBar from '../../components/searchbar.vue'
import notrolecomponent from '../../components/notrolecomponent.vue'
import { useAuthStore } from '../../store/user/authstore'
import Customerdetail from './customerdetail.vue'
import { useDentistStore } from '../../store/dentist'
import usercreateform from './usercreateform.vue'
export default {
  components: {
    Pagination,
    SearchBar,
    Customerdetail,
    notrolecomponent,
    usercreateform
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
      showCreateModal: false,
      editForm: {
        id: null,
        fullName: '',
        email: '',
        roles: '',
        status: 0
      },
      createForm: {
        fullName: '',
        email: '',
        password: '',
        roles: 'User'
      }
    }
  },
  computed: {
     isEditMode() {
    return this.selectedUser !== null
  },
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
    returnString(str){
      if(str == 'Dentist'){
        return 'Nha sĩ'
      } else if(str == 'Admin'){
        return 'Quản trị viên'
      } else if(str == 'User'){
        return 'Bệnh nhân'
      }
    },
    openCreate() {
      this.selectedUser = null
      this.showCreateModal = true
    },
     openEdit(user) {
      this.selectedUser = user
      this.showCreateModal = true
    },
    handleRefresh() {
      this.fetchUsers()
      this.search = ''
    },
    async fetchUsers() {
      const res = await this.authStore.getAllUser()
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
       var res =  await this.authStore.deleteUser(userId)
       if(res === true) {
          alert("Xóa người dùng thành công")
        } else {
          alert(res.message)
          return
        }
        this.fetchUsers()
      }
    },
     async handleUserCreated() {
        this.fetchUsers()
        if (this.isEditMode) {
    this.showCreateModal = false
  }
    }
  },
  mounted() {
    this.fetchUsers()
  }
}
</script>
`
