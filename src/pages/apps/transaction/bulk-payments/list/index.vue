<script setup>
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'
import { bulkDisbursementService } from '@/services/bulkDisbursementService'

const { t } = useI18n()
const router = useRouter()

// Stepper state
const currentStep = ref(0)
const isSubmitting = ref(false)

// File upload state
const selectedFile = ref(null)
const parsedItems = ref([])
const parseErrors = ref([])
const parseResult = ref(null)

// Configuration state
const selectedBank = ref('')
const selectedAccount = ref('')
const narration = ref('')
const currency = ref('KES')

// Bank & account lists (fetched from API)
const bankList = ref([])
const accountList = ref([])

// History table state
const disbursementHistory = ref([])
const isLoadingHistory = ref(false)

// Preview table search
const previewSearch = ref('')

// Stepper steps
const steps = computed(() => [
  { title: t('Upload File'), icon: 'tabler-upload' },
  { title: t('Preview & Validate'), icon: 'tabler-list-check' },
  { title: t('Configure'), icon: 'tabler-settings' },
  { title: t('Confirm & Submit'), icon: 'tabler-send' },
])

// Preview table headers
const previewHeaders = computed(() => [
  { title: '#', key: 'index', sortable: false, width: '50px' },
  { title: t('Beneficiary Name'), key: 'beneficiaryName' },
  { title: t('Account'), key: 'beneficiaryAccount' },
  { title: t('Bank'), key: 'beneficiaryBank' },
  { title: t('Amount'), key: 'amount' },
  { title: t('Purpose'), key: 'purpose' },
  { title: t('Payment Type'), key: 'paymentType' },
  { title: t('Currency'), key: 'currency' },
])

// History table headers
const historyHeaders = computed(() => [
  { title: t('Batch Ref'), key: 'batchRef' },
  { title: t('Date'), key: 'valueDate' },
  { title: t('Total Amount'), key: 'totalAmount' },
  { title: t('Currency'), key: 'currency' },
  { title: t('Status'), key: 'status' },
  { title: t('Actions'), key: 'actions', sortable: false },
])

