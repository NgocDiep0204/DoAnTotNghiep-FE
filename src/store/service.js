import { defineStore } from 'pinia'
import axiosClient from '../axiosClient'
import { createApp } from 'vue'
export const useServiceStore = defineStore('service', {
    state: () => ({
      services: [],
      service: "",
      dentists: [],
      dentist: "",
      appointmentsTime: [],
      appointment: "",
      appointments: [],
  
    }),
    getters: {
    },
    actions: {
        async getServices() {
            try {
                const response = await axiosClient.get('Service/GetAllServices')
                this.services = response.data.$values
                return true
            } catch (error) {
                console.error('Error fetching services:', error)
            }
        },
        async getServiceById(id) {
            try {
                const response = await axiosClient.get(`Service/GetServiceByID?id=${id}`)
                this.service = response.data

                return true
            } catch (error) {
                console.error('Error fetching service by ID:', error)
            }
        },

        async getServiceByStatus(status) {
            try {
                const response = await axiosClient.get(`Service/GetServicesByDentalStatus?status=${status}`)
                this.services = response.data.$values
                console.log(this.services)
            } catch (error) {
                console.error('Error fetching service by status:', error)
            }
        },

        async createService(service) {
          try {
            const response = await axiosClient.post('Service/AddService', service);
            console.log('Service created:', response.data);
            return true;
          } catch (error) {
            if (error.response) {
              console.error('Error creating service (Response Error):');
              console.error('Status:', error.response.status);
              console.error('Message:', error.response.data.title);
              console.error('Validation Errors:', error.response.data.errors); // 👈 Thêm dòng này
            } else if (error.request) {
              console.error('No response received:', error.request);
            } else {
              console.error('Request setup error:', error.message);
            }
            console.error('Request config:', error.config);
            return false;
          }
        },     
        async addServiceStep(serviceStep) {
          try {
            const response = await axiosClient.post('ServiceStep/CreateServiceStep', serviceStep)
            console.log('Service step created:', response.data)
            return true
          } catch (error) {
            if (error.response) {
              console.error('Error creating service step (Response Error):');
              console.error('Status:', error.response.status);
              console.error('Message:', error.response.data.title);
              console.error('Validation Errors:', error.response.data.errors); // 👈 Thêm dòng này
            } else if (error.request) {
              console.error('No response received:', error.request);
            } else {
              console.error('Request setup error:', error.message);
            }
            console.error('Request config:', error.config);
            return false;
          }
        },

        async updateService(service) {
            try {
              const response = await axiosClient.put('Service/UpdateService', service)
              console.log('Service updated:', response.data)
              await this.getServices()
              return true
            } catch (error) {
              console.error('Error updating service:', error)
              return false
            }
          },

          async updateServiceStep(serviceStep) {
            try {
              const response = await axiosClient.put('ServiceStep/UpdateServiceStep', serviceStep)
              console.log('Service step updated:', response.data)
              await this.getServices()
              return true
            } catch (error) {
              console.error('Error updating service step:', error)
              return false
            }
          },
          async deleteService(serviceId) {
            try {
              const response = await axiosClient.delete(`Service/DeleteService?id=${serviceId}`)
              console.log('Service deleted:', response.data)
              await this.getServices()
              return true
            } catch (error) {
              console.error('Error deleting service:', error)
              return false
            }
          },

          async deleteServiceStep(serviceStepId) {
            try {
              const response = await axiosClient.delete(`ServiceStep/DeleteServiceStep?id=${serviceStepId}`)
              console.log('Service step deleted:', response.data)
              return true
            } catch (error) {
              console.error('Error deleting service step:', error)
              return false
            }
          },
          
          async deleteServiceStepByServiceId(serviceId) {
            try {
              const response = await axiosClient.delete(`ServiceStep/DeleteServiceStepByIdStep?id=${serviceId}`)
              console.log('Service step deleted:', response.data)
              return true
            } catch (error) {
              console.error('Error deleting service step:', error)
              return false
            }
          },
        async getAppoinetmentTimeById(dentistId) {
            try {
              const response = await axiosClient.get(`Appointment/GetAppointmentsByDentistId?dentistId=${dentistId}`);
              this.appointmentsTime = response.data.$values;
              console.log(this.appointmentsTime);
              return this.appointmentsTime; // 👈 Thêm dòng này để component có thể dùng
            } catch (error) {
              console.error('Error fetching dentist by ID:', error);
              return []; // Trả về mảng rỗng nếu lỗi
            }
          },

          async createAppointment(appointment) {
            try {
                const response = await axiosClient.post('Appointment/CreateAppoimtment', appointment)
                console.log(response.data)
                return response.data // Trả về dữ liệu phản hồi từ API
            } catch (error) {
                console.error('Error creating appointment:', error)
            }
        },

        async createAppointmentDetail(appointmentDetail) {
            try {
                const response = await axiosClient.post(`AppointmentDetail/CreateAppointmentDetail`, appointmentDetail)
                console.log(response.data)
                return true
            } catch (error) {
                console.error('Error creating appointment detail:', error)
            }   
        },

        async getAppointments(){
          try {
          const response = await axiosClient.get('Appointment/getAppointments')
          this.appointments = response.data.$values;
          console.log("ddđoii",this.appointments)
          return this.appointments
        } catch (error) {
          console.error('eror:', error)
          }
        },

        async getAppointmentByUserId(userId) {
            try {
                const response = await axiosClient.get(`Appointment/GetAppointmentsByUserId?userId=${userId}`)
                this.appointments = response.data.result
                console.log(this.appointments )
                return true
            } catch (error) {
                console.error('Error fetching appointment by user ID:', error)
            }
        },
        async updateAppointment(update){
            try {
                const response = await axiosClient.put(`Appointment/UpdateAppoiment`, update)
                console.log(response.data)
                return true
            } catch (error) {
                console.error('Error updating appointment status:', error)
            }
        },
        async getAppoinmentByStatus(status) {
            try {
                const response = await axiosClient.get(`Appointment/getAppointmentsByStatus?status=${status}`)
                this.appointments = response.data.$values
                console.log(this.appointments )
                return true
            } catch (error) {
                console.error('Error fetching appointment by status:', error)
            }
        },

        async sendMailToUser(email, id, emailType) {
            try {
                const response = await axiosClient.post(`Appointment/SendMailToCustomer?email=${email}&id=${id}&emailType=${emailType}`)
                console.log(response.data)
                return true
            } catch (error) {
                console.error('Error sending mail to user:', error)
            }
        },

          

    }
})