/**
 * Tour step definitions for ArisPay guided tour
 * Each step targets specific UI elements and provides helpful descriptions
 */

const buttonConfig = {
  next: {
    text: 'Next',
    action: function() { this.next() },
    classes: 'shepherd-button-primary',
  },
  back: {
    text: 'Back',
    action: function() { this.back() },
    classes: 'shepherd-button-secondary',
  },
  finish: {
    text: 'Finish',
    action: function() { this.complete() },
    classes: 'shepherd-button-primary',
  },
  skip: {
    text: 'Skip Tour',
    action: function() { this.cancel() },
    classes: 'shepherd-button-secondary',
  },
}

export const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to ArisPay!',
    text: `
      <p>Let's take a quick tour to help you get familiar with the platform.</p>
      <p>ArisPay helps you manage payments, collections, and disbursements for your business.</p>
    `,
    buttons: [
      buttonConfig.skip,
      buttonConfig.next,
    ],
  },
  {
    id: 'sidebar',
    title: 'Navigation Menu',
    text: `
      <p>This is your main navigation menu.</p>
      <p>Access all features including Dashboard, Transactions, Collections, Disbursements, and more.</p>
    `,
    attachTo: {
      element: '.layout-vertical-nav',
      on: 'right',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'search',
    title: 'Quick Search',
    text: `
      <p>Use the search bar to quickly find transactions, clients, or any information across the platform.</p>
    `,
    attachTo: {
      element: '#tour-search-bar',
      on: 'bottom',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'theme-switcher',
    title: 'Theme Switcher',
    text: `
      <p>Toggle between light and dark mode for a comfortable viewing experience.</p>
    `,
    attachTo: {
      element: '#tour-theme-switcher',
      on: 'bottom',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    text: `
      <p>Stay updated with real-time notifications about transactions, payments, and important alerts.</p>
    `,
    attachTo: {
      element: '#tour-notifications',
      on: 'bottom',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'user-profile',
    title: 'Your Profile',
    text: `
      <p>Access your profile settings, account preferences, and logout from here.</p>
    `,
    attachTo: {
      element: '#tour-user-profile',
      on: 'bottom-end',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'widget-cards',
    title: 'Key Metrics',
    text: `
      <p>These cards show your key performance indicators at a glance:</p>
      <ul>
        <li><strong>Collections</strong> - Number of incoming payments</li>
        <li><strong>Disbursements</strong> - Number of outgoing payments</li>
        <li><strong>Total Collections</strong> - Total amount received</li>
        <li><strong>Total Disbursements</strong> - Total amount sent</li>
      </ul>
    `,
    attachTo: {
      element: '#tour-widget-cards',
      on: 'bottom',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'earning-reports',
    title: 'Transaction Trends',
    text: `
      <p>This chart shows your transaction trends over time.</p>
      <p>Monitor your collections and disbursements to track business performance.</p>
    `,
    attachTo: {
      element: '#tour-earning-reports',
      on: 'top',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'top-clients',
    title: 'Top Clients',
    text: `
      <p>See your top performing clients based on transaction volume.</p>
      <p>This helps you identify your most active business relationships.</p>
    `,
    attachTo: {
      element: '#tour-top-clients',
      on: 'left',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'activity-timeline',
    title: 'Recent Activity',
    text: `
      <p>Track recent activities and events in your account.</p>
      <p>Stay informed about the latest transactions and system events.</p>
    `,
    attachTo: {
      element: '#tour-activity-timeline',
      on: 'right',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'recent-transactions',
    title: 'Recent Transactions',
    text: `
      <p>View your most recent transactions with quick access to details.</p>
      <p>Click on any transaction to see more information.</p>
    `,
    attachTo: {
      element: '#tour-recent-transactions',
      on: 'top',
    },
    buttons: [
      buttonConfig.back,
      buttonConfig.next,
    ],
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    text: `
      <p>You've completed the ArisPay tour.</p>
      <p>You can restart this tour anytime by clicking <strong>"User Guide"</strong> in the Support section of the sidebar.</p>
      <p>If you need help, visit our support portal or contact our team.</p>
    `,
    buttons: [
      buttonConfig.back,
      buttonConfig.finish,
    ],
  },
]
