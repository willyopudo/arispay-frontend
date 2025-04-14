<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useToast } from 'vue-toastification';
import { useCookies } from 'vue3-cookies';

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
      register();
      const userData = useCookie('userData').value;
      emit('userData', {
        id: null,
        username: username.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        userCompanies: [
          {
            id: null,
            companyId: userData.companyId.value,
            isDefault: false
          }
        ],
        phoneNumber: phoneNumber.value,
        address: address.value,
        zipCode: zipCode.value,
        town: town.value,
        role: "ROLE_COMPANY_USER",
        status: status.value,
        currentPlan: currentPlan.value,
        avatar: "",
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const register = async () => {
  try {
    const userData = cookies.get('userData');
    console.log('User data: ' + JSON.stringify(userData));
  const req = {

id: null,
"username": username.value,
"firstName": firstName.value,
"lastName": lastName.value,
"email": email.value,
"userCompanies": [
  {
    id: null,
    "companyId": userData.companyId,
    "isDefault": true
  }
],
"phoneNumber": phoneNumber.value,
"address": address.value,
"zipCode": zipCode.value,
"town": town.value,
"role": "ROLE_COMPANY_USER",
"status": status.value,
"currentPlan": currentPlan.value,
"avatar": ""

}
console.log("Request payload:", JSON.stringify(req, null, 2));
    const {
  data: savedUser,
  execute: saveCompanyUser,
} = await customUseApi('/user', {
method: 'POST',
body: JSON.stringify(req),
headers: {"Content-Type": 'application/json'}
})
    if (savedUser._value !== null) {
      console.log('Log: ' + JSON.stringify(savedUser))
      toast.success('Company user created successfully')
    }
    else {     
      toast.error('Error creating company user', err)
    }

    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/apps/user/list')
    })
  } catch (err) {
    console.log("Error: "+ err)
    toast.error('Error creating company user', err)
  }
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
      title="Add New User"
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
                  :items="['Basic', 'Company', 'Enterprise', 'Team']"
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
