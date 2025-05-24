<template>
  <comment-list :comments="comments" :parent-id="null" />
</template>

<script setup>
import { ref } from 'vue'
import CommentList from './commentlist.vue'

const comments = ref([
  { id: 1, content: 'Bình luận 1', user: { fullName: 'Nguyễn A' }, parentCommentId: null },
  { id: 2, content: 'Trả lời 1', user: { fullName: 'Trần B' }, parentCommentId: 1 },
  { id: 3, content: 'Bình luận 2', user: { fullName: 'Lê C' }, parentCommentId: null }
])
</script>
