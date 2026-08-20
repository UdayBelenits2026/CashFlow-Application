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
    route: '/dashboard',
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
  },
  {
    label: 'Spending',
    icon: 'fa-solid fa-money-bill-transfer',
    route: '/spending',
    children: [
      {
        label: 'Overview',
        route: '/spending/dashboard',
        exact: true,
      },
      {
        label: 'Expenses',
        route: '/spending/expenses',
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
 