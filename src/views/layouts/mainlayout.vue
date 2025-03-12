
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
            <router-view />
        </div>
        <footercomponent/>
    <!-- </div> -->
</template>

<script>
import headercomponent from '../../components/headercomponent.vue';
import footercomponent from '../../components/footercomponent.vue';
export default {
    components: {
        headercomponent,
        footercomponent,
       
    },
    setup() {
        // const route = useRoute();
        // const isHomePage = computed(() => route.name === '/');
        // const isLoginPage = computed(() => route.name === 'Login');
        // const isRegisterPage = computed(() => route.name === 'Register');
        // const isSendEmailPage = computed(() => route.name === 'SendEmail');
        // const isChangePasswordPage = computed(() => route.name === 'ResetPassword');
        // const isVerifyOtpPage = computed(() => route.name === 'Verify-OTP');
      
        // return { isHomePage, isLoginPage, isRegisterPage, isSendEmailPage, isChangePasswordPage, isVerifyOtpPage };
    },
    computed:{
    },
    methods:{
    }
}
</script>
