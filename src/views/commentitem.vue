<template>
  <div class="space-y-2 ml-4 pl-4 border-l">
    <div class="flex items-start space-x-2">
      <img
       
        :src="comment.user.imageUrl"
        alt="Avatar"
        class="w-8 h-8 rounded-full object-cover"
      />
      <div>
        <p>
          <span class="font-semibold">{{ comment.user.fullName }}</span>:
          {{ comment.content }}
        </p>

        <div v-if="comment.image" class="mt-2">
          <img :src="comment.image" alt="Comment Image" class="w-32 h-auto rounded" />
        </div>

        <div class="flex space-x-4 mt-1">
          <p class="text-xs text-gray-500">{{ formatTime(comment.createdAt) }}</p>
          <button
            class="text-sm text-blue-500 hover:underline"
            @click="toggleReplyForm"
          >
            {{ showReplyForm ? 'Hủy' : 'Trả lời' }}
          </button>

          <button
            v-if="childComments.length > 0"
            class="text-sm text-gray-500 hover:underline"
            @click="toggleReplies(comment.id)"
          >
            {{ isExpanded(comment.id) ? 'Ẩn phản hồi' : 'Xem phản hồi' }} ({{ childComments.length }})
          </button>
        </div>

        <!-- ✅ Form trả lời -->
        <div v-if="showReplyForm" class="mt-2 ml-4">
          <p class="text-sm text-gray-600">
            Đang trả lời <strong>{{ comment.user.fullName }}</strong>
          </p>
          <ReplyForm
            :replyTo="comment"
            :postId="null"
            @cancel="cancelReply"
            @submitted="onSubmitted"
          />
        </div>
      </div>
    </div>

    <!-- ✅ Hiển thị các bình luận con khi mở -->
    <div v-if="isExpanded(comment.id)" class="space-y-2">
      <CommentItem
        v-for="child in childComments"
        :key="child.id"
        :comment="child"
        :comments="comments"
        :onCommentSubmitted="onCommentSubmitted"
        :expandedCommentIds="expandedCommentIds"
        :toggleReplies="toggleReplies"
        :isExpanded="isExpanded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import CommentItem from './commentitem.vue'
import ReplyForm from './replyform.vue'

const props = defineProps([
  'comment',
  'comments',
  'onCommentSubmitted',
  'expandedCommentIds',
  'toggleReplies',
  'isExpanded'
])

const showReplyForm = ref(false)

const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
}
const cancelReply = () => {
  showReplyForm.value = false
}
const onSubmitted = (newComment) => {
  showReplyForm.value = false
  props.onCommentSubmitted(newComment)
}

const childComments = computed(() =>
  props.comments.filter((c) => c.parentCommentId === props.comment.id)
)

dayjs.extend(relativeTime)
dayjs.locale('vi')

const formatTime = (time) => {
  return dayjs(time).fromNow()
}
</script>
