<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 👉 Store
const transactionRef = ref('')
const fetchedTransaction = ref(null)
const transactionDetailsData = ref([])

const bankList = ref([])


const selectedBank = ref(null)

async function fetchBankList() {
  try {
    const { data, error } = await axiosApiCall('/banks/select-list')
    if (error) {
      useSweetAlert.errorMessage(t('Error fetching banks') + ': ' + error.message)
      return
    }
    bankList.value = data || []
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchBankList()
})
const status = computed(() => [
  {
    title: t('Pending'),
    value: 'pending',
  },
  {
    title: t('Active'),
    value: 'active',
  },
  {
    title: t('Inactive'),
    value: 'inactive',
  },
])


async function queryTransaction(){
  if (!transactionRef.value || !selectedBank.value) {
    useSweetAlert.errorMessage(t('Please provide both Transaction Reference and Bank'))
    return
  }
  try {
    const {
      data: txn,
      error,
      response
    } = await axiosApiCall('/transactions/query', {
      params: {
        transRef: transactionRef.value,
        bank: selectedBank.value

      }
    })
    if (error) {
      if(error.status === 404) {
        transactionDetailsData.value = [

        { title: 'notfound', value: t('No record found for') + ' ' + transactionRef.value }
        ]
        console.error('No record found for ' + transactionRef.value)
      }
      useSweetAlert.toast(error.response.data || error.message, 'error')
      return
    }

    fetchedTransaction.value = txn

    if(fetchedTransaction.value !== null || transactionDetailsData.value == null) {

      transactionDetailsData.value = [

        { title: 'Reference', value: fetchedTransaction.value.bankTranRef },
        { title: 'Transaction Date', value: formatDate(fetchedTransaction.value.transDate) },
        { title: 'Bank Account', value: fetchedTransaction.value.bankAccount },
        { title: 'Bank', value: fetchedTransaction.value.bank },
        { title: 'Amount', value: Number(fetchedTransaction.value.tranAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
        { title: 'Client ID', value: fetchedTransaction.value.client },
        { title: 'Transaction Type', value: fetchedTransaction.value.crDrInd },
        { title: 'Payer Name', value: fetchedTransaction.value.payerName },
        { title: 'Payer Phone', value: fetchedTransaction.value.payerPhone },
        { title: 'Payment Mode', value: fetchedTransaction.value.paymentMode },
        { title: 'Narration', value: fetchedTransaction.value.narration },
      ]
    }

    useSweetAlert.toast(t("Transaction fetched successfully"));

  } catch (error) {
    console.error(error)
  }
}

</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ $t('Transaction Query') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="transactionRef"
              :label="$t('Transaction Reference')"
              prepend-inner-icon="tabler-folder-symlink"
              dense
              outlined
              clearable
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="selectedBank"
              :items="bankList"
              :label="$t('Select Bank')"
              prepend-inner-icon="tabler-building-bank"
              dense
              outlined
              clearable
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" class="d-flex justify-center">
            <VBtn
              color="primary"
              @click="queryTransaction"
              prepend-icon="tabler-search"
            >
              {{ $t('Search') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />


    </VCard>
  </section>
  <section v-if="fetchedTransaction || transactionDetailsData.length > 0" class="mb-6">
    <VCard>
      <VCardItem>
        <VCardTitle>{{ $t('Transaction Details') }}</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="transaction-grid">
              <div
                v-for="(item, index) in transactionDetailsData"
                :key="index"
                class="transaction-item mr-4 ml-4"
              >
                <div class="d-flex flex-column flex-sm-row justify-space-between gap-4 flex-wrap py-4">
                  <h6 class="text-h6" v-if="item.title !== 'notfound'">
                    {{ $t(item.title) }}
                  </h6>
                  <div class="d-flex gap-4 flex-wrap">
                    <span class="text-subtitle-1">
                      {{ item.value || $t('N/A') }}
                    </span>
                  </div>
                </div>
                <VDivider  />
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>

<style scoped>
.transaction-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.transaction-item {
  break-inside: avoid;
}

@media (max-width: 768px) {
  .transaction-grid {
    grid-template-columns: 1fr;
  }
}
</style>
