<template>
  <div>
    <!-- Nút mở modal -->
    <div v-if="user" @click="isOpen = true" class="flex items-start space-x-2 px-3 py-2 w-fit max-w-md">
  <!-- Avatar -->
  <img
    :src="user.imageUrl"
    alt="Avatar"
    class="w-8 h-8 rounded-full object-cover"
  />

  <!-- Bong bóng tin nhắn -->
  <div class="bg-white px-4 py-2 rounded-3xl text-sm w-[600px] shadow-md">
    <p class="text-gray-800">
      <span class="font-medium text-gray-700">{{ user.fullName }} ơi,</span> hãy chia sẻ cảm nhận của bạn về chúng tôi với mọi người nhé!
    </p>
  </div>
</div>

    <!-- Popup modal -->
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white w-[500px] rounded-xl shadow-xl max-h-[90vh] overflow-y-auto p-4 relative">
        <!-- Nút đóng -->
        <button @click="isOpen = false" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">&times;</button>

        <!-- Nội dung form -->
        <div class="space-y-4" v-if="user">
          <!-- Thông tin người dùng -->
          <div class="flex items-center space-x-3">
            <img :src="user.imageUrl" class="w-10 h-10 rounded-full" />
            <div>
              <p class="font-semibold">{{ user.fullName }}</p>
            </div>
          </div>

          <!-- Nhập nội dung -->
          <textarea v-model="postContent" rows="4" placeholder="Hãy chia sẻ cảm nhận của bạn về chúng tôi với mọi người nhé!"
            class="w-full p-3 border rounded resize-none"></textarea>

          <!-- Layout ảnh -->
          <div v-if="imagePreviews.length" class="grid grid-cols-3 gap-1 rounded overflow-hidden">
            <template v-for="(img, index) in displayImages" :key="index">
              <div class="relative">
                <img :src="img" class="w-full h-28 object-cover" />
                <div v-if="isLastIndex(index)"
                  class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-xl font-bold">
                  +{{ imagePreviews.length - 5 }}
                </div>
              </div>
            </template>
          </div>

          <!-- Chọn ảnh -->
          <label class="block cursor-pointer bg-gray-100 hover:bg-gray-200 rounded px-3 py-2 text-sm text-center text-gray-600">
            📷 Thêm ảnh
            <input type="file" multiple accept="image/*" class="hidden" @change="onFileChange" />
          </label>

          <!-- Nút đăng -->
          <button @click="PostStatus" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Đăng</button>
        </div>
      </div>


      <!-- Overlay loading -->
<div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
  <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
    </path>
  </svg>
</div>



    </div>
  </div>
</template>
<script>
import { useAuthStore } from '../store/user/authstore'
import { usePostStore } from '../store/post'
export default {
  data() {
    return {
      isOpen: false,
      postContent: '',
      imagePreviews: [],
      imageFiles: [],
      isLoading: false,
    }
  },

  computed: {
    authStore() {
      return useAuthStore()
    },
    user() {
      return this.authStore.user
    },
    postStore() {
      return usePostStore()
    },
    displayImages() {
      return this.imagePreviews.length > 5
        ? this.imagePreviews.slice(0, 5)
        : this.imagePreviews
    }
  },
  methods: {
    onFileChange(event) {
      const files = Array.from(event.target.files)

      files.forEach(file => {
        this.imagePreviews.push(URL.createObjectURL(file))  
        this.imageFiles.push(file)                          
      })
    },
    isLastIndex(index) {
      return this.imagePreviews.length > 5 && index === 4
    },

   async PostStatus() {
  const postData = {
    userId: this.user.id,
    content: this.postContent,
  }

  this.isLoading = true // Bắt đầu loading

  try {
    const createdPost = await this.postStore.createPost(postData)

    for (const file of this.imageFiles) {
      const formData = new FormData()
      formData.append('File', file)
      formData.append('PostId', createdPost.postId)
      await this.postStore.createPostImage(formData)
    }

    // Reset UI
    await this.postStore.getAllPosts()
    this.postContent = ''
    this.imagePreviews = []
    this.imageFiles = []
    this.isOpen = false
     this.$toast.success("Đăng bài thành công!", {
      timeout: 3000,
      position: "top-right",
    })

  } catch (error) {
    console.error('Error creating post:', error)
    this.$toast.error('Đăng bài thất bại!')
  } finally {
    this.isLoading = false // Kết thúc loading
  }
}

  },
  mounted(){
  }
}
</script>
