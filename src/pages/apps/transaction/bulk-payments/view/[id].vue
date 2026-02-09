<script setup>
import { useI18n } from 'vue-i18n'
import { bulkDisbursementService } from '@/services/bulkDisbursementService'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const disbursement = ref(null)
const isLoading = ref(true)
const detailSearch = ref('')

// Detail table headers
const detailHeaders = computed(() => [
  { title: t('Payment Ref'), key: 'paymentRef' },
  { title: t('Beneficiary'), key: 'beneficiaryDetails' },
  { title: t('Account'), key: 'beneficiaryAccount' },
  { title: t('Bank'), key: 'beneficiaryBank' },
  { title: t('Amount'), key: 'paymentAmount' },
  { title: t('Currency'), key: 'currency' },
  { title: t('Type'), key: 'paymentType' },
  { title: t('Status'), key: 'status' },
])

const resolveStatusVariant = (status) => {
  if (!status) return 'default'
  const s = String(status).toLowerCase()
  if (s === 'completed' || s === 'success') return 'success'
  if (s === 'pending' || s === 'processing') return 'warning'
  if (s === 'failed' || s === 'error') return 'error'
  return 'info'
}

const fetchDisbursement = async () => {
  isLoading.value = true
  try {
    const { data, error } = await bulkDisbursementService.getById(route.params.id)

    if (error) {
      console.error('Error fetching disbursement:', error)
      return
    }

    disbursement.value = data
  } catch (err) {
    console.error('Error fetching disbursement:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/apps/transaction/bulk-payments/list')
}

onMounted(() => {
  fetchDisbursement()
})
</script>

<template>
  <section>
    <!-- Back button -->
    <div class="mb-4">
      <VBtn variant="tonal" @click="goBack">
        <VIcon icon="tabler-arrow-left" class="me-1" />
        {{ t('Back to Bulk Payments') }}
      </VBtn>
    </div>

    <!-- Loading -->
    <VCard v-if="isLoading" class="mb-6">
      <VCardText class="text-center py-10">
        <VProgressCircular indeterminate color="primary" />
        <div class="mt-4 text-body-1">{{ t('Loading disbursement details...') }}</div>
      </VCardText>
    </VCard>

    <!-- Not found -->
    <VAlert
      v-else-if="!disbursement"
      type="error"
      variant="tonal"
    >
      {{ t('Disbursement Details') }} - ID {{ route.params.id }}
    </VAlert>

    <!-- Disbursement details -->
    <template v-else>
      <!-- Summary Card -->
      <VCard class="mb-6">
        <VCardItem>
          <VCardTitle>
            <VIcon icon="tabler-file-invoice" class="me-2" />
            {{ t('Disbursement Details') }}
          </VCardTitle>
          <template #append>
            <VChip
              :color="resolveStatusVariant(disbursement.status)"
              label
              class="text-capitalize"
            >
              {{ disbursement.status || t('Pending') }}
            </VChip>
          </template>
        </VCardItem>

        <VDivider />

        <VCardText>
          <VRow>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('Batch Reference') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.batchRef || '-' }}</div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('CBS Reference') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.cbsRef || '-' }}</div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('Source Account') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.accountDr || '-' }}</div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('Value Date') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.valueDate || '-' }}</div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('Currency') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.currency || 'KES' }}</div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('Total Amount') }}</div>
              <div class="text-h6 text-primary">
                {{ Number(disbursement.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('Narration') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.narration || '-' }}</div>
            </VCol>
            <VCol cols="12" md="6" lg="3">
              <div class="text-body-2 text-disabled mb-1">{{ t('No. of Items') }}</div>
              <div class="text-body-1 font-weight-medium">{{ disbursement.dtl ? disbursement.dtl.length : 0 }}</div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Detail Items -->
      <VCard>
        <VCardItem>
          <VCardTitle>
            <VIcon icon="tabler-list-details" class="me-2" />
            {{ t('Payment Items') }}
          </VCardTitle>
          <template #append>
            <div style="inline-size: 15rem;">
              <AppTextField
                v-model="detailSearch"
                :placeholder="t('Search items...')"
                density="compact"
              />
            </div>
          </template>
        </VCardItem>

        <VDivider />

        <VDataTable
          :headers="detailHeaders"
          :items="disbursement.dtl || []"
          :search="detailSearch"
          :items-per-page="10"
          class="text-no-wrap"
        >
          <template #item.paymentAmount="{ item }">
            <div class="text-end">
              {{ Number(item.paymentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
          </template>

          <template #item.beneficiaryBank="{ item }">
            <VChip size="small" label color="info">
              {{ item.beneficiaryBank || '-' }}
            </VChip>
          </template>

          <template #item.status="{ item }">
            <VChip
              :color="resolveStatusVariant(item.status)"
              size="small"
              label
              class="text-capitalize"
            >
              {{ item.status || t('Pending') }}
            </VChip>
          </template>

          <template #no-data>
            <div class="text-center py-6 text-disabled">
              {{ t('No payment items found') }}
            </div>
          </template>
        </VDataTable>
      </VCard>
    </template>
  </section>
</template>