// Computed: total amount from parsed items
const totalAmount = computed(() => {
  return parsedItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

// Computed: items with index
const indexedItems = computed(() => {
  return parsedItems.value.map((item, idx) => ({ ...item, index: idx + 1 }))
})

// File input handler - client-side parsing with SheetJS
const onFileSelected = (files) => {
  if (!files || files.length === 0) {
    selectedFile.value = null
    return
  }
  selectedFile.value = files[0] || files
}

const parseFileClientSide = () => {
  if (!selectedFile.value) {
    useSweetAlert.errorMessage(t('Please select a file first'))
    return
  }

  const file = selectedFile.value
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

      if (jsonData.length === 0) {
        parseErrors.value = ['File is empty or has no data rows']
        parsedItems.value = []
        return
      }

      const items = []
      const errors = []

      jsonData.forEach((row, idx) => {
        const rowNum = idx + 2 // +2 because row 1 is header, and idx is 0-based
        const rowErrors = []

        const name = String(row.beneficiaryName || row.name || row['Beneficiary Name'] || '').trim()
        const account = String(row.beneficiaryAccount || row.account || row['Account'] || '').trim()
        const bank = String(row.beneficiaryBank || row.bank || row['Bank'] || '').trim()
        const amountStr = String(row.amount || row.Amount || '').replace(/,/g, '').trim()
        const purpose = String(row.purpose || row.Purpose || '').trim()
        const remarks = String(row.remarks || row.Remarks || '').trim()
        const paymentType = String(row.paymentType || row['Payment Type'] || 'EFT').trim()
        const curr = String(row.currency || row.Currency || 'KES').trim()

        if (!name) rowErrors.push('beneficiaryName is required')
        if (!account) rowErrors.push('beneficiaryAccount is required')
        if (!bank) rowErrors.push('beneficiaryBank is required')

        const amount = parseFloat(amountStr)
        if (isNaN(amount) || amount <= 0) {
          rowErrors.push('amount must be a positive number')
        }

        if (rowErrors.length > 0) {
          errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`)
        } else {
          items.push({
            beneficiaryName: name,
            beneficiaryAccount: account,
            beneficiaryBank: bank.toUpperCase(),
            amount,
            purpose,
            remarks,
            paymentType: paymentType || 'EFT',
            currency: curr || 'KES',
          })
        }
      })

      parsedItems.value = items
      parseErrors.value = errors

      if (items.length > 0) {
        currentStep.value = 1
      }
    } catch (err) {
      parseErrors.value = ['Error parsing file: ' + err.message]
      parsedItems.value = []
    }
  }

  reader.readAsArrayBuffer(file)
}

// Download template
const downloadTemplate = () => {
  const templateData = [
    {
      beneficiaryName: 'John Doe',
      beneficiaryAccount: '0123456789',
      beneficiaryBank: 'FBL',
      amount: 1000,
      purpose: 'Salary',
      remarks: 'January salary',
      paymentType: 'EFT',
      currency: 'KES',
    },
    {
      beneficiaryName: 'Jane Smith',
      beneficiaryAccount: '9876543210',
      beneficiaryBank: 'KCB',
      amount: 2500,
      purpose: 'Supplier payment',
      remarks: 'Invoice #123',
      paymentType: 'EFT',
      currency: 'KES',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Disbursements')
  XLSX.writeFile(wb, 'bulk_disbursement_template.xlsx')
}

// Fetch banks and accounts for configuration step
const fetchBanksAndAccounts = async () => {
  try {
    const { data, error } = await axiosApiCall('/company/accounts', {
      params: { page: 1, itemsPerPage: 100 },
    })

    if (error) {
      console.error('Error fetching accounts:', error)
      return
    }

    if (data) {
      bankList.value = data.value1 || []
      const accounts = data.value0?.content || []

      accountList.value = accounts
        .filter(acc => acc.status?.toLowerCase() === 'active')
        .map(acc => ({
          title: `${acc.accountNumber} - ${acc.accountName}`,
          value: acc.accountNumber,
          bankCode: acc.bankCode,
        }))
    }
  } catch (err) {
    console.error('Error fetching banks and accounts:', err)
  }
}

// Server-side validation + submit
const submitDisbursement = async () => {
  if (!selectedBank.value) {
    useSweetAlert.errorMessage(t('Please select a bank'))
    return
  }
  if (!selectedAccount.value) {
    useSweetAlert.errorMessage(t('Please select a source account'))
    return
  }
  if (parsedItems.value.length === 0) {
    useSweetAlert.errorMessage(t('No items to submit'))
    return
  }

  isSubmitting.value = true

  try {
    // First do server-side parse validation
    const formData = new FormData()

    formData.append('file', selectedFile.value)

    const { data: serverParseResult, error: parseError } = await bulkDisbursementService.parseFile(formData)

    if (parseError) {
      useSweetAlert.errorMessage(t('Server validation failed: ') + parseError.message)
      isSubmitting.value = false
      return
    }

    if (serverParseResult && !serverParseResult.valid) {
      parseErrors.value = serverParseResult.errors || ['Server validation failed']
      useSweetAlert.errorMessage(t('File validation errors found. Please check and re-upload.'))
      currentStep.value = 1
      isSubmitting.value = false
      return
    }

    // Submit the disbursement
    const payload = {
      bankCode: selectedBank.value,
      accountDr: selectedAccount.value,
      narration: narration.value || 'Bulk Disbursement',
      currency: currency.value || 'KES',
      items: parsedItems.value,
    }

    const { data: submitResult, error: submitError } = await bulkDisbursementService.submit(payload)

    if (submitError) {
      useSweetAlert.errorMessage(t('Submission failed: ') + (submitError.response?.data || submitError.message))
      isSubmitting.value = false
      return
    }

    useSweetAlert.successMessage(t('Bulk disbursement submitted successfully'))

    // Reset form
    resetForm()

    // Refresh history
    fetchHistory()
  } catch (err) {
    console.error('Error submitting disbursement:', err)
    useSweetAlert.errorMessage(t('An error occurred while submitting'))
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  currentStep.value = 0
  selectedFile.value = null
  parsedItems.value = []
  parseErrors.value = []
  parseResult.value = null
  selectedBank.value = ''
  selectedAccount.value = ''
  narration.value = ''
  currency.value = 'KES'
}

// Fetch disbursement history
const fetchHistory = async () => {
  isLoadingHistory.value = true
  try {
    const { data, error } = await bulkDisbursementService.list()

    if (error) {
      console.error('Error fetching history:', error)
      return
    }

    disbursementHistory.value = data || []
  } catch (err) {
    console.error('Error fetching history:', err)
  } finally {
    isLoadingHistory.value = false
  }
}

const resolveStatusVariant = (status) => {
  if (!status) return 'default'
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'success') return 'success'
  if (s === 'pending' || s === 'processing') return 'warning'
  if (s === 'failed' || s === 'error') return 'error'
  return 'info'
}

const viewDisbursement = (item) => {
  const id = item.batchRef ? item.batchRef.replace('BULK70', '') : item.id
  router.push({ path: `/apps/transaction/bulk-payments/view/${id}` })
}

// Filter accounts by selected bank
const filteredAccounts = computed(() => {
  if (!selectedBank.value) return accountList.value
  return accountList.value.filter(acc => acc.bankCode === selectedBank.value)
})

// On mount: fetch data
onMounted(() => {
  fetchBanksAndAccounts()
  fetchHistory()
})
</script>

<template>
  <section>
    <!-- Upload & Process Section -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle>
          <VIcon icon="tabler-cash" class="me-2" />
          {{ t('Bulk Disbursement') }}
        </VCardTitle>
        <VCardSubtitle>{{ t('Upload a CSV or Excel file to process bulk payments') }}</VCardSubtitle>
      </VCardItem>

      <VCardText>
        <!-- Stepper Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <template v-for="(step, index) in steps" :key="index">
            <div
              class="d-flex align-center gap-2 cursor-pointer"
              :class="{ 'text-primary': currentStep >= index, 'text-disabled': currentStep < index }"
              @click="index < currentStep ? currentStep = index : null"
            >
              <VAvatar
                :color="currentStep >= index ? 'primary' : 'default'"
                :variant="currentStep >= index ? 'flat' : 'tonal'"
                size="36"
              >
                <VIcon :icon="step.icon" size="20" />
              </VAvatar>
              <span class="text-body-1 font-weight-medium d-none d-sm-inline">{{ step.title }}</span>
            </div>
            <VDivider v-if="index < steps.length - 1" class="mx-2" style="max-inline-size: 100px;" />
          </template>
        </div>

        <VDivider class="mb-6" />

        <!-- Step 1: Upload File -->
        <div v-if="currentStep === 0">
          <VRow>
            <VCol cols="12" md="8">
              <VFileInput
                v-model="selectedFile"
                :label="t('Select CSV or Excel file')"
                accept=".csv,.xlsx,.xls"
                prepend-icon="tabler-file-spreadsheet"
                show-size
                @update:model-value="onFileSelected"
              />
            </VCol>
            <VCol cols="12" md="4" class="d-flex gap-3 align-center">
              <VBtn
                color="primary"
                :disabled="!selectedFile"
                @click="parseFileClientSide"
              >
                <VIcon icon="tabler-upload" class="me-1" />
                {{ t('Parse File') }}
              </VBtn>
              <VBtn
                variant="tonal"
                color="secondary"
                @click="downloadTemplate"
              >
                <VIcon icon="tabler-download" class="me-1" />
                {{ t('Template') }}
              </VBtn>
            </VCol>
          </VRow>

          <!-- Parse errors from previous attempt -->
          <VAlert
            v-if="parseErrors.length > 0"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
          >
            <div class="font-weight-medium mb-1">{{ t('Validation Errors') }}:</div>
            <ul class="mb-0 ps-4">
              <li v-for="(err, idx) in parseErrors" :key="idx">{{ err }}</li>
            </ul>
          </VAlert>
        </div>

        <!-- Step 2: Preview & Validate -->
        <div v-if="currentStep === 1">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <span class="text-body-1 font-weight-medium">
                {{ parsedItems.length }} {{ t('records parsed') }}
              </span>
              <span class="ms-4 text-body-1">
                {{ t('Total') }}: <strong>{{ currency }} {{ totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</strong>
              </span>
            </div>
            <div style="inline-size: 15rem;">
              <AppTextField
                v-model="previewSearch"
                :placeholder="t('Search records...')"
                density="compact"
              />
            </div>
          </div>

          <VAlert
            v-if="parseErrors.length > 0"
            type="warning"
            variant="tonal"
            class="mb-4"
            closable
          >
            <div class="font-weight-medium mb-1">{{ t('Warnings') }} ({{ parseErrors.length }}):</div>
            <ul class="mb-0 ps-4">
              <li v-for="(err, idx) in parseErrors.slice(0, 5)" :key="idx">{{ err }}</li>
              <li v-if="parseErrors.length > 5">...{{ t('and') }} {{ parseErrors.length - 5 }} {{ t('more') }}</li>
            </ul>
          </VAlert>

          <VDataTable
            :headers="previewHeaders"
            :items="indexedItems"
            :search="previewSearch"
            :items-per-page="10"
            class="text-no-wrap"
          >
            <template #item.amount="{ item }">
              <div class="text-end">
                {{ Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
            </template>

            <template #item.beneficiaryBank="{ item }">
              <VChip size="small" label color="info">
                {{ item.beneficiaryBank }}
              </VChip>
            </template>
          </VDataTable>

          <div class="d-flex justify-space-between mt-4">
            <VBtn variant="tonal" @click="currentStep = 0">
              <VIcon icon="tabler-arrow-left" class="me-1" />
              {{ t('Back') }}
            </VBtn>
            <VBtn
              color="primary"
              :disabled="parsedItems.length === 0"
              @click="currentStep = 2; fetchBanksAndAccounts()"
            >
              {{ t('Next') }}
              <VIcon icon="tabler-arrow-right" class="ms-1" />
            </VBtn>
          </div>
        </div>

        <!-- Step 3: Configure -->
        <div v-if="currentStep === 2">
          <VRow>
            <VCol cols="12" md="6">
              <AppSelect
                v-model="selectedBank"
                :items="bankList"
                :label="t('Select Bank')"
                :placeholder="t('Choose disbursement bank')"
                item-title="title"
                item-value="value"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppSelect
                v-model="selectedAccount"
                :items="filteredAccounts"
                :label="t('Source Account (Debit)')"
                :placeholder="t('Choose source account')"
                item-title="title"
                item-value="value"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="narration"
                :label="t('Narration')"
                :placeholder="t('e.g. January Salary Payments')"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppSelect
                v-model="currency"
                :items="['KES', 'USD', 'EUR', 'GBP']"
                :label="t('Currency')"
              />
            </VCol>
          </VRow>

          <div class="d-flex justify-space-between mt-6">
            <VBtn variant="tonal" @click="currentStep = 1">
              <VIcon icon="tabler-arrow-left" class="me-1" />
              {{ t('Back') }}
            </VBtn>
            <VBtn
              color="primary"
              :disabled="!selectedBank || !selectedAccount"
              @click="currentStep = 3"
            >
              {{ t('Next') }}
              <VIcon icon="tabler-arrow-right" class="ms-1" />
            </VBtn>
          </div>
        </div>

        <!-- Step 4: Confirm & Submit -->
        <div v-if="currentStep === 3">
          <VRow>
            <VCol cols="12" md="6">
              <VCard variant="outlined">
                <VCardText>
                  <h6 class="text-h6 mb-4">{{ t('Disbursement Summary') }}</h6>
                  <VList density="compact" class="py-0">
                    <VListItem>
                      <template #prepend>
                        <VIcon icon="tabler-file-spreadsheet" class="me-2" />
                      </template>
                      <VListItemTitle>{{ t('Total Records') }}</VListItemTitle>
                      <template #append>
                        <span class="font-weight-medium">{{ parsedItems.length }}</span>
                      </template>
                    </VListItem>
                    <VListItem>
                      <template #prepend>
                        <VIcon icon="tabler-cash" class="me-2" />
                      </template>
                      <VListItemTitle>{{ t('Total Amount') }}</VListItemTitle>
                      <template #append>
                        <span class="font-weight-medium">
                          {{ currency }} {{ totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                        </span>
                      </template>
                    </VListItem>
                    <VListItem>
                      <template #prepend>
                        <VIcon icon="tabler-building-bank" class="me-2" />
                      </template>
                      <VListItemTitle>{{ t('Bank') }}</VListItemTitle>
                      <template #append>
                        <span class="font-weight-medium">{{ selectedBank }}</span>
                      </template>
                    </VListItem>
                    <VListItem>
                      <template #prepend>
                        <VIcon icon="tabler-credit-card" class="me-2" />
                      </template>
                      <VListItemTitle>{{ t('Source Account') }}</VListItemTitle>
                      <template #append>
                        <span class="font-weight-medium">{{ selectedAccount }}</span>
                      </template>
                    </VListItem>
                    <VListItem v-if="narration">
                      <template #prepend>
                        <VIcon icon="tabler-notes" class="me-2" />
                      </template>
                      <VListItemTitle>{{ t('Narration') }}</VListItemTitle>
                      <template #append>
                        <span class="font-weight-medium">{{ narration }}</span>
                      </template>
                    </VListItem>
                  </VList>
                </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" md="6">
              <VAlert type="info" variant="tonal" class="mb-4">
                {{ t('Please review the summary before submitting. This action will initiate') }}
                <strong>{{ parsedItems.length }}</strong> {{ t('payment(s) totaling') }}
                <strong>{{ currency }} {{ totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</strong>.
              </VAlert>

              <VAlert
                v-if="parseErrors.length > 0"
                type="warning"
                variant="tonal"
                class="mb-4"
              >
                {{ parseErrors.length }} {{ t('warning(s) were found during parsing. Rows with errors were excluded.') }}
              </VAlert>
            </VCol>
          </VRow>

          <div class="d-flex justify-space-between mt-6">
            <VBtn variant="tonal" @click="currentStep = 2">
              <VIcon icon="tabler-arrow-left" class="me-1" />
              {{ t('Back') }}
            </VBtn>
            <div class="d-flex gap-3">
              <VBtn variant="tonal" color="secondary" @click="resetForm">
                {{ t('Cancel') }}
              </VBtn>
              <VBtn
                color="primary"
                :loading="isSubmitting"
                @click="submitDisbursement"
              >
                <VIcon icon="tabler-send" class="me-1" />
                {{ t('Submit Disbursement') }}
              </VBtn>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Disbursement History Section -->
    <VCard>
      <VCardItem>
        <VCardTitle>
          <VIcon icon="tabler-history" class="me-2" />
          {{ t('Disbursement History') }}
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VDataTable
        :headers="historyHeaders"
        :items="disbursementHistory"
        :loading="isLoadingHistory"
        :items-per-page="10"
        class="text-no-wrap"
      >
        <template #item.totalAmount="{ item }">
          <div class="text-end">
            {{ Number(item.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
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

        <template #item.actions="{ item }">
          <IconBtn @click="viewDisbursement(item)">
            <VIcon icon="tabler-eye" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-6 text-disabled">
            {{ t('No disbursement history found') }}
          </div>
        </template>
      </VDataTable>
    </VCard>
  </section>
</template>
