<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

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

const isFormValid = ref(false)
const refForm = ref()
const fullName = ref('')
const userName = ref('')
const email = ref('')
const company = ref('')
const country = ref()
const contact = ref('')
const role = ref()
const plan = ref()
const status = ref()

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
      emit('userData', {
        id: 0,
        fullName: fullName.value,
        company: company.value,
        role: role.value,
        country: country.value,
        contact: contact.value,
        email: email.value,
        currentPlan: plan.value,
        status: status.value,
        avatar: '',
        billing: 'Auto Debit',
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
    const res = await $api('/user', {
      method: 'POST',
      body:{
        "userDto": userForm.value,
        "companyDto": companyForm.value,
        "companyAccountDto": companyAccountForm.value
      },
      onResponseError({ response }) {
        toast.error(`Error creating company admin: ${response._data.detail}`);
        console.log(response._data.detail)
        console.log(response._data)
        errors.value = response._data.errors
        
      },
    })
    //console.log(res)
    toast.success('Company Admin Created Successfully')

    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/login')
    })
  } catch (err) {
    console.log("Error: "+ err)
    // toast.error('Error creating company admin', err)
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
              <!-- 👉 First name -->
              <VCol cols="12">
                <AppTextField
                  v-model="firstName"
                  :rules="[requiredValidator]"
                  label="First Name"
                  placeholder="John"
                />
              </VCol>
              <!-- 👉 Last name -->
              <VCol cols="12">
                <AppTextField
                  v-model="lastName"
                  :rules="[requiredValidator]"
                  label="Last Name"
                  placeholder="Doe"
                />
              </VCol>

              <!-- 👉 Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="userName"
                  :rules="[requiredValidator]"
                  label="Username"
                  placeholder="Johndoe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 Phone Number -->
              <VCol cols="12">
                <AppTextField
                  v-model="phoneNumber"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Phone Number"
                  placeholder="+254-711-222-333"
                />
              </VCol>

              <!-- 👉Physical Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="address"
                  :rules="[requiredValidator]"
                  label="Physical Address"
                  placeholder="Kahawa Sukari"
                />
              </VCol>

              <!-- 👉Postal Address -->
              <VCol cols="12">
                <AppTextField
                  v-model="zipCode"
                  :rules="[requiredValidator]"
                  label="Postal Address"
                  placeholder="5306-00200"
                />
              </VCol>

              <!-- 👉Town -->
              <VCol cols="12">
                <AppTextField
                  v-model="town"
                  :rules="[requiredValidator]"
                  label="Town"
                  placeholder="Ruiru"
                />
              </VCol>

              <!-- 👉 Plan -->
              <VCol cols="12">
                <AppSelect
                  v-model="currentPlan"
                  label="Select Plan"
                  placeholder="Select Plan"
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
