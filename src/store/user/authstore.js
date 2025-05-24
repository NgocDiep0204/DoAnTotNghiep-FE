import { defineStore } from 'pinia'
import axiosClient from '../../axiosClient'
import router from '../../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user : null,
    token: null,
    otp: sessionStorage.getItem('otp'),
    email :sessionStorage.getItem('email'),
    userId: null,

  }),
  getters: {
    isLogin: (state) => !!state.token
  },
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    removeToken(token){
      this.token = null
      localStorage.removeItem('token')
    },

    async register(request){
      try {
        const response = await axiosClient.post(`Authentication/Register`, request);
        if( response.status === 200){
          this.userId = response.data.userId
         // console.log("User ID:", this.userId); // Debug
          return true
        }
      } catch (error) {
        if (error.response) {
          console.error("Lỗi khi xác minh OTP:", error.response);
    
          if (error.response.status === 400) {
            return { success: false, message: "Email đã tồn tại hoặc ko hợp lệ!" };
          } 
        }
      }
    },

    async getUser(){
      try {
        const response = await axiosClient.get('ApplicationUser/GetUserProfile');
        this.user = response.data;
        console.log('User info:', this.user);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },

    async updateUserProfile(updatedUser, file) {
      const formData = new FormData();
      formData.append("fullName", updatedUser.fullName);
      formData.append("gender", updatedUser.gender); 
      if (file) {
        formData.append("FormFile", file); 
      }
      console.log("FormData:", updatedUser); // Debug
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      try {
        const response = await axiosClient.put(`ApplicationUser/UpdateUserProfile`, formData);
        if (response.status === 200) {
          // Gọi lại userStore.getUserById nếu bạn có
          return true;
        } else {
          console.error("Lỗi cập nhật:", response.data.StatusMessage);
          return false;
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        return false;
      }
    },

    async updateUserProfileByUserId(id, email, fullname, status) {
      try{
        const response = await axiosClient.put(`ApplicationUser/UpdateUserById?id=${id}&email=${email}&fullname=${fullname}&status=${status}`);
        if (response.status === 200) {
          return true;
        } else {
          console.error("Lỗi cập nhật:", response.data.StatusMessage);
          return false;
        }
      }catch (error) {
        if (error.response) {
    
          if (error.response.status === 409) {
            return { success: false, message: "Email đã được sử dụng!" };
          } else if (error.response.status === 400) {
            return { success: false, message: "Không tìm thấy người dùng" };
          }
        }
    
        return { success: false, message: "Lỗi không xác định khi xác minh OTP" };
      }
     
    },

    async getUserByRole(role){
      try {
        const response = await axiosClient.get(`ApplicationUser/GetUserByRole?role=${role}`);
        if (response.status === 200) {
          console.log("Danh sách người dùng:", response.data.$values); // Debug
          return response.data.$values; // Trả về danh sách người dùng
        } else {
          console.error("Lỗi lấy danh sách người dùng:", response.data.StatusMessage);
          return null;
        }
      } catch (error) {
        console.error("Error fetching user list:", error);
        return null;
      }
    },
    
    async updateUserRole(id, role){
      const response = await axiosClient.put(`ApplicationUser/UpdateUserRole?id=${id}&role=${role}`)
      if (response.status === 200) {
        return true;
      } else {
        console.error("Lỗi cập nhật:", response.data.StatusMessage);
        return false;
      }
    },

    saveEmail(email){
      this.email = email
      sessionStorage.setItem('email', email);
    },
    saveOtp(otp){
      this.otp = otp
    },
    async sendResetRequest(email){
      try {
        const response = await axiosClient.post(`Authentication/SendOtp?email=${email}`);
      } catch (error) {
        console.error('Error sending reset request:', error);
      }
    },
    async verifyOtp(otp, email) {
      try {
        console.log("Email trước khi gửi request:", email); // Debug
        console.log("OTP trước khi gửi request:", otp); // Debug
    
        const response = await axiosClient.post(
          `Authentication/VerifyOtp?userEmail=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
        );
    
        console.log("Response:", response); // Debug
    
        if (response.status === 200) {
          this.otp = otp; // Lưu OTP vào state
          sessionStorage.setItem('otp', otp);
          return true;
        }
      } catch (error) {
        if (error.response) {
          console.error("Lỗi khi xác minh OTP:", error.response);
    
          if (error.response.status === 400) {
            return { success: false, message: "Mã OTP không hợp lệ" };
          } else if (error.response.status === 410) {
            return { success: false, message: "OTP đã hết hạn" };
          }
        }
    
        return { success: false, message: "Lỗi không xác định khi xác minh OTP" };
      }
    },
    
    async resetPassword(password) {
      console.log(password);
      try {
        const response = await axiosClient.post(`Authentication/ResetPassword`, password);
        console.log(response);
        
        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        // Hiển thị lỗi chi tiết
        if (error.response) {
          // Lỗi từ phía server (4xx, 5xx)
          console.error("Server Error:", error.response.data);
          alert(`Lỗi từ server: ${error.response.data.message || "Có lỗi xảy ra"}`);
        } else if (error.request) {
          // Không nhận được phản hồi từ server
          console.error("No Response from Server:", error.request);
          alert("Không nhận được phản hồi từ server. Vui lòng thử lại!");
        } else {
          // Lỗi khi tạo request
          console.error("Request Error:", error.message);
          alert(`Lỗi không xác định: ${error.message}`);
        }
      }
    },

    async changePassword(password) {
      try {
        const response = await axiosClient.post(`Authentication/ChangePassword`, password);
        console.log("Response:", response);
        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        if(error.response){

    
        if (error.response.status === 400) {
          return { success: false, message: "Mật khẩu hiện tại không đúng" };
        }
      }}
    
      return { success: false, message: "Lỗi không xác định khi đổi mật khẩu" };
    },
    async deleteUser(id){
      try {
        const response = await axiosClient.delete(`ApplicationUser/DeleteUser?id=${id}`);
        if (response.status === 200) {
          return true;
        } else {
          console.error("Lỗi xóa người dùng:", response.data.StatusMessage);
          return false;
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        return false;
      }
    }
    
    
  }
})
