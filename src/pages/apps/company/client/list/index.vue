<script setup>
import AddNewClientDrawer from '@/views/apps/user/list/AddNewClientDrawer.vue'


// 👉 Store
const searchQuery = ref('')
const selectedIdentifierType = ref()
const selectedPlan = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(5)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

//Clients stats
const fetchedClients = ref(null)
const totalFetchedClients = ref(0)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
  fetchClients()
}

const clientSummary = ref({
  totalClients: 0,
  activeClients: 0,
  inactiveClients: 0,
  pendingClients: 0,
})


// Headers
const headers = [
  {
    title: 'Client ID',
    key: 'client_id',
  },
  {
    title: 'Client Name',
    key: 'client_name',
  },
  {
    title: 'Identifier Type',
    key: 'identifier_type',
  },
  {
    title: 'Company',
    key: 'company',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Created Date',
    key: 'created_date',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
]

async function fetchClients(){
  try {
    const {
      data: clientsList,
      error,
      response
    } = await axiosApiCall('/client', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        orderBy: orderBy.value,
        search: searchQuery.value,
        identifierType: selectedIdentifierType.value,
        status: selectedStatus.value
        // plan: selectedPlan.value,
        // status: selectedStatus.value,
      }
    })
    if (error) {
      useSweetAlert.errorMessage('Error fetching clients: ' + error.message)
      return
    }
    

    fetchedClients.value = clientsList.content
    // console.log(fetchedClients.value)
    totalFetchedClients.value = clientsList.totalElements
    // clientSummary.value = clientsList.value1

    // widgetData.value[0].value = clientSummary.value.totalClients
    // widgetData.value[1].value = clientSummary.value.activeClients
    // widgetData.value[2].value = clientSummary.value.inactiveClients
    // widgetData.value[3].value = clientSummary.value.pendingClients

    useSweetAlert.toast("Clients fetched successfully");

  } catch (error) {
    console.error(error)
  }
}


console.log(fetchedClients)
const clients = computed(() => fetchedClients.value || [])
const totalClients = computed(() => totalFetchedClients.value)

// 👉 search filters

const status = [
  {
    title: 'Pending',
    value: 'pending',
  },
  {
    title: 'Active',
    value: 'active',
  },
  {
    title: 'Inactive',
    value: 'inactive',
  },
]

const identifierTypes = [
  {
    title: 'ID Number',
    value: 'ID_NUMBER',
  },
  {
    title: 'Phone Number',
    value: 'MSSIDN',
  },
  {
    title: 'Account Number',
    value: 'ACCOUNT_NUMBER',
  },
  {
    title: 'Bill Number',
    value: 'BILL_NUMBER',
  },
  {
    title: 'Registration Number',
    value: 'REG_NUMBER',
  },
  {
    title: 'Invoice Number',
    value: 'INVOICE_NUMBER',
  },
]


const resolveClientStatusVariant = stat => {
  if (stat === 0)
    return 'warning'
  if (stat === 1)
    return 'success'
  if (stat === 2)
    return 'secondary'
  
  return 'primary'
}

const isAddNewClientDrawerVisible = ref(false)

const addNewClient = async clientData => {
  
  try {
    const {
      data: cData,
      error,
      response
    } = await axiosApiCall('/client', {  
      data: clientData,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (error) {
      useSweetAlert.errorMessage('Error during client creation: ' + error.message)
      return
    }
    
    fetchClients()
    useSweetAlert.toast("Client created successfully");
 
  } catch (error) {
    console.error(error)
  }
}

const deleteClient = async id => {
  await $api(`/clients/${ id }`, { method: 'DELETE' })

  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)

  // Refetch User
  fetchClients()
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Identifier Type -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedIdentifierType"
              placeholder="Select Identifier Type"
              :items="identifierTypes"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <!-- <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedPlan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="tabler-x"
            />
          </VCol> -->
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
          <VBtn class="ml-4" @click="fetchClients">
      Filter
      <VIcon end icon="tabler-filter" />
    </VBtn>
        </VCol>
          
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 5, title: '5' },
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              placeholder="Search Client"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
          >
            Export
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewClientDrawerVisible = true"
          >
            Add New Client
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="clients"
        item-value="id"
        :items-length="totalClients"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- User -->
        <template #item.client_id="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.clientId }}
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.id }}
              </div>
            </div>
          </div>
        </template>

        <!-- 👉 Role -->
        <template #item.client_name="{ item }">
          <div class="d-flex align-center gap-x-2">
            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.clientName }}
            </div>
          </div>
        </template>

        <!-- Plan -->
        <template #item.identifier_type="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.identifierType }}
          </div>
        </template>

        <!-- Plan -->
        <template #item.company="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.companyName }}
          </div>
        </template>

        <!-- Plan -->
        <template #item.created_date="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.createdDate }}
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveClientStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.status == '0' ? 'IN_ACTIVE' : 'ACTIVE' }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="deleteClient(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn>
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
          >
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.id } }">
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>

                  <VListItemTitle>View</VListItemTitle>
                </VListItem>

                <VListItem link>
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>

                <VListItem @click="deleteClient(item.id)">
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Delete</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalClients"
          />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewClientDrawer
      v-model:isDrawerOpen="isAddNewClientDrawerVisible"
      @client-data="addNewClient"
    />
  </section>
</template>
