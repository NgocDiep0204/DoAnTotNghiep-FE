<template>
     <div v-if="authStore.user?.role !=='Dentist'">
      <notrolecomponent />
    </div>
    
  <div v-else class="flex h-screen">
    <Sidebar :menu="menu" @changeComponent="current = $event" />

    <div class="flex-1 p-6 overflow-y-auto">
      <component :is="current" />
    </div>
  </div>
</template>

<script>
import Sidebar from './sidebar.vue'
import Dashboard from './dashboard.vue'
import AppointmentManager from './appointmentmanager.vue'
import Profile from './profile.vue'
import Patient from './patient.vue'
import notrolecomponent from '../../components/notrolecomponent.vue'
import { useAuthStore } from '../../store/user/authstore'

export default {
  components: {
    Sidebar,
    Dashboard,
    AppointmentManager,
    Profile,
    Patient,
    notrolecomponent
  },
  data() {
    return {
      current: 'Dashboard',
      menu: [
        { name: 'Dashboard', label: 'Trang chủ' },
        { name: 'AppointmentManager', label: 'Lịch hẹn' },
        { name: 'Patient', label: 'Quản lý bệnh nhân' },
        { name: 'Profile', label: 'Thông tin cá nhân' },
      ]
    }
    
  },
  computed:{
    authStore(){
        return useAuthStore();
    }
  },
}
</script>
