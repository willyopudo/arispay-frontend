export default [
  { heading: 'Admin Hub' },
  {
    title: 'Company',
    icon: { icon: 'tabler-building' },
    children: [
      { title: 'Accounts', to: 'apps-logistics-dashboard' },
      { title: 'Clients', to: 'apps-logistics-fleet' },
    ],
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    to: 'apps-email',
  },
  
]
