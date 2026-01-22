<script setup>
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  companyAccountData: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      accountNumber: '',
      accountName: '',
      companyName: '',
      bankCode: '',
      bankName: '',
      balance: '',
      currency: '',
      status: '',
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
  banks: {
    type: Array,
    required: false,
    default: () => [],
  },
})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const companyAccountData = ref(structuredClone(toRaw(props.companyAccountData)))
console.log(companyAccountData.value)

const statusItems = computed(() => [
  { title: t('Active'), value: 'active' },
  { title: t('Inactive'), value: 'inactive' },
  { title: t('Dormant'), value: 'pending' },
])



watch(() => props, () => {
  companyAccountData.value = structuredClone(toRaw(props.companyAccountData))
})

const onFormSubmit = () => {
  emit('update:isDialogVisible', false)
  if (props.action === 'edit') {
    emit('submit', companyAccountData.value)
  }
}

const onFormReset = () => {
  companyAccountData.value = structuredClone(toRaw(props.companyAccountData))
  emit('update:isDialogVisible', false)
}

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

// const titleCase = (str) => {
//   return str.replace(/\w\S*/g, (txt) => {
//     return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//   });
// }

// const currentPlan = computed({
//   get() {
//     return titleCase(clientData.value.currentPlan);
//   },
//   set(value) {
//     clientData.value.currentPlan = value;
//   }
// });
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
          {{ action === 'edit' ? $t('Edit') : $t('View') }} {{ $t('Company Account Information') }}
        </h4>
        <p class="text-body-1 text-center mb-6">
          {{ action === 'edit' ? $t('Updating company account details will receive a privacy audit.') : $t('You can view the company account details.') }}
        </p>

        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 Account Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="companyAccountData.accountName"
                :label="$t('Account Name')"
                placeholder="John"
              />
            </VCol>

            <!-- 👉 Account Number -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="companyAccountData.accountNumber"
                :label="$t('Account Number')"
                placeholder="Super Company"
              />
            </VCol>

            <!-- 👉 Company Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="companyAccountData.companyName"
                :label="$t('Company Name')"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- 👉 Status -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="companyAccountData.status"
                :label="$t('Status')"
                :placeholder="$t('Active')"
                :items="statusItems"
                :disabled="action === 'view'"
              />
            </VCol>

            <!-- 👉 Bank -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                :value="companyAccountData.bankCode + ' ' + companyAccountData.bankName"
                :label="$t('Bank')"
                :items="banks"
                placeholder="+254 711 123 456"
                :disabled="action === 'view'"
              />
            </VCol>

            <!-- 👉 Balance -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                :value="Number(companyAccountData.balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})"
                :label="$t('Balance')"
                placeholder="Type"

              />
            </VCol>
            <!-- 👉 Currency -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="companyAccountData.currency"
                :label="$t('Currency')"
                :placeholder="$t('KES')"
                :items="[$t('KES'), $t('USD'), $t('GBP'), $t('TZS')]"

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
