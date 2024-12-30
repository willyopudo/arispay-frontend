<script setup>
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const toast = useToast();

const route = useRoute();
const router = useRouter();

const token = ref('');

watch(() => route.query.token, (newToken) => {
  token.value = newToken || '';
  console.log(token.value)
}, { immediate: true });


const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const refForm = ref()


const setPassword = async () => {
  try {
    const res = await $api('/auth/set-password', {
      method: 'POST',
      body:{
        "token": token.value,
        "password": form.value.newPassword
      },
      onResponseError({ response }) {
        toast.error(`Error setting password: ${response._data.message}`);
        console.log(response._data.detail)
        console.log(response._data)
        errors.value = response._data.errors
        
      },
    })
    //console.log(res)
    toast.success('Password set successfully')

    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/login')// redirect to the specified route or default to /login
    })
  } catch (err) {
    console.log("Error: "+ err)
    // toast.error('Error creating company admin', err)
  }
}

const validateSetPasswordForm = () => {
  refForm.value?.validate().then(valid => {
    if (valid.valid) {

      setPassword();

    } else {
      toast.error('Please fill in all required fields')
    }
  })
}

</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-2'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <RouterLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
            </RouterLink>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <h4 class="text-h4 mb-1">
            Set Password 🔒
          </h4>
          <p class="mb-0">
            Create your new password to access your account.
          </p>
        </VCardText>

        <VCardText>
          <VForm ref="refForm" @submit.prevent="validateSetPasswordForm">
            <VRow>
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.newPassword"
                  autofocus
                  label="New Password"
                  placeholder="············"
                  :rules="[requiredValidator, passwordValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- Confirm Password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.confirmPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :rules="[requiredValidator, confirmedValidator(form.confirmPassword, form.newPassword)]"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                >
                  Set New Password
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    size="20"
                    class="me-1 flip-in-rtl"
                  />
                  <span>Back to login</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
