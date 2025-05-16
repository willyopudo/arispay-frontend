<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useToast } from 'vue-toastification';
import { useCookies } from 'vue3-cookies';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  bankList: {
    type: Array,
    default: () => [],
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
const accountName = ref('')
const accountNumber = ref('')
const accountBalance = ref('')
const currency = ref('')
const bank = ref('')
const status = ref('')

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
      emit('companyAccountData', {
        id: null,
        accountNumber: accountNumber.value,
        companyId: userData.companyId,
        companyName: userData.companyName,
        bankCode: bank.value,
        balance: accountBalance.value,
        status: status.value,
        currency: currency.value,
        accountName: accountName.value,
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
      title="Add New Account"
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
              <!-- 👉 Account name -->
              <VCol cols="12">
                <AppTextField
                  v-model="accountName"
                  :rules="[requiredValidator]"
                  label="Account Name"
                  placeholder="John Kamangu"
                />
              </VCol>
              <!-- 👉 Account Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="accountNumber"
                  :rules="[requiredValidator]"
                  label="Account Number"
                  placeholder="035000064547"
                />
              </VCol>

              <!-- 👉 Account Balance -->
              <VCol cols="12">
                <AppTextField
                  v-model="accountBalance"
                  :rules="[requiredValidator]"
                  label="Account Balance"
                  placeholder="100,000.00"
                />
              </VCol>

              <!-- 👉 Currency -->
              <VCol cols="12">
                <AppSelect
                  v-model="currency"
                  label="Select Currency"
                  placeholder="KES"
                  :rules="[requiredValidator]"
                  :items="['KES', 'USD', 'GBP', 'TZS']"
                />
              </VCol>

              <!-- 👉 Bank -->
              <VCol cols="12">
                <AppSelect
                  v-model="bank"
                  label="Select Bank"
                  placeholder="Select Bank"
                  :rules="[requiredValidator]"
                  :items="bankList"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <AppSelect
                  v-model="status"
                  label="Select Status"
                  placeholder="Select Status"
                  :rules="[requiredValidator]"
                  :items="[{ title: 'Active', value: 'active' }, { title: 'Inactive', value: 'inactive' }, { title: 'Pending', value: 'pending' }]"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
