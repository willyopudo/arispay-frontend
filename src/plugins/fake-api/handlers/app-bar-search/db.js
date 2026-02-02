export const db = {
  searchItems: [
    {
      title: 'Dashboard',
      category: 'dashboard',
      children: [
        {
          url: { name: 'dashboards-crm' },
          icon: 'tabler-dashboard',
          title: 'Company Dashboard',
        },
      ],
    },
    {
      title: 'Transactions',
      category: 'transactions',
      children: [
        {
          url: { name: 'apps-transaction-successful-transactions-list' },
          icon: 'tabler-transfer',
          title: 'Transactions',
        },
        {
          url: { name: 'apps-transaction-rejected-transactions-list' },
          icon: 'tabler-alert-circle',
          title: 'Rejected Transactions',
        },
        {
          url: { name: 'apps-transaction-bulk-payments-list' },
          icon: 'tabler-cash',
          title: 'Bulk Payments',
        },
        {
          url: { name: 'apps-transaction-transaction-query' },
          icon: 'tabler-search',
          title: 'Transaction Query',
        },
      ],
    },
    {
      title: 'Company',
      category: 'company',
      children: [
        {
          url: { name: 'apps-company-account-list' },
          icon: 'tabler-building-bank',
          title: 'Accounts',
        },
        {
          url: { name: 'apps-company-client-list' },
          icon: 'tabler-users',
          title: 'Clients',
        },
      ],
    },
    {
      title: 'Management',
      category: 'management',
      children: [
        {
          url: { name: 'apps-user-list' },
          icon: 'tabler-users-group',
          title: 'Users',
        },
        {
          url: { name: 'apps-roles' },
          icon: 'tabler-shield-checkered',
          title: 'Roles',
        },
        {
          url: { name: 'apps-permissions' },
          icon: 'tabler-shield-lock',
          title: 'Permissions',
        },
        {
          url: { name: 'apps-notifications-list' },
          icon: 'tabler-bell',
          title: 'Notifications',
        },
      ],
    },
    {
      title: 'Settings',
      category: 'settings',
      children: [
        {
          url: { name: 'pages-account-settings-tab', params: { tab: 'account' } },
          icon: 'tabler-user-circle',
          title: 'Account Settings',
        },
        {
          url: { name: 'pages-account-settings-tab', params: { tab: 'security' } },
          icon: 'tabler-lock',
          title: 'Account Security',
        },
        {
          url: { name: 'pages-account-settings-tab', params: { tab: 'notification' } },
          icon: 'tabler-bell-ringing',
          title: 'Notification Settings',
        },
        {
          url: { name: 'pages-user-profile-tab', params: { tab: 'profile' } },
          icon: 'tabler-user',
          title: 'Profile',
        },
      ],
    },
  ],
}
