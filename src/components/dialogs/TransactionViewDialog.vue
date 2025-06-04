<script setup>
const props = defineProps({
  transData: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      bankTranRef: '',
      transDate: '',
      bankAccount: '',
      bank: '',
      tranAmount: '',
      client: '',
      crDrInd: '',
      payerName: '',
      payerPhone: '',
      paymentMode: '',
      narration: '',
      apiChannel: '',
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

const transactionDetailsData = [
    
  { title: 'Reference', value: props.transData.bankTranRef },
  { title: 'Transaction Date', value: formatDate(props.transData.transDate) },
  { title: 'Bank Account', value: props.transData.bankAccount },
  { title: 'Bank', value: props.transData.bank },
  { title: 'Amount', value: Number(props.transData.tranAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  { title: 'Client ID', value: props.transData.client },
  { title: 'Transaction Type', value: props.transData.crDrInd },
  { title: 'Payer Name', value: props.transData.payerName },
  { title: 'Payer Phone', value: props.transData.payerPhone },
  { title: 'Payment Mode', value: props.transData.paymentMode },
  { title: 'Narration', value: props.transData.narration },
  // { title: 'API Channel', value: props.transData.apiChannel },
]

const emit = defineEmits([
  'update:isDialogVisible'
])


const titleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// const currentPlan = computed({
//   get() {
//     return titleCase(transData.value.currentPlan);
//   },
//   set(value) {
//     transData.value.currentPlan = value;
//   }
// });
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    @update:model-value="dialogVisibleUpdate"
  >
    <DialogCloseBtn @click="emit('update:isDialogVisible', false)" />

    <VCard class="pa-2 pa-sm-10">
      <VCardText>
        <!-- 👉 Title -->
        <h4 class="text-h4 text-center mb-2">
          Transaction Details
        </h4>

        <div
          v-for="(item, index) in transactionDetailsData"
          :key="index"
        >
          <div class="d-flex flex-column flex-sm-row justify-space-between gap-4 flex-wrap py-4">
            <h6 class="text-h6">
              {{ item.title }}
            </h6>
            <div class="d-flex gap-4 flex-wrap">
              <span class="text-subtitle-1">
                {{ item.value || 'N/A' }}
              </span>
            </div>
          </div>
          <VDivider v-if="index !== transactionDetailsData.length - 1" />
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0;
  }

  .v-field__append-inner {
    padding-block-start: 0.125rem;
  }
}
</style>
