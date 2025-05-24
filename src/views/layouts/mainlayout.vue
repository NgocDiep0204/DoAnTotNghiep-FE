
<template>
    <!-- <div :class="{'w-full h-screen bg-gray-300': isChangePasswordPage || isSendEmailPage || isVerifyOtpPage, 'w-full h-screen': !isChangePasswordPage && !isSendEmailPage}"> -->
        <headercomponent />
        <!-- <div class="flex flex-row justify-between items-center pt-10">
            <div class="w-1/2 pt-6 md:block">
                <SearchComponent v-if="!isHomePage && !isLoginPage && !isRegisterPage && !isChangePasswordPage && !isSendEmailPage && !isVerifyOtpPage" @search-results="handleSearchResults" />
            </div>
            <div class="w-1/2 hidden md:block">
                <SideBarComponent v-if="!isHomePage && !isLoginPage && !isRegisterPage && !isChangePasswordPage && !isSendEmailPage && !isVerifyOtpPage" />
            </div>
        </div> -->
        <div>
        <!-- Hiển thị popup chat -->
        </div>
        <chat v-if="useUser.user && useUser.user.role === 'User'" />

        <div>
            <router-view />
        </div>
        <footercomponent/>
    <!-- </div> -->
</template>

<script>
import headercomponent from '../../components/headercomponent.vue';
import footercomponent from '../../components/footercomponent.vue';
import chat from '../../components/chatcomponent.vue';
import { useAuthStore } from '../../store/user/authstore';
export default {
    components: {
        headercomponent,
        footercomponent,
        chat
       
    },
    setup() {
    // const route = useRoute(); 
    // const shouldShowChat = computed(() => {
    //     console.log("Current Route Name:", route.name); // Debug giá trị của route.name
    //     return !['Login', 'Register', 'Forgotpassword', 'Resetpassword', 'Verifyotp'].includes(route.name);
    // });

    // return { shouldShowChat };
    },
    mounted() {
        if(localStorage.getItem('token') !==null) {
           this.useUser.getUser();
        }
    },
    computed: {
        useUser() {
            return useAuthStore();
        },
        isHomePage() {
            return this.$route.name === 'home';
        },
        isLoginPage() {
            return this.$route.name === 'login';
        },
        isRegisterPage() {
            return this.$route.name === 'register';
        },
        isChangePasswordPage() {
            return this.$route.name === 'changepassword';
        },
        isSendEmailPage() {
            return this.$route.name === 'sendemail';
        },
        isVerifyOtpPage() {
            return this.$route.name === 'verifyotp';
        }
    }
}

</script>
