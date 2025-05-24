<template>
  <div>
  <textarea
  v-model="commentText"
  :placeholder="replyTo ? `Trả lời ${replyTo.user?.fullName || ''}...` : 'Thêm bình luận...'"
  class="w-full border px-3 py-2 text-sm rounded focus:outline-none resize-none"
  rows="3"
  :readonly="!user?.id" 
  @click="checkLogin"
></textarea>



    <!-- Nút chọn ảnh dấu cộng -->
    <div class="mt-2 flex items-center space-x-4">
      <label
        for="fileInput"
        class="cursor-pointer w-8 h-8 flex justify-center items-center border border-gray-400 rounded text-gray-500 hover:text-blue-600 hover:border-blue-600"
        title="Thêm ảnh"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </label>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />

      <!-- Hiển thị preview ảnh nếu có -->
      <div v-if="imagePreview" class="relative w-[15%] overflow-hidden">
        <img :src="imagePreview" alt="Ảnh preview" class="object-contain rounded border" />
        <button
          @click="removeImage"
          type="button"
          class="absolute top-0 right-0 bg-white rounded-full p-1 text-red-500 hover:bg-red-100"
          title="Xóa ảnh"
        >
          &times;
        </button>
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <button
  @click="submitComment"
  :disabled="isSubmitting"
  class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {{ isSubmitting ? 'Đang gửi...' : 'Gửi' }}
</button>

      <button @click="$emit('cancel')" class="text-gray-600 text-sm hover:underline">
        Hủy
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePostStore } from '../store/post'
import { useAuthStore } from '../store/user/authstore'
const props = defineProps({
  replyTo: {
    type: Object,
    default: null
  },
   postId: {
    type: [Number, String],
    required: false
  },
 
})
const emit = defineEmits(['cancel', 'submitted'])

const authStore = useAuthStore()
const user = authStore.user
const postStore = usePostStore()
const commentText = ref('')
const selectedFile = ref(null)
const imagePreview = ref(null)
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh hợp lệ.')
    return
  }

  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  selectedFile.value = null
  imagePreview.value = null
  const input = document.getElementById('fileInput')
  if (input) input.value = ''
}

const isSubmitting = ref(false)

const submitComment = async () => {
  if (!commentText.value.trim() && !selectedFile.value) {
    alert('Vui lòng nhập nội dung hoặc chọn ảnh.')
    return
  }

  const postId = props.replyTo?.postId || props.postId
  if (!postId) {
    alert('Không xác định được bài viết.')
    return
  }

  isSubmitting.value = true

  const formData = new FormData()
  formData.append('PostId', postId)
  formData.append('UserId', user.id)
  formData.append('ParentCommentId', props.replyTo?.id || '')
  formData.append('Content', commentText.value.trim())
  if (selectedFile.value) {
    formData.append('File', selectedFile.value)
  }

  try {
    const newComment = await postStore.createComment(formData).then(() => {
      postStore.getPostByPostId(postId)
    })

    console.log('Bình luận đã được gửi:', newComment)

    // Gửi sự kiện về component cha
    emit('submitted', newComment)

    // Reset sau khi gửi
    commentText.value = ''
    removeImage()
  } catch (error) {
    console.error('Error submitting comment:', error)
    alert('Có lỗi xảy ra khi gửi bình luận.')
  } finally {
    isSubmitting.value = false
  }
}
const checkLogin = () => {
  if (!user?.id) {
    alert('Bạn phải đăng nhập để bình luận!')
  }
}



</script>


