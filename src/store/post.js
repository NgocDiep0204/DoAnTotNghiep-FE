import { defineStore } from 'pinia'
import axiosClient from '../axiosClient'
import { createApp } from 'vue'
import { comment } from 'postcss'
export const usePostStore = defineStore('post', {
    state: () => ({
        posts: [],
        commentsByPostMap: {},
        post: {},
        loading: false,
        error: null
    }),
    getters: {

    },
    actions: {
        async getAllPosts(){
            try {
                const response = await axiosClient.get('Post/GetPosts')
                this.posts = response.data.$values
            } catch (error) {
                this.error = error.response.data.message
            } 
        },
        async getPostByPostId(id){
            try {
                const response = await axiosClient.get(`Post/GetPostWithComments?postId=${id}`)
                this.commentsByPostMap[id] = response.data.$values
            } catch (error) {
                this.error = error.response.data.message
            } 
        },
        async createComment(comment){
            try {
                const response = await axiosClient.post('Post/AddComment', comment)
                return response.data
            } catch (error) {
                this.error = error.response.data.message
            } 
        },

        async createPost(post){
            try {
                const response = await axiosClient.post('Post/CreatePost', post)
                return response.data
            } catch (error) {
                this.error = error.response.data.message
            } 
        },

       
        async createPostImage(image){
            try {
                const response = await axiosClient.post('Post/AddImagePost', image)
                
                return response.data
            } catch (error) {
                this.error = error.response.data.message
            } 
        },
        async deletePost(id){
            try {
                const response = await axiosClient.delete(`Post/DeletePost?postId=${id}`)
                return true
            } catch (error) {
                this.error = error.response.data.message
            } 
        },
        async deleteComment(id){
            try {
                const response = await axiosClient.delete(`Post/DeleteComment?commentId=${id}`)
                return true
            } catch (error) {
                this.error = error.response.data.message
            } 
        },  
    }
})
