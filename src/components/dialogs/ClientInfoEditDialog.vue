<script setup>
const props = defineProps({
  clientData: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      clientName: '',
      clientEmail: '',
      companyName: '',
      createdDate: '',
      clientPhone: '',
      identifierType: '',
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
  identifierTypes: {
    type: Array,
    required: false,
    default: () => [],
  },
})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const clientData = ref(structuredClone(toRaw(props.clientData)))
console.log(clientData.value)



watch(() => props, () => {
  clientData.value = structuredClone(toRaw(props.clientData))
})

const onFormSubmit = () => {
  emit('update:isDialogVisible', false)
  emit('submit', clientData.value)
}

const onFormReset = () => {
  clientData.value = structuredClone(toRaw(props.clientData))
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
          {{ action === 'edit' ? 'Edit' : 'View' }} Client Information
        </h4>
        <p class="text-body-1 text-center mb-6">
          Updating client details will receive a privacy audit.
        </p>

        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 Name -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="clientData.clientName"
                label="Client Name"
                placeholder="John"
              />
            </VCol>
         
            <!-- 👉 Username -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="clientData.companyName"
                label="Company Name"
                placeholder="Super Company"
                disabled
              />
            </VCol>

            <!-- 👉 Client Email -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="clientData.clientEmail"
                label="Email"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- 👉 Status -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="clientData.status"
                label="Status"
                placeholder="Active"
                :items="[{ title: 'Active', value: 'active', }, { title: 'Inactive', value: 'inactive', }, { title: 'Pending', value: 'pending', }]"
                :disabled="action === 'view'"
              />
            </VCol>
   
            <!-- 👉 Contact -->
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="clientData.clientPhone"
                label="Phone Number"
                placeholder="+254 711 123 456"
              />
            </VCol>

            <!-- 👉 Current Plan -->
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="clientData.identifierType"
                label="Identifer Type"
                placeholder="Type"
                :items="identifierTypes"
                :disabled="action === 'view'"
              />
            </VCol>                 

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit"
                v-if="action === 'edit'">
                Submit
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
