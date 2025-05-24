<template>
  <div class="space-y-4">
    <div v-if="topLevelComments.length === 0" class="text-gray-500 italic">
      Không có bình luận
    </div>

    <CommentItem
      v-for="(c, index) in topLevelComments"
      :key="c.id + '-' + index"
      :comment="c"
      :comments="comments"
      :onCommentSubmitted="onCommentSubmitted"
      :expandedCommentIds="expandedCommentIds"
      :toggleReplies="toggleReplies"
      :isExpanded="isExpanded"
    />

    <div class="mt-6">
      <ReplyForm :replyTo="null" :postId="postId" @submitted="onCommentSubmitted" />
    </div>
  </div>
</template>

<script>
import ReplyForm from './replyform.vue'
import CommentItem from './commentitem.vue'
import { usePostStore } from '../store/post'
import { useAuthStore } from '../store/user/authstore'
export default {
  name: 'Comments',
  components: { ReplyForm, CommentItem },
  props: {
    postId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      expandedCommentIds: new Set(),
      postStore: usePostStore()
    }
  },
  computed: {
    comments() {
      return this.postStore.commentsByPostMap[this.postId] || []
    },
    topLevelComments() {
      return this.comments.filter(c => !c.parentCommentId)
    },
    authStore() {
      return useAuthStore()
    },
  },
  methods: {
    fetchComments() {
      this.postStore.getPostByPostId(this.postId)
    },
   onCommentSubmitted(newComment) {
      if (newComment) {
        if (!this.postStore.commentsByPostMap[this.postId]) {
          this.postStore.commentsByPostMap[this.postId] = []
        }

        // 🛠️ Gán user nếu chưa có
        // if (!newComment.user) {
        //   newComment.user = this.authStore.user 
        // }

        this.postStore.commentsByPostMap[this.postId].push(newComment)

        const targetId = newComment.parentCommentId || newComment.id
        this.expandedCommentIds.add(targetId)
        this.expandedCommentIds = new Set(this.expandedCommentIds)
      } else {
        this.fetchComments()
      }
    },
    toggleReplies(commentId) {
      if (this.expandedCommentIds.has(commentId)) {
        this.expandedCommentIds.delete(commentId)
      } else {
        this.expandedCommentIds.add(commentId)
      }
      this.expandedCommentIds = new Set(this.expandedCommentIds)
    },
    isExpanded(commentId) {
      return this.expandedCommentIds.has(commentId)
    }
  },
  mounted() {
    this.fetchComments()
  }
}
</script>
