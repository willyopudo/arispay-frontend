<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useToast } from 'vue-toastification';
import { useCookies } from 'vue3-cookies';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'userData',
])

const { cookies } = useCookies();

const toast = useToast();

const route = useRoute();
const router = useRouter();

const isFormValid = ref(false)

const userForm = ref({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  address: '',
  postalCode: '',
  town: '',
  currentPlan: '',
  avatar: '',
  role: 'ROLE_COMPANY_ADMIN'
})

const refForm = ref()
const clientId = ref('')
const clientName = ref('')
const clientEmail = ref('')
const clientPhone = ref('')
const address = ref('')
const zipCode = ref()
const town = ref('')
const role = ref()
const identifierType = ref()
const status = ref()

const identifierTypeItems = computed(() => [
  { title: t('Invoice Number'), value: 'INVOICE_NUMBER' },
  { title: t('Registration Number'), value: 'REG_NUMBER' },
  { title: t('Bill Number'), value: 'BILL_NUMBER' },
  { title: t('ID Number'), value: 'ID_NUMBER' },
  { title: t('Phone Number'), value: 'MSSIDN' },
  { title: t('Account Number'), value: 'ACCOUNT_NUMBER' },
])

const statusItems = computed(() => [
  { title: t('Active'), value: 'active' },
  { title: t('Inactive'), value: 'inactive' },
  { title: t('Pending'), value: 'pending' },
])

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      const userData = useCookie('userData').value;
      emit('clientData', {
        id: null,
        clientName: clientName.value,
        clientId: clientId.value,
        identifierType: identifierType.value,
        company: userData.companyId,
        companyName: userData.companyName,
        clientEmail: clientEmail.value,
        clientPhone: clientPhone.value,
        status: status.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="$t('Add New Client')"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 First name -->
              <VCol cols="12">
                <AppTextField
                  v-model="clientId"
                  :label="$t('Client ID')"
                  placeholder="MATA000001"
                />
                <VTooltip
                activator="parent"
                location="left"
                max-width="300"
              >
                {{ $t("Enter your client's unique identifier. If you don't have one, leave it blank and the system will generate one for you.") }}
              </VTooltip>
              </VCol>
              <!-- 👉 Last name -->
              <VCol cols="12">
                <AppTextField
                  v-model="clientName"
                  :rules="[requiredValidator]"
                  :label="$t('Client\'s Name')"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="clientEmail"
                  :rules="[requiredValidator, emailValidator]"
                  :label="$t('Email')"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 Phone Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="clientPhone"
                  type="number"
                  :rules="[requiredValidator]"
                  :label="$t('Phone Number')"
                  placeholder="+254-711-222-333"
                />
              </VCol>

              <!-- 👉 Plan -->
              <VCol cols="12">
                <AppSelect
                  v-model="identifierType"
                  :label="$t('Select Identifier Type')"
                  :placeholder="$t('Select Identifier Type')"
                  :rules="[requiredValidator]"
                  :items="identifierTypeItems"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="status"
                  :label="$t('Select Status')"
                  :placeholder="$t('Select Status')"
                  :rules="[requiredValidator]"
                  :items="statusItems"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  {{ $t('Submit') }}
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  {{ $t('Cancel') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
