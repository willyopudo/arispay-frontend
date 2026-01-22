<script setup>
import { computed } from 'vue'
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import {
  getComputedNavLinkToProp,
  getDynamicI18nProps,
  isNavLinkActive,
} from '@layouts/utils'
import { useTourStore } from '@/stores/tourStore'

const props = defineProps({
  item: {
    type: null,
    required: true,
  },
})

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

// Check if item is a nav action item (has navAction but no to/href)
const isNavActionItem = computed(() => {
  return props.item.navAction && !props.item.to && !props.item.href
})

// Handle click for nav action items
const handleClick = (event) => {
  if (isNavActionItem.value) {
    event.preventDefault()
    event.stopPropagation()

    // Handle specific actions
    if (props.item.navAction === 'startTour') {
      const tourStore = useTourStore()
      tourStore.startTour()
    }
  }
}
</script>

<template>
  <li
    v-if="can(item.action, item.subject)"
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="isNavActionItem ? 'a' : (item.to ? 'RouterLink' : 'a')"
      v-bind="isNavActionItem ? { href: 'javascript:void(0)' } : getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': !isNavActionItem && isNavLinkActive(item, $router) }"
      @click="handleClick"
    >
      <Component
        :is="layoutConfig.app.iconRenderer || 'div'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')"
        >
          {{ item.badgeContent }}
        </Component>
      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>
