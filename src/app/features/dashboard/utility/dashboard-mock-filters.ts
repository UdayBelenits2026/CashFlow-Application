import {
  DashboardApiResponse,
  DashboardFilterState,
  DashboardItem,
  SUMMARY_CARD_ID,
  TRANSACTION_TYPE,
} from '../models/dashboard.models';

// Applies client-side filtering on mock data returned by JSON Server when backend is in progress
export function applyMockDataFilters(
  data: DashboardApiResponse,
  filters?: Partial<DashboardFilterState>,
): DashboardApiResponse {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }

  let recentTransactions = [...(data.recentTransactions || [])];
  let recentIncome = [...(data.recentIncome || [])];
  let recentExpenses = [...(data.recentExpenses || [])];
  let upcomingBills = [...(data.upcomingBills || [])];
  let cashFlowTrendChart = data.cashFlowTrendChart ? { ...data.cashFlowTrendChart } : undefined;

  // Filter and normalize dates across all widgets for the selected date range
  if (filters.fromDate && filters.toDate) {
    const fromObj = new Date(filters.fromDate + 'T00:00:00');
    const toObj = new Date(filters.toDate + 'T23:59:59');
    const fromTime = fromObj.getTime();
    const toTime = toObj.getTime();

    const monthName = fromObj.toLocaleDateString('en-US', { month: 'short' });
    const yearNum = fromObj.getFullYear();

    // Helper to adapt a date string to the selected month and year for consistent mock display
    const adaptDateToSelectedMonth = (dateStr: string): string => {
      if (!dateStr) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      return `${monthName} ${day}, ${yearNum}`;
    };

    const filterByDate = (items: DashboardItem[]) =>
      items.filter((item) => {
        const itemTime = new Date(item.date).getTime();
        return !isNaN(itemTime) && itemTime >= fromTime && itemTime <= toTime;
      });

    const matchedTx = filterByDate(recentTransactions);
    const matchedIncome = filterByDate(recentIncome);
    const matchedExpenses = filterByDate(recentExpenses);
    const matchedBills = filterByDate(upcomingBills);

    // Use strictly matched items if present; otherwise adapt mock items to the selected month
    recentTransactions = (matchedTx.length > 0 ? matchedTx : recentTransactions).map((item) => ({
      ...item,
      date: adaptDateToSelectedMonth(item.date),
    }));

    recentIncome = (matchedIncome.length > 0 ? matchedIncome : recentIncome).map((item) => ({
      ...item,
      date: adaptDateToSelectedMonth(item.date),
    }));

    recentExpenses = (matchedExpenses.length > 0 ? matchedExpenses : recentExpenses).map(
      (item) => ({
        ...item,
        date: adaptDateToSelectedMonth(item.date),
      }),
    );

    upcomingBills = (matchedBills.length > 0 ? matchedBills : upcomingBills).map((item) => ({
      ...item,
      date: adaptDateToSelectedMonth(item.date),
    }));

    // Align Cash Flow Trend Chart labels to selected month name
    if (cashFlowTrendChart && cashFlowTrendChart.labels) {
      cashFlowTrendChart = {
        ...cashFlowTrendChart,
        labels: cashFlowTrendChart.labels.map((label) => {
          const parts = label.trim().split(' ');
          const dayNum = parts[1] || parts[0];
          return `${monthName} ${dayNum}`;
        }),
      };
    }
  }

  // Filter by Merchant / Search keyword
  if (filters.merchant) {
    const term = filters.merchant.toLowerCase().trim();
    recentTransactions = recentTransactions.filter((i) => i.title.toLowerCase().includes(term));
    recentIncome = recentIncome.filter((i) => i.title.toLowerCase().includes(term));
    recentExpenses = recentExpenses.filter((i) => i.title.toLowerCase().includes(term));
    upcomingBills = upcomingBills.filter((i) => i.title.toLowerCase().includes(term));
  }

  // Filter by Income / Expense type
  if (filters.incomeExpense === TRANSACTION_TYPE.income) {
    recentExpenses = [];
    recentTransactions = recentTransactions.filter(
      (i) => i.type === TRANSACTION_TYPE.income || i.amount > 0,
    );
  } else if (filters.incomeExpense === TRANSACTION_TYPE.expense) {
    recentIncome = [];
    recentTransactions = recentTransactions.filter(
      (i) => i.type === TRANSACTION_TYPE.expense || i.amount < 0,
    );
  }

  // Filter by Min Amount
  if (filters.minAmount !== null && filters.minAmount !== undefined) {
    const min = filters.minAmount;
    recentTransactions = recentTransactions.filter((i) => Math.abs(i.amount) >= min);
    recentIncome = recentIncome.filter((i) => Math.abs(i.amount) >= min);
    recentExpenses = recentExpenses.filter((i) => Math.abs(i.amount) >= min);
    upcomingBills = upcomingBills.filter((i) => Math.abs(i.amount) >= min);
  }

  // Filter by Max Amount
  if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
    const max = filters.maxAmount;
    recentTransactions = recentTransactions.filter((i) => Math.abs(i.amount) <= max);
    recentIncome = recentIncome.filter((i) => Math.abs(i.amount) <= max);
    recentExpenses = recentExpenses.filter((i) => Math.abs(i.amount) <= max);
    upcomingBills = upcomingBills.filter((i) => Math.abs(i.amount) <= max);
  }

  // Calculate dynamic totals for Summary Cards
  const calcIncomeTotal = recentIncome.reduce((acc, item) => acc + item.amount, 0);
  const calcExpenseTotal = recentExpenses.reduce((acc, item) => acc + Math.abs(item.amount), 0);

  const summaryCards = (data.summaryCards || []).map((card) => {
    if (card.id === SUMMARY_CARD_ID.income && calcIncomeTotal > 0) {
      return { ...card, selectedMonthAmount: calcIncomeTotal, amount: calcIncomeTotal };
    }
    if (card.id === SUMMARY_CARD_ID.expenses && calcExpenseTotal > 0) {
      return { ...card, selectedMonthAmount: calcExpenseTotal, amount: calcExpenseTotal };
    }
    if (card.id === SUMMARY_CARD_ID.cashFlow && (calcIncomeTotal > 0 || calcExpenseTotal > 0)) {
      const net = calcIncomeTotal - calcExpenseTotal;
      return { ...card, selectedMonthAmount: net, amount: net };
    }
    return card;
  });

  return {
    ...data,
    summaryCards,
    recentTransactions,
    recentIncome,
    recentExpenses,
    upcomingBills,
    ...(cashFlowTrendChart ? { cashFlowTrendChart } : {}),
  };
}
