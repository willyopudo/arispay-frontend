export default [
  { heading: 'Hub' },
  {
    title: 'Company',
    icon: { icon: 'tabler-building' },
    children: [
      { title: 'Accounts', to: 'apps-account-list' },
      { title: 'Clients', to: 'apps-user-list' },
      //{ title: 'Clients', to: 'front-pages-landing-page' },
    ],
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    to: 'apps-user-list',
  },
  
]
