<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  userData: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      firstName: '',
      lastName: '',
      // company: '',
      role: '',
      username: '',
      phoneNumber: '',
      email: '',
      currentPlan: '',
      status: '',
      avatar: '',
      address: '',
      companyName: '',
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const userData = ref(structuredClone(toRaw(props.userData)))
//console.log(userData.value)
const isUseAsBillingAddress = ref(false)



watch(() => props, () => {
  userData.value = structuredClone(toRaw(props.userData))
})

const onFormSubmit = () => {
  emit('update:isDialogVisible', false)
  emit('submit', userData.value)
}

const onFormReset = () => {
  userData.value = structuredClone(toRaw(props.userData))
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

const titleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const currentPlan = computed({
  get() {
    return titleCase(userData.value.currentPlan);
  },
  set(value) {
    userData.value.currentPlan = value;
  }
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-10 pa-2">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          {{ action === 'edit' ? $t('Edit') : $t('View') }} {{ $t('User Information') }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ action === 'edit' ? $t('Updating user details will receive a privacy audit.') : $t('You can view the user details.') }}
        </p>

        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 First Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="userData.firstName"
                :label="$t('First Name')"
                placeholder="John"
              />
            </VCol>

            <!-- 👉 Last Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="userData.lastName"
                :label="$t('Last Name')"
                placeholder="Doe"
              />
            </VCol>

            <!-- 👉 Username -->
            <VCol cols="12">
              <AppTextField
                v-model="userData.username"
                :label="$t('Username')"
                placeholder="john.doe.007"
              />
            </VCol>

            <!-- 👉 Billing Email -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="userData.email"
                :label="$t('Email')"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- 👉 Status -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="userData.status"
                :label="$t('Status')"
                :placeholder="$t('Active')"
                :items="[{ title: $t('Active'), value: 'active', }, { title: $t('Inactive'), value: 'inactive', }, { title: $t('Pending'), value: 'pending', }]"
                :disabled="action === 'view'"
              />
            </VCol>

            <!-- 👉 Tax Id -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="userData.address"
                :label="$t('Address')"
                placeholder="123456789"
              />
            </VCol>

            <!-- 👉 Contact -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="userData.phoneNumber"
                :label="$t('Phone Number')"
                placeholder="+1 9876543210"
              />
            </VCol>

            <!-- 👉 Current Plan -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="currentPlan"
                :label="$t('Current Plan')"
                :placeholder="$t('Basic')"
                :items="[{ title: $t('Basic'), value: 'basic', }, { title: $t('Standard'), value: 'standard', }, { title: $t('Enterprise'), value: 'enterprise', },{ title: $t('Special'), value: 'special', }]"
                :disabled="action === 'view'"
              />
            </VCol>

            <!-- 👉 Role -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="userData.role"
                :label="$t('Role')"
                :placeholder="$t('Select Role')"
                :items="[ { title: $t('Company Admin'), value: 'ROLE_COMPANY_ADMIN', }, { title: $t('Company User'), value: 'ROLE_COMPANY_USER', }, { title: $t('Super Admin'), value: 'ROLE_ADMIN', },  ] "
                :disabled="action === 'view'"
                />
            </VCol>

            <!-- 👉 Switch -->
            <VCol cols="12">
              <VSwitch
                v-model="isUseAsBillingAddress"
                density="compact"
                :label="userData.userCompanies.length != 0 ? userData.userCompanies[0].companyName : $t('Unknown')"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit"
                v-if="action === 'edit'">
                {{ $t('Submit') }}
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                {{ $t('Cancel') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
