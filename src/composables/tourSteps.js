/**
 * Tour step definitions for ArisPay guided tour
 * Each step targets specific UI elements and provides helpful descriptions
 * Uses i18n for translations - text is resolved at tour start time
 */
import { getI18n } from '@/plugins/i18n'

const buttonConfig = () => {
  const { t } = getI18n().global

  return {
    next: {
      text: t('tour.next'),
      action: function() { this.next() },
      classes: 'shepherd-button-primary',
    },
    back: {
      text: t('tour.back'),
      action: function() { this.back() },
      classes: 'shepherd-button-secondary',
    },
    finish: {
      text: t('tour.finish'),
      action: function() { this.complete() },
      classes: 'shepherd-button-primary',
    },
    skip: {
      text: t('tour.skip'),
      action: function() { this.cancel() },
      classes: 'shepherd-button-secondary',
    },
  }
}

export function getTourSteps() {
  const { t } = getI18n().global
  const buttons = buttonConfig()

  return [
    {
      id: 'welcome',
      title: t('tour.welcome.title'),
      text: `
        <p>${t('tour.welcome.text1')}</p>
        <p>${t('tour.welcome.text2')}</p>
      `,
      buttons: [
        buttons.skip,
        buttons.next,
      ],
    },
    {
      id: 'sidebar',
      title: t('tour.sidebar.title'),
      text: `
        <p>${t('tour.sidebar.text1')}</p>
        <p>${t('tour.sidebar.text2')}</p>
      `,
      attachTo: {
        element: '.layout-vertical-nav',
        on: 'right',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'search',
      title: t('tour.search.title'),
      text: `
        <p>${t('tour.search.text1')}</p>
      `,
      attachTo: {
        element: '#tour-search-bar',
        on: 'bottom',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'theme-switcher',
      title: t('tour.themeSwitcher.title'),
      text: `
        <p>${t('tour.themeSwitcher.text1')}</p>
      `,
      attachTo: {
        element: '#tour-theme-switcher',
        on: 'bottom',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'notifications',
      title: t('tour.notifications.title'),
      text: `
        <p>${t('tour.notifications.text1')}</p>
      `,
      attachTo: {
        element: '#tour-notifications',
        on: 'bottom',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'user-profile',
      title: t('tour.userProfile.title'),
      text: `
        <p>${t('tour.userProfile.text1')}</p>
      `,
      attachTo: {
        element: '#tour-user-profile',
        on: 'bottom-end',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'widget-cards',
      title: t('tour.widgetCards.title'),
      text: `
        <p>${t('tour.widgetCards.text1')}</p>
        <ul>
          <li><strong>${t('tour.widgetCards.collections')}</strong> - ${t('tour.widgetCards.collectionsDesc')}</li>
          <li><strong>${t('tour.widgetCards.disbursements')}</strong> - ${t('tour.widgetCards.disbursementsDesc')}</li>
          <li><strong>${t('tour.widgetCards.totalCollections')}</strong> - ${t('tour.widgetCards.totalCollectionsDesc')}</li>
          <li><strong>${t('tour.widgetCards.totalDisbursements')}</strong> - ${t('tour.widgetCards.totalDisbursementsDesc')}</li>
        </ul>
      `,
      attachTo: {
        element: '#tour-widget-cards',
        on: 'bottom',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'earning-reports',
      title: t('tour.earningReports.title'),
      text: `
        <p>${t('tour.earningReports.text1')}</p>
        <p>${t('tour.earningReports.text2')}</p>
      `,
      attachTo: {
        element: '#tour-earning-reports',
        on: 'top',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'top-clients',
      title: t('tour.topClients.title'),
      text: `
        <p>${t('tour.topClients.text1')}</p>
        <p>${t('tour.topClients.text2')}</p>
      `,
      attachTo: {
        element: '#tour-top-clients',
        on: 'left',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'activity-timeline',
      title: t('tour.activityTimeline.title'),
      text: `
        <p>${t('tour.activityTimeline.text1')}</p>
        <p>${t('tour.activityTimeline.text2')}</p>
      `,
      attachTo: {
        element: '#tour-activity-timeline',
        on: 'right',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'recent-transactions',
      title: t('tour.recentTransactions.title'),
      text: `
        <p>${t('tour.recentTransactions.text1')}</p>
        <p>${t('tour.recentTransactions.text2')}</p>
      `,
      attachTo: {
        element: '#tour-recent-transactions',
        on: 'top',
      },
      buttons: [
        buttons.back,
        buttons.next,
      ],
    },
    {
      id: 'complete',
      title: t('tour.complete.title'),
      text: `
        <p>${t('tour.complete.text1')}</p>
        <p>${t('tour.complete.text2')}</p>
        <p>${t('tour.complete.text3')}</p>
      `.replace(/"User Guide"/g, '<strong>"User Guide"</strong>'),
      buttons: [
        buttons.back,
        buttons.finish,
      ],
    },
  ]
}
