  <template>
    <div class="bg-white p-4 rounded-2xl shadow mb-4">
      <!-- Thông tin người đăng -->
      <div class="flex items-center gap-2 mb-2">
        <div class=" rounded-full w-8 h-8"> 
          <img
          :src="post.user.imageUrl"
          alt="Avatar"
          class="w-8 h-8 rounded-full object-cover"
        />
      </div>
        <div class=""><p class=" text-sm font-semibold">{{ post.user.fullName }}</p>
        <p class="text-xs text-gray-500">{{ formatTime(post.createdAt) }}</p>
        </div>

      </div>

      <!-- Nội dung bài viết -->
      <p class="mb-2 whitespace-pre-line">{{ post.content }}</p>

      <!-- Hiển thị ảnh nếu có -->
      <PostImages v-if="post.imagePosts.$values && post.imagePosts.$values.length > 0" :images="post.imagePosts.$values" />
       <!-- Danh sách bình luận -->
      
      <!-- Nút bình luận -->
      <button @click="toggleComments" class="text-blue-500 mt-3 text-sm hover:underline">
        {{ showComments ? 'Ẩn bình luận' : 'Bình luận' }}
      </button>
      <CommentList
        v-if="showComments && post.postId"
        :postId="post.postId"
        class="mt-2"
      /> 
      
    </div>
  </template>

  <script setup>
import { onMounted, ref } from 'vue'
import CommentList from './commentlist.vue'
import PostImages from './imagepost.vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

// Khai báo props
const props = defineProps({
  post: Object
})

const showComments = ref(false)

const toggleComments = () => {
  showComments.value = !showComments.value
}

dayjs.extend(relativeTime)
dayjs.locale('vi')

const formatTime = (time) => {
  return dayjs(time).fromNow()
}

onMounted(() => {
})
</script>
