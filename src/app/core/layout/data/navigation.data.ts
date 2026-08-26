export interface SideNavChildItem {
  label: string;
  route: string;
  icon?: string;
  exact?: boolean;
}

export interface SideNavItem {
  label: string;
  icon: string;
  route: string;
  children?: SideNavChildItem[];
}

export const navigationList: SideNavItem[] = [
  {
    label: 'Dashboard',
    icon: 'fa-solid fa-house',
    route: '/dashboard/home',
  },
  {
    label: 'Transactions',
    icon: 'fa-solid fa-arrow-right-arrow-left',
    route: '/transactions',
  },
  {
    label: 'Income',
    icon: 'fa-solid fa-wallet',
    route: '/income',
    children: [
      {
        label: 'Dashboard',
        route: '/income/dashboard',
        exact: true,
      },
      {
        label: 'History',
        route: '/income/history',
        exact: true,
      },
      {
        label: 'Sources',
        route: '/income/sources',
        exact: true,
      },
      {
        label: 'Recurring',
        route: '/income/recurring',
        exact: true,
      },
      {
        label: 'Calendar',
        route: '/income/calendar',
        exact: true,
      },
      {
        label: 'Reports',
        route: '/income/reports',
        exact: true,
      },
      {
        label: 'Trends',
        route: '/income/trends',
        exact: true,
      },
    ],
  },
  {
    label: 'Spending',
    icon: 'fa-solid fa-money-bill-transfer',
    route: '/spending',
    children: [
      {
        label: 'Dashboard',
        route: '/spending/dashboard',
        exact: true,
      },
      {
        label: 'Expenses',
        route: '/spending/expenses',
        exact: true,
      },
      {
        label: 'Trends',
        route: '/spending/trends',
        exact: true,
      },
      {
        label: 'Calendar',
        route: '/spending/calendar',
        exact: true,
      },
      {
        label: 'Recurring',
        route: '/spending/recurring',
        exact: true,
      },
      {
        label: 'Insights',
        route: '/spending/insights',
        exact: true,
      },
      {
        label: 'Alerts',
        route: '/spending/alerts',
        exact: true,
      },
      {
        label: 'Tags',
        route: '/spending/tags',
        exact: true,
      },
    ],
  },
  {
    label: 'Cash Flow',
    icon: 'fa-solid fa-circle-dollar-to-slot',
    route: '/cash-flow',
  },
  {
    label: 'Budget',
    icon: 'fa-solid fa-calendar-days',
    route: '/budget',
  },
  {
    label: 'Goals',
    icon: 'fa-solid fa-bullseye',
    route: '/goals',
  },
  {
    label: 'Accounts',
    icon: 'fa-solid fa-building-columns',
    route: '/accounts',
  },
  {
    label: 'Reports',
    icon: 'fa-solid fa-chart-column',
    route: '/reports',
  },
  {
    label: 'Settings',
    icon: 'fa-solid fa-gear',
    route: '/settings',
  },
];
