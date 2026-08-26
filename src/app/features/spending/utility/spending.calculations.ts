import { Expense } from '../models/expense.model';
import {
  SpendingOverviewData,
  SpendingCategoryItem,
  SpendingMerchant,
  BudgetVsActualItem,
  BudgetStatus,
  SpendingInsight
} from '../models/spending-summary.model';
import { TrendTab, TrendBucket, DayStat, TrendStats } from '../models/spending-trends.model';
import { DayDetailsStats } from '../models/day-details.model';
import { CalendarDay } from '../models/calendar-day.model';

// Days used to derive the average-daily figure for the current period.
const DAYS_IN_MONTH = 31;

/** Recomputes overview KPIs and category totals from the current expense list. */
export function recalculateOverviewAndCategories(
  expenses: Expense[],
  currentOverview: SpendingOverviewData | null,
  currentCategories: SpendingCategoryItem[]
): { overview: SpendingOverviewData | null; categories: SpendingCategoryItem[] } {
  if (!currentOverview) {
    return { overview: currentOverview, categories: currentCategories };
  }

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const count = expenses.length;
  const avgDaily = count > 0 ? Number((total / DAYS_IN_MONTH).toFixed(2)) : 0;

  const catTotals: { [name: string]: number } = {};
  for (const exp of expenses) {
    const cat = exp.categoryName || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + (Number(exp.amount) || 0);
  }

  let topCatName = currentOverview.topCategoryName;
  let topCatAmount = currentOverview.topCategoryAmount;
  let maxCatAmount = -1;

  for (const [cName, cAmt] of Object.entries(catTotals)) {
    if (cAmt > maxCatAmount) {
      maxCatAmount = cAmt;
      topCatName = cName;
      topCatAmount = cAmt;
    }
  }

  const updatedOverview: SpendingOverviewData = {
    ...currentOverview,
    totalSpending: Number(total.toFixed(2)),
    transactionsCount: count,
    averageDaily: avgDaily,
    topCategoryName: topCatName,
    topCategoryAmount: Number(topCatAmount.toFixed(2)),
    budgetUsedPercentage: currentOverview.budgetTotal
      ? Math.min(100, Math.round((total / currentOverview.budgetTotal) * 100))
      : currentOverview.budgetUsedPercentage || 66
  };

  const updatedCategories = currentCategories.map((c) => {
    const amt = catTotals[c.name] ?? c.amount;
    const pct = total > 0 ? Number(((amt / total) * 100).toFixed(1)) : 0;
    return {
      ...c,
      amount: Number(amt.toFixed(2)),
      percentage: pct,
      barWidth: `${Math.min(100, Math.max(10, Math.round(pct * 3.5)))}%`
    };
  });

  return { overview: updatedOverview, categories: updatedCategories };
}

/** Builds a full Expense entity from a partial payload, applying defaults. */
export function buildExpenseEntity(expense: Partial<Expense>): Expense {
  return {
    id: `exp-${Date.now()}`,
    amount: Number(expense.amount) || 0,
    date: expense.date || new Date().toISOString().split('T')[0],
    merchantName: expense.merchantName || 'Unknown Merchant',
    categoryId: expense.categoryId || 'cat-1',
    categoryName: expense.categoryName || 'Food & Dining',
    categoryColor: expense.categoryColor || '#0F172A',
    accountId: expense.accountId || 'acc-1',
    accountName: expense.accountName || 'Main Checking',
    paymentMethod: expense.paymentMethod || 'DEBIT_CARD',
    tags: expense.tags || [],
    notes: expense.notes || '',
    receiptUrl: expense.receiptUrl,
    receiptFileName: expense.receiptFileName,
    status: expense.status || 'CLEARED',
    createdAt: new Date().toISOString()
  };
}

/** Aggregates expenses into a ranked top-merchants list. */
export function computeTopMerchants(expenses: Expense[]): SpendingMerchant[] {
  if (!expenses || expenses.length === 0) return [];

  const grandTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const map = new Map<string, { amount: number; count: number; categories: Record<string, number>; color: string }>();

  for (const e of expenses) {
    const key = e.merchantName || 'Unknown Merchant';
    const entry = map.get(key) || { amount: 0, count: 0, categories: {}, color: e.categoryColor || '#3B82F6' };
    entry.amount += Number(e.amount) || 0;
    entry.count += 1;
    entry.categories[e.categoryName] = (entry.categories[e.categoryName] || 0) + (Number(e.amount) || 0);
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([name, data]) => {
      const topCategoryName = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      return {
        name,
        amount: Number(data.amount.toFixed(2)),
        transactionCount: data.count,
        percentage: grandTotal > 0 ? Number(((data.amount / grandTotal) * 100).toFixed(1)) : 0,
        topCategoryName,
        color: data.color
      };
    })
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
}

/** Derives budget-vs-actual rows from categories that have a budget. */
export function computeBudgetVsActual(categories: SpendingCategoryItem[]): BudgetVsActualItem[] {
  return categories
    .filter((c) => (c.budget ?? 0) > 0)
    .map((c) => {
      const budget = c.budget ?? 0;
      const spent = c.amount ?? 0;
      const percentUsed = budget > 0 ? Number(((spent / budget) * 100).toFixed(1)) : 0;
      let status: BudgetStatus;
      switch (true) {
        case percentUsed > 100:
          status = 'OVER_BUDGET';
          break;
        case percentUsed >= 80:
          status = 'WARNING';
          break;
        default:
          status = 'ON_TRACK';
      }
      return { id: c.id, name: c.name, color: c.color, budget, spent, percentUsed, status };
    })
    .sort((a, b) => b.percentUsed - a.percentUsed);
}

/** Produces rule-based spending insights from the overview and expenses. */
export function computeInsights(
  overview: SpendingOverviewData | null,
  expenses: Expense[]
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  if (!overview) return insights;

  if (overview.topCategoryName) {
    insights.push({
      id: 'ins-1',
      title: 'Top Spending Category',
      message: `You spent ₹${overview.topCategoryAmount.toFixed(2)} on ${overview.topCategoryName}, which represents your highest expenditure this period.`,
      type: 'info',
      badge: 'Category'
    });
  }

  if (overview.averageDaily) {
    insights.push({
      id: 'ins-2',
      title: 'Average Daily Outflow',
      message: `Your average daily spending is ₹${overview.averageDaily.toFixed(2)}. ${overview.averageDailyGrowthPercentage >= 0 ? `Up by ${overview.averageDailyGrowthPercentage}%` : `Down by ${Math.abs(overview.averageDailyGrowthPercentage)}%`} compared to previous baseline.`,
      type: overview.averageDailyGrowthPercentage > 5 ? 'negative' : 'positive',
      badge: 'Daily Trend'
    });
  }

  if (expenses.length > 0) {
    const merchantMap: { [m: string]: number } = {};
    for (const e of expenses) {
      merchantMap[e.merchantName] = (merchantMap[e.merchantName] || 0) + e.amount;
    }
    let topMerchant = '';
    let topMerchantAmt = 0;
    for (const [m, amt] of Object.entries(merchantMap)) {
      if (amt > topMerchantAmt) {
        topMerchantAmt = amt;
        topMerchant = m;
      }
    }
    if (topMerchant) {
      insights.push({
        id: 'ins-3',
        title: 'Frequent Merchant',
        message: `${topMerchant} is your top merchant with total volume of ₹${topMerchantAmt.toFixed(2)}.`,
        type: 'neutral',
        badge: 'Merchant'
      });
    }
  }

  const budgetPct = overview.budgetUsedPercentage || 66;
  insights.push({
    id: 'ins-4',
    title: 'Budget Discipline',
    message: `You have consumed ${budgetPct}% of your allocated monthly spending ceiling. 5 out of 8 categories remain securely within budget.`,
    type: budgetPct > 85 ? 'negative' : 'positive',
    badge: 'Budget'
  });

  return insights;
}

// --- Trends view calculations ---

/** Buckets expenses into trend periods (daily/weekly/monthly/quarterly/yearly). */
export function buildTrendBuckets(expenses: Expense[], tab: TrendTab): TrendBucket[] {
  const map: Map<string, { amount: number; sort: number }> = new Map<string, { amount: number; sort: number }>();

  for (const e of expenses) {
    const d: Date = new Date(e.date);
    if (isNaN(d.getTime())) continue;
    const { key, sort } = trendBucketKey(tab, d);
    const entry: { amount: number; sort: number } = map.get(key) || { amount: 0, sort };
    entry.amount += Number(e.amount) || 0;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([label, data]) => ({ label, amount: Number(data.amount.toFixed(2)), sort: data.sort }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ label, amount }) => ({ label, amount }));
}

/** Computes total, average, highest and lowest spending days from expenses. */
export function computeTrendStats(expenses: Expense[]): TrendStats {
  const totalSpending: number = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const dailyMap: Map<string, number> = new Map<string, number>();
  for (const e of expenses) {
    dailyMap.set(e.date, (dailyMap.get(e.date) || 0) + (Number(e.amount) || 0));
  }

  const distinctDays: number = dailyMap.size || 1;
  const averageDaily: number = Number((totalSpending / distinctDays).toFixed(2));

  let highestDay: DayStat = { label: '—', amount: -Infinity };
  let lowestDay: DayStat = { label: '—', amount: Infinity };
  for (const [date, amt] of dailyMap.entries()) {
    const label: string = formatTrendDayLabel(date);
    if (amt > highestDay.amount) highestDay = { label, amount: amt };
    if (amt < lowestDay.amount) lowestDay = { label, amount: amt };
  }

  return {
    totalSpending,
    averageDaily,
    highestDay: highestDay.amount === -Infinity ? { label: '—', amount: 0 } : highestDay,
    lowestDay: lowestDay.amount === Infinity ? { label: '—', amount: 0 } : lowestDay
  };
}

function trendBucketKey(tab: TrendTab, d: Date): { key: string; sort: number } {
  const year: number = d.getFullYear();
  const month: number = d.getMonth();
  switch (tab) {
    case 'DAILY': {
      const key: string = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { key, sort: d.getTime() };
    }
    case 'WEEKLY': {
      const weekStart: Date = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key: string = `Wk ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      return { key, sort: weekStart.getTime() };
    }
    case 'MONTHLY': {
      const key: string = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { key, sort: year * 12 + month };
    }
    case 'QUARTERLY': {
      const q: number = Math.floor(month / 3) + 1;
      const key: string = `Q${q} ${year}`;
      return { key, sort: year * 4 + q };
    }
    case 'YEARLY': {
      return { key: String(year), sort: year };
    }
  }
}

function formatTrendDayLabel(date: string): string {
  const d: Date = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Day details calculations ---

/** Aggregates a single day's expenses into KPI stats and a category breakdown. */
export function computeDayDetailsStats(dayExpenses: Expense[]): DayDetailsStats {
  const totalSpent: number = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const merchantMap: Map<string, number> = new Map<string, number>();
  const categoryMap: Map<string, { amount: number; color: string }> = new Map<string, { amount: number; color: string }>();
  for (const e of dayExpenses) {
    merchantMap.set(e.merchantName, (merchantMap.get(e.merchantName) || 0) + (Number(e.amount) || 0));
    const cat: { amount: number; color: string } = categoryMap.get(e.categoryName) || { amount: 0, color: e.categoryColor || '#3B82F6' };
    cat.amount += Number(e.amount) || 0;
    categoryMap.set(e.categoryName, cat);
  }

  const topCatEntry: [string, { amount: number; color: string }] | undefined =
    Array.from(categoryMap.entries()).sort((a, b) => b[1].amount - a[1].amount)[0];

  return {
    totalSpent,
    transactionCount: dayExpenses.length,
    topMerchant: topMapKey(merchantMap) || '—',
    topCategory: topCatEntry ? topCatEntry[0] : '—',
    categoryLabels: Array.from(categoryMap.keys()),
    categoryAmounts: Array.from(categoryMap.values()).map((c) => Number(c.amount.toFixed(2))),
    categoryColors: Array.from(categoryMap.values()).map((c) => c.color)
  };
}

function topMapKey(map: Map<string, number>): string {
  let key: string = '';
  let max: number = -Infinity;
  for (const [k, v] of map.entries()) {
    if (v > max) {
      max = v;
      key = k;
    }
  }
  return key;
}

// --- Expense calendar calculations ---

/** Builds the calendar grid (with previous/next-month padding) for a given month. */
export function buildCalendarDays(currentDate: Date, expenses: Expense[], today: Date): CalendarDay[] {
  const year: number = currentDate.getFullYear();
  const month: number = currentDate.getMonth();

  const firstDayIndex: number = new Date(year, month, 1).getDay();
  const totalDays: number = new Date(year, month + 1, 0).getDate();
  const prevMonthDays: number = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // Previous month padding
  for (let i: number = firstDayIndex - 1; i >= 0; i--) {
    const d: Date = new Date(year, month - 1, prevMonthDays - i);
    days.push(createCalendarDay(d, false, expenses, today));
  }

  // Current month days
  for (let i: number = 1; i <= totalDays; i++) {
    const d: Date = new Date(year, month, i);
    days.push(createCalendarDay(d, true, expenses, today));
  }

  // Next month padding to complete the final week row
  const remaining: number = (7 - (days.length % 7)) % 7;
  for (let i: number = 1; i <= remaining; i++) {
    const d: Date = new Date(year, month + 1, i);
    days.push(createCalendarDay(d, false, expenses, today));
  }

  return days;
}

function createCalendarDay(date: Date, isCurrentMonth: boolean, expenses: Expense[], today: Date): CalendarDay {
  const y: number = date.getFullYear();
  const m: string = String(date.getMonth() + 1).padStart(2, '0');
  const d: string = String(date.getDate()).padStart(2, '0');
  const dateString: string = `${y}-${m}-${d}`;

  const matchingExpenses: Expense[] = expenses.filter((e) => e.date === dateString);
  const total: number = matchingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    date,
    dateString,
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday:
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate(),
    totalSpending: total,
    expenses: matchingExpenses
  };
}
