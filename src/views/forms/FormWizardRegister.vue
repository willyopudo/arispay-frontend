<script setup>
import { VForm } from 'vuetify/components/VForm'
import { useToast } from 'vue-toastification';

const numberedSteps = [
  {
    title: 'User Information',
    subtitle: 'Enter your User Details',
  },
  {
    title: 'Company Info',
    subtitle: 'Add Your Company info',
  },
  {
    title: 'Company Account',
    subtitle: 'Add Main Company Account',
  },
]

const toast = useToast();
const route = useRoute()
const router = useRouter()

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isCPasswordVisible = ref(false)
const isCurrentStepValid = ref(true)
const refUserForm = ref()
const refCompanyForm = ref()
const refCompanyAccountForm = ref()

const userForm = ref({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  cPassword: '',
  phoneNumber: '',
  address: '',
  postalCode: '',
  town: '',
  currentPlan: '',
  avatar: '',
  role: 'ROLE_COMPANY_ADMIN'
})

const companyForm = ref({
  name: '',
  code: '',
  country: undefined,
  shortCode: undefined,
  businessRegNum: '',
  email: '',
  phoneNumber: '',
  category: '',
  identifierType: ''
})

const companyAccountForm = ref({
  accountNumber: '',
  accountName: '',
  bankCode: '',
  bankName: '',
  balance: ''
})

const validateUserForm = () => {
  refUserForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    } else {
      isCurrentStepValid.value = false
    }
  })
}

const validateCompanyForm = () => {
  refCompanyForm.value?.validate().then(valid => {
    if (valid.valid) {
      currentStep.value++
      isCurrentStepValid.value = true
    } else {
      isCurrentStepValid.value = false
    }
  })
}

const register = async () => {
  try {
    const res = await $api('/auth/register', {
      method: 'POST',
      body:{
        "userDto": userForm.value,
        "companyDto": companyForm.value,
        "companyAccountDto": companyAccountForm.value
      },
      onResponseError({ response }) {
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
    console.error(err)
    toast.error('Error creating company admin', err)
  }
}

const validateCompanyAccountForm = () => {
  refCompanyAccountForm.value?.validate().then(valid => {
    if (valid.valid) {
      isCurrentStepValid.value = true
      console.log({
        "userDto": userForm.value,
        "companyDto": companyForm.value,
        "companyAccountDto": companyAccountForm.value,
      })

      register();

    } else {
      isCurrentStepValid.value = false
    }
  })
}
</script>

<template>
  <VCard>
    <VCardText>
      <!-- 👉 Stepper -->
      <AppStepper
        v-model:current-step="currentStep"
        :items="numberedSteps"
        :is-active-step-valid="isCurrentStepValid"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <!-- 👉 stepper content -->

      <VWindow
        v-model="currentStep"
        class="disable-tab-transition"
      >
        <VWindowItem>
          <VForm
            ref="refUserForm"
            @submit.prevent="validateUserForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  User Information
                </h6>
                <p class="mb-0">
                  Enter your User Details
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.username"
                  placeholder="CarterLeonardo"
                  :rules="[requiredValidator]"
                  label="Username"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.firstName"
                  placeholder="Carter"
                  :rules="[requiredValidator]"
                  label="First Name"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.lastName"
                  placeholder="Carter"
                  :rules="[requiredValidator]"
                  label="Last Name"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.email"
                  placeholder="carterleonardo@gmail.com"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator, passwordValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.cPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :rules="[requiredValidator, confirmedValidator(userForm.cPassword, userForm.password)]"
                  :type="isCPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isCPasswordVisible = !isCPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.phoneNumber"
                  placeholder="254712345678"
                  :rules="[requiredValidator]"
                  label="Phone Number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.address"
                  placeholder="254712345678"
                  :rules="[requiredValidator]"
                  label="Address"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.postalCode"
                  placeholder="51330"
                  :rules="[requiredValidator]"
                  label="Postal Code"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="userForm.town"
                  placeholder="51330"
                  :rules="[requiredValidator]"
                  label="Town"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="userForm.currentPlan"
                  label="Plan"
                  :rules="[requiredValidator]"
                  placeholder="Select Plan"
                  :items="['enterprise', 'basic', 'lite', 'professional']"
                />
              </VCol>


              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    disabled
                  >
                    <VIcon
                      icon="tabler-arrow-left"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="tabler-arrow-right"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refCompanyForm"
            @submit.prevent="validateCompanyForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Company Info
                </h6>
                <p class="mb-0">
                  Add Your Company Information
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyForm.name"
                  label="Company Name"
                  :rules="[requiredValidator]"
                  placeholder="Leonard Enterprises"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyForm.shortCode"
                  label="MPESA Short Code"
                  placeholder="542542"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyForm.businessRegNum"
                  label="Business Registration Number"
                  :rules="[requiredValidator]"
                  placeholder="BUS/NRB/002"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyForm.email"
                  label="Business Email"
                  :rules="[requiredValidator, emailValidator]"
                  placeholder="kamauent@gmail.com"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyForm.phoneNumber"
                  label="Phone Number"
                  :rules="[requiredValidator]"
                  placeholder="254735728738"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="companyForm.category"
                  label="Category"
                  :rules="[requiredValidator]"
                  placeholder="Select Category"
                  :items="['FARMING', 'MANUFACTURING', 'OIL AND GAS', 'TECHNOLOGY', 'SCHOOL', 'HOSPITAL', 'CHURCH']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="companyForm.identifierType"
                  label="Identifier"
                  :rules="[requiredValidator]"
                  placeholder="Select Identifier"
                  :items="['INDIVIDUAL', 'COMPANY']"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="tabler-arrow-left"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn type="submit">
                    Next
                    <VIcon
                      icon="tabler-arrow-right"
                      end
                      class="flip-in-rtl"
                    />
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>

        <VWindowItem>
          <VForm
            ref="refCompanyAccountForm"
            @submit.prevent="validateCompanyAccountForm"
          >
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">
                  Company Account
                </h6>
                <p class="mb-0">
                  Add Main Company Account
                </p>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyAccountForm.accountName"
                  placeholder="Leonard Ent."
                  :rules="[requiredValidator]"
                  label="Account Name"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyAccountForm.accountNumber"
                  placeholder="03500064547"
                  :rules="[requiredValidator]"
                  label="Account Number"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="companyAccountForm.bankCode"
                  label="Bank Code"
                  :rules="[requiredValidator]"
                  placeholder="Select Bank Code"
                  :items="['070-FAMILY BANK', '002-STANDARD CHARTERED BANK']"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyAccountForm.bankName"
                  placeholder=""
                  :rules="[requiredValidator]"
                  label="Bank Name"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="companyAccountForm.balance"
                  placeholder=""
                  :rules="[requiredValidator]"
                  label="Account Balance"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
                  <VBtn
                    color="secondary"
                    variant="tonal"
                    @click="currentStep--"
                  >
                    <VIcon
                      icon="tabler-arrow-left"
                      start
                      class="flip-in-rtl"
                    />
                    Previous
                  </VBtn>

                  <VBtn
                    color="success"
                    type="submit"
                  >
                    submit
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
