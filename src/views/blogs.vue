<template>
  <div class="h-screen flex">
    <!-- Ảnh bên trái -->
    <div class="w-1/6 overflow-hidden">
      <img src="/src/assets/img/phongkham1.jpg" alt="Left Image" class="w-full h-full object-cover" />
    </div>

    <!-- Nội dung cuộn ở giữa -->
     <div class="w-4/6 overflow-y-auto p-4">
      <CreatePost />
      <div class="mt-6 space-y-2">
        <PostItem v-for="post in postStore.posts" :key="post.postId" :post="post" />
      </div>
    </div>

    <!-- Ảnh bên phải -->
    <div class="w-1/6 overflow-hidden">
      <img src="/src/assets/img/phongkham2.jpg" alt="Right Image" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

<script>
import CreatePost from './createpost.vue'
import PostItem from './postitem.vue'
import { usePostStore } from '../store/post'

export default {
  components: {
    CreatePost,
    PostItem
  },
  data() {
    return {
      postStore: usePostStore()
    }
  },
  mounted() {
    this.postStore.getAllPosts().then(() => {
      console.log('Posts:', this.postStore.posts)
    })
  }
}
</script>

