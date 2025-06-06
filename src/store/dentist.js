import { defineStore } from 'pinia'
import axiosClient from '../axiosClient'
import { createApp } from 'vue'
export const useDentistStore = defineStore('dentist', {
    state: () => ({
        dentists: [],
        dentist: "",
        activeDentists: [],
    }),
    getters: {
    },
    actions: {
        async getdentists(){
            try {
                const response = await axiosClient.get('Dentist/GetDentists')
                this.dentists = response.data.$values
                return this.dentists
            } catch (error) {
                console.error('Error fetching dentists:', error)
            }
        },
        async getdentistbyid(id){
            try {
                const response = await axiosClient.get(`Dentist/GetDentistById?id=${id}`)
                this.dentist = response.data
                return this.dentist
            } catch (error) {
                console.error('Error fetching dentist:', error)
            }
        },
        async getDentistbyStatus(){
            try {
                const response = await axiosClient.get('Dentist/GetDentistsByStatus')
                this.activeDentists = response.data
                console.log("dddd",this.activeDentists)
                return this.activeDentists
            } catch (error) {
                console.error('Error fetching dentists by status:', error)
            }
        },
        async getAppointmentBydentist(id){
            try {
                const response = await axiosClient.get(`Dentist/GetAppointmentsByDentist?dentistId=${id}`)
                return response.data.$values
            } catch (error) {
                console.error('Error fetching appointments by dentist:', error)
            }
        },
        async getDentistByUserId(userId){
            try {
                const response = await axiosClient.get(`Dentist/GetDentistsByUser?id=${userId}`)
                return response.data
            } catch (error) {
                console.error('Error fetching dentist by user ID:', error)
            }
        },
        async adddentist(dentist){
            try {
                const response = await axiosClient.post('Dentist/CreateDentist', dentist)
                if( response.status === 200){
                    return true
                }
                
            }catch (error) {
        if (error.response) {
    
          if (error.response.status === 500) {
            return { success: false, message: "Người dùng này đã được thêm mới rồi! Vui lòng chọn giá trị khác" };
          } 
        }
    
        return { success: false, message: "Lỗi không xác định khi xác minh OTP" };
      }
        },
        async updatedentist(dentist){
            try {
                const response = await axiosClient.put('Dentist/UpdateDentist', dentist)
                const index = this.dentists.findIndex(d => d.id === dentist.id)
                if (index !== -1) {
                    this.dentists[index] = response.data
                }
                return true
            } catch (error) {
                console.error('Error updating dentist:', error)
            }
        },
        async deleteDentist(id, userId){
            try {
                const response = await axiosClient.delete(`Dentist/DeleteDentist?id=${id}&userId=${userId}`)
                this.dentists = this.dentists.filter(dentist => dentist.id !== id)
                return true
            } catch (error) {
                if (error.response) {
    
          if (error.response.status === 500) {
            return { success: false, message: "Nha sĩ này có liên quan đến dữ liệu khác, không được xóa!" };
          } 
        }
    
        return { success: false, message: "Lỗi không xác định khi xác minh " };
      }
        },

        
    }
})