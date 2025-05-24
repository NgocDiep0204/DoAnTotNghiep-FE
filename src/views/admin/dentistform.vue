<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded w-full max-w-md max-h-screen overflow-y-auto my-4">
      <h2 class="text-xl font-semibold mb-4">{{ dentist ? 'Cập nhật' : 'Thêm mới' }} Nha sĩ</h2>
      <form @submit.prevent="handleSubmit">
        <!-- Tên -->
        <div class="mb-3">
          <label class="block font-medium">Tên</label>
          <input v-model="form.name" class="w-full border rounded px-2 py-1" required />
        </div>

        <!-- Email -->
        <div v-if="!dentist" class="mb-3">
          <label class="block font-medium">Email</label>
          <input v-model="form.email" class="w-full border rounded px-2 py-1" required />
        </div>

        <!-- Chỉ hiển thị mật khẩu nếu là thêm mới -->
        <div v-if="!dentist" class="mb-3">
          <label class="block font-medium">Mật khẩu</label>
          <input v-model="form.password" class="w-full border rounded px-2 py-1" required />
        </div>
        <div v-if="!dentist" class="mb-3">
          <label class="block font-medium">Nhập lại mật khẩu</label>
          <input v-model="form.confirmPassword" class="w-full border rounded px-2 py-1" required />
        </div>

        <!-- Chuyên môn -->
         <div class="mb-3">
          <label class="block font-medium">Chuyên môn</label>
          <textarea v-model="form.speacialty" class="w-full border rounded px-2 py-1" required></textarea>
        </div>
        <div class="mb-3">
          <label class="block font-medium">Năm hành nghề</label>
          <input v-model="form.years" class="w-full border rounded px-2 py-1"  />
        </div>
        <div class="mb-3">
          <label class="block font-medium">Học vấn</label>
          <textarea v-model="form.education" class="w-full border rounded px-2 py-1" required ></textarea>
        </div>
        <div class="mb-3">
          <label class="block font-medium">Giới thiệu</label>
          <textarea v-model="form.introduce" class="w-full border rounded px-2 py-1"  > </textarea>
        </div>
        <div class="mb-3">
          <label class="block font-medium">Chứng chỉ</label>
          <textarea v-model="form.certificate" class="w-full border rounded px-2 py-1"  ></textarea>
        </div>

        <!-- Trạng thái -->
        <div class="mb-4">
          <label class="block font-medium">Trạng thái</label>
          <select v-model="form.status" class="w-full border rounded px-2 py-1">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2">
          <button type="button" @click="$emit('close')" class="bg-gray-300 px-4 py-1 rounded">Huỷ</button>
          <button type="submit" class="bg-green-600 text-white px-4 py-1 rounded">Lưu</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useAuthStore } from '../../store/user/authstore'
import { useDentistStore } from '../../store/dentist'
import { isValidEmail, isStrongPassword } from '../../utils/validation'

const props = defineProps(['dentist'])
const emit = defineEmits(['close', 'saved'])

const authStore = useAuthStore()
const dentistStore = useDentistStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  id: '',
  userId: '',
  speacialty: '',
  introduce: '',
  years: '',
  education: '',
  certificate: '',
  status: 'active',
})

watch(
  () => props.dentist,
  (newDentist) => {
    if (newDentist) {
      form.name = newDentist.user.fullName 
      form.email = newDentist.user.email 
      form.speacialty = newDentist.speacialty
      form.introduce = newDentist.introduce
      form.years = newDentist.years
      form.education = newDentist.education
      form.certificate = newDentist.certificate
      form.status = newDentist.status === 0 ? 'active' : 'inactive'
      form.id = newDentist.id
      form.userId = newDentist.userId
      
    } else {
      form.name = ''
      form.email = ''
      form.password = ''
      form.confirmPassword = ''
      form.speacialty = ''
      form.introduce = ''
      form.years = ''
      form.education = ''
      form.certificate = ''
      form.status = 'active'
      form.id = ''
      form.userId = ''
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  const formUpdate = {
    id: form.id,
    userId: form.userId,
    speacialty: form.speacialty,
    introduce: form.introduce,
    years: form.years,
    education: form.education,
    certificate: form.certificate,
    status: form.status === 'active' ? 0 : 1,
  }
 
  const formRegister = {
    email: form.email,  
    password: form.password,
    fullName: form.name,
    role: 'Dentist',
  }

  const formCeate = {
    id: form.id,
    userId:'',
    speacialty: form.speacialty,
    introduce: form.introduce,
    years: form.years,
    education: form.education,
    certificate: form.certificate,
    status: form.status === 'active' ? 0 : 1,
  }

  try {
    if (props.dentist) {
      await dentistStore.updatedentist(formUpdate)
      var result = await authStore.updateUserProfileByUserId(form.userId, form.email, form.name, formUpdate.status)
      if (result === true) {
        alert('Cập nhật nha sĩ thành công')
          } else {
            alert(result.message);
            return;
          }
    } else {
      if (!isValidEmail(formRegister.email)) {
        alert('Email không đúng định dạng')
        return
      }

      if (form.password !== form.confirmPassword) {
        alert('Mật khẩu không khớp')
        return
      }

      if (!isStrongPassword(formRegister.password)) {
        alert('Mật khẩu phải có đủ 6 ký tự, có chữ in hoa, in thường, số và ký tự đặc biệt!')
        return
      }

      try {
        console.log("lll",formRegister)
        const res = await authStore.register(formRegister)
        
        if (res === true) {
          formCeate.userId = authStore.userId
          await dentistStore.adddentist(formCeate)
        } else {
          alert(res.message)
          return
        }
      } catch (error) {
        console.error("Lỗi không lưu đc:", error)
        alert("Đã xảy ra lỗi không xác định")
      }
    }

    emit('saved')
    emit('close')
  } catch (err) {
    console.error(err)
    alert('Đã có lỗi xảy ra')
  }
}
</script>
