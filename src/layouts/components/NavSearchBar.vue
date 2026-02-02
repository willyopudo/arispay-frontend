<script setup>
import Shepherd from 'shepherd.js'
import { useConfigStore } from '@core/stores/config'
import { useI18n } from 'vue-i18n'
import { db } from '@db/app-bar-search/db'

const { t } = useI18n()

defineOptions({
  // 👉 Is App Search Bar Visible
  inheritAttrs: false,
})

const configStore = useConfigStore()
const isAppSearchBarVisible = ref(false)

// 👉 Default suggestions
const suggestionGroups = [
  {
    title: 'Popular Searches',
    content: [
      {
        icon: 'tabler-dashboard',
        title: 'Company Dashboard',
        url: { name: 'dashboards-crm' },
      },
      {
        icon: 'tabler-transfer',
        title: 'Transactions',
        url: { name: 'apps-transaction-successful-transactions-list' },
      },
      {
        icon: 'tabler-building-bank',
        title: 'Accounts',
        url: { name: 'apps-company-account-list' },
      },
      {
        icon: 'tabler-users',
        title: 'Clients',
        url: { name: 'apps-company-client-list' },
      },
    ],
  },
  {
    title: 'Quick Access',
    content: [
      {
        icon: 'tabler-users-group',
        title: 'Users',
        url: { name: 'apps-user-list' },
      },
      {
        icon: 'tabler-cash',
        title: 'Bulk Payments',
        url: { name: 'apps-transaction-bulk-payments-list' },
      },
      {
        icon: 'tabler-bell',
        title: 'Notifications',
        url: { name: 'apps-notifications-list' },
      },
      {
        icon: 'tabler-user-circle',
        title: 'Account Settings',
        url: { name: 'pages-account-settings-tab', params: { tab: 'account' } },
      },
    ],
  },
]

// 👉 No Data suggestion
const noDataSuggestions = [
  {
    title: 'Company Dashboard',
    icon: 'tabler-dashboard',
    url: { name: 'dashboards-crm' },
  },
  {
    title: 'Transactions',
    icon: 'tabler-transfer',
    url: { name: 'apps-transaction-successful-transactions-list' },
  },
  {
    title: 'Accounts',
    icon: 'tabler-building-bank',
    url: { name: 'apps-company-account-list' },
  },
]

const searchQuery = ref('')
const router = useRouter()
const searchResult = ref([])

const fetchResults = () => {
  const query = searchQuery.value.toLowerCase()
  if (!query) {
    searchResult.value = []

    return
  }

  const filtered = db.searchItems
    .map(group => ({
      ...group,
      children: group.children
        .filter(c => c.title.toLowerCase().includes(query))
        .slice(0, 5),
    }))
    .filter(group => group.children.length > 0)

  searchResult.value = filtered
}

watch(searchQuery, fetchResults)

const closeSearchBar = () => {
  isAppSearchBarVisible.value = false
  searchQuery.value = ''
}

const redirectToSuggestedPage = selected => {
  router.push(selected.url)
  closeSearchBar()
}

const LazyAppBarSearch = defineAsyncComponent(() => import('@core/components/AppBarSearch.vue'))
</script>

<template>
  <div
    class="d-flex align-center cursor-pointer"
    v-bind="$attrs"
    style="user-select: none;"
    @click="isAppSearchBarVisible = !isAppSearchBarVisible"
  >
    <!-- 👉 Search Trigger button -->
    <!-- close active tour while opening search bar using icon -->
    <IconBtn @click="Shepherd.activeTour?.cancel()">
      <VIcon icon="tabler-search" />
    </IconBtn>

    <span
      v-if="configStore.appContentLayoutNav === 'vertical'"
      class="d-none d-md-flex align-center text-disabled ms-2"
      @click="Shepherd.activeTour?.cancel()"
    >
      <span class="me-2">{{ $t('Search') }}</span>
      <span class="meta-key">&#8984;K</span>
    </span>
  </div>

  <!-- 👉 App Bar Search -->
  <LazyAppBarSearch
    v-model:isDialogVisible="isAppSearchBarVisible"
    :search-results="searchResult"
    @search="searchQuery = $event"
  >
    <!-- suggestion -->
    <template #suggestions>
      <VCardText class="app-bar-search-suggestions pa-12">
        <VRow v-if="suggestionGroups">
          <VCol
            v-for="suggestion in suggestionGroups"
            :key="suggestion.title"
            cols="12"
            sm="6"
          >
            <p
              class="custom-letter-spacing text-disabled text-uppercase py-2 px-4 mb-0"
              style="font-size: 0.75rem; line-height: 0.875rem;"
            >
              {{ $t(suggestion.title) }}
            </p>
            <VList class="card-list">
              <VListItem
                v-for="item in suggestion.content"
                :key="item.title"
                class="app-bar-search-suggestion mx-4 mt-2"
                @click="redirectToSuggestedPage(item)"
              >
                <VListItemTitle>{{ $t(item.title) }}</VListItemTitle>
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="20"
                    class="me-n1"
                  />
                </template>
              </VListItem>
            </VList>
          </VCol>
        </VRow>
      </VCardText>
    </template>

    <!-- no data suggestion -->
    <template #noDataSuggestion>
      <div class="mt-9">
        <span class="d-flex justify-center text-disabled mb-2">{{ $t('Try searching for') }}</span>
        <h6
          v-for="suggestion in noDataSuggestions"
          :key="suggestion.title"
          class="app-bar-search-suggestion text-h6 font-weight-regular cursor-pointer py-2 px-4"
          @click="redirectToSuggestedPage(suggestion)"
        >
          <VIcon
            size="20"
            :icon="suggestion.icon"
            class="me-2"
          />
          <span>{{ $t(suggestion.title) }}</span>
        </h6>
      </div>
    </template>

    <!-- search result -->
    <template #searchResult="{ item }">
      <VListSubheader class="text-disabled custom-letter-spacing font-weight-regular ps-4">
        {{ $t(item.title) }}
      </VListSubheader>
      <VListItem
        v-for="list in item.children"
        :key="list.title"
        :to="list.url"
        @click="closeSearchBar"
      >
        <template #prepend>
          <VIcon
            size="20"
            :icon="list.icon"
            class="me-n1"
          />
        </template>
        <template #append>
          <VIcon
            size="20"
            icon="tabler-corner-down-left"
            class="enter-icon flip-in-rtl"
          />
        </template>
        <VListItemTitle>
          {{ $t(list.title) }}
        </VListItemTitle>
      </VListItem>
    </template>
  </LazyAppBarSearch>
</template>

<style lang="scss">
@use "@styles/variables/vuetify.scss";

.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  font-size: 0.8125rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}

.app-bar-search-dialog {
  .custom-letter-spacing {
    letter-spacing: 0.8px;
  }

  .card-list {
    --v-card-list-gap: 8px;
  }
}
</style>
