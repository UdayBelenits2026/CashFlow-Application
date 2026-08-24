import { Income } from '../models/income.model';
import { IncomeSource } from '../models/income-source.model';
import { RecurringIncome } from '../models/recurring-income.model';
import {
  IncomeOverviewData,
  IncomeSourceReportItem,
  UpcomingIncomeItem,
  IncomeInsight,
  IncomeTrendPoint
} from '../models/income-summary.model';
import { IncomeCalendarDay, IncomeCalendarItem } from '../models/income-calendar.model';
import { getSourceTypeColor } from './income.helpers';

const DAYS_IN_MONTH = 31;

/**
 * Recalculates the high-level overview metrics and source breakdown.
 */
export function recalculateIncomeOverviewAndSources(
  incomes: Income[],
  sources: IncomeSource[],
  recurring: RecurringIncome[],
  currentOverview: IncomeOverviewData | null
): { overview: IncomeOverviewData | null; sources: IncomeSource[] } {
  if (!currentOverview) {
    return { overview: currentOverview, sources };
  }

  // Filter only recorded transactions
  const recordedIncomes = incomes.filter((i) => i.status === 'RECORDED');
  const total = recordedIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const receiptsCount = recordedIncomes.length;
  const taxableSum = recordedIncomes
    .filter((i) => i.taxable)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // Group by source to find top source and source totals
  const sourceTotals: { [sourceId: string]: number } = {};
  for (const inc of recordedIncomes) {
    const sId = inc.incomeSourceId || inc.sourceName;
    sourceTotals[sId] = (sourceTotals[sId] || 0) + (Number(inc.amount) || 0);
  }

  let topSourceName = currentOverview.topSourceName;
  let topSourceAmount = currentOverview.topSourceAmount;
  let maxAmount = -1;

  for (const [sId, amt] of Object.entries(sourceTotals)) {
    if (amt > maxAmount) {
      maxAmount = amt;
      const matchedSource = sources.find((s) => s.id === sId || s.name === sId);
      topSourceName = matchedSource ? matchedSource.name : sId;
      topSourceAmount = amt;
    }
  }

  const topSourcePercentage = total > 0 ? Number(((topSourceAmount / total) * 100).toFixed(1)) : 0;
  const activeSourcesCount = sources.filter((s) => s.status === 'ACTIVE').length;

  const totalRecurringExpected = recurring
    .filter((r) => r.status === 'ACTIVE')
    .reduce((sum, r) => sum + (Number(r.expectedAmount) || 0), 0);

  const updatedOverview: IncomeOverviewData = {
    ...currentOverview,
    totalIncome: Number(total.toFixed(2)),
    receiptsCount,
    taxableIncome: Number(taxableSum.toFixed(2)),
    topSourceName,
    topSourceAmount: Number(topSourceAmount.toFixed(2)),
    topSourcePercentage,
    activeSourcesCount,
    totalRecurringExpected: Number(totalRecurringExpected.toFixed(2)),
    averageMonthly: Number((total / 1).toFixed(2)) // current active period
  };

  const updatedSources = sources.map((src) => {
    const ytd = sourceTotals[src.id] ?? src.totalReceivedYtd ?? 0;
    return {
      ...src,
      totalReceivedYtd: Number(ytd.toFixed(2))
    };
  });

  return { overview: updatedOverview, sources: updatedSources };
}

/**
 * Calculates the next recurring date given an occurrence date and frequency.
 */
export function calculateNextRecurringDate(currentDateStr: string, frequency: string): string {
  const date = new Date(currentDateStr);
  if (isNaN(date.getTime())) {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    return today.toISOString().split('T')[0];
  }

  switch (frequency) {
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BI_WEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'ANNUALLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().split('T')[0];
}

/**
 * Generates UpcomingIncomeItem list from active recurring schedules.
 */
export function calculateUpcomingIncomeItems(recurringList: RecurringIncome[]): UpcomingIncomeItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return recurringList
    .filter((r) => r.status === 'ACTIVE' && r.nextIncomeDate)
    .map((r) => {
      const nextDate = new Date(r.nextIncomeDate!);
      nextDate.setHours(0, 0, 0, 0);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: 'UPCOMING' | 'DUE_TODAY' | 'OVERDUE' = 'UPCOMING';
      if (diffDays === 0) status = 'DUE_TODAY';
      else if (diffDays < 0) status = 'OVERDUE';

      return {
        recurringId: r.id,
        sourceName: r.sourceName,
        sourceType: r.sourceType,
        sourceColor: r.sourceColor || getSourceTypeColor(r.sourceType),
        accountName: r.accountName,
        amount: r.expectedAmount,
        expectedDate: r.nextIncomeDate!,
        daysRemaining: diffDays,
        status
      };
    })
    .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());
}

/**
 * Generates IncomeSourceReportItem breakdown.
 */
export function computeSourceReportItems(incomes: Income[], sources: IncomeSource[]): IncomeSourceReportItem[] {
  const recordedIncomes = incomes.filter((i) => i.status === 'RECORDED');
  const total = recordedIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const breakdownMap: { [sourceName: string]: { amount: number; count: number; type: any; color: string; id: string } } = {};

  for (const src of sources) {
    breakdownMap[src.name] = {
      amount: 0,
      count: 0,
      type: src.type,
      color: src.color || getSourceTypeColor(src.type),
      id: src.id
    };
  }

  for (const inc of recordedIncomes) {
    const sName = inc.sourceName || 'Other';
    if (!breakdownMap[sName]) {
      breakdownMap[sName] = {
        amount: 0,
        count: 0,
        type: inc.sourceType || 'Other',
        color: inc.sourceColor || getSourceTypeColor(inc.sourceType),
        id: inc.incomeSourceId || sName
      };
    }
    breakdownMap[sName].amount += Number(inc.amount) || 0;
    breakdownMap[sName].count += 1;
  }

  const items: IncomeSourceReportItem[] = Object.entries(breakdownMap)
    .filter(([_, data]) => data.amount > 0)
    .map(([sName, data]) => {
      const pct = total > 0 ? Number(((data.amount / total) * 100).toFixed(1)) : 0;
      return {
        sourceId: data.id,
        sourceName: sName,
        sourceType: data.type,
        amount: Number(data.amount.toFixed(2)),
        percentage: pct,
        color: data.color,
        barWidth: `${Math.min(100, Math.max(10, pct))}%`,
        transactionCount: data.count
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return items;
}

/**
 * Generates calendar days grid for month/year with combined recorded & upcoming markers.
 */
export function computeCalendarDays(
  year: number,
  month: number, // 1-12
  recordedIncomes: Income[],
  recurringList: RecurringIncome[]
): IncomeCalendarDay[] {
  const days: IncomeCalendarDay[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const numDaysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Pad previous month days
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 2, dayNum);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: false,
      recordedAmount: 0,
      upcomingAmount: 0,
      totalAmount: 0,
      recordedCount: 0,
      upcomingCount: 0,
      items: []
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Current month days
  for (let dayNum = 1; dayNum <= numDaysInMonth; dayNum++) {
    const currentDate = new Date(year, month - 1, dayNum);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayRecorded = recordedIncomes
      .filter((inc) => inc.status === 'RECORDED' && inc.date === dateStr)
      .map(
        (inc): IncomeCalendarItem => ({
          id: inc.id,
          type: 'RECORDED',
          sourceName: inc.sourceName,
          sourceType: inc.sourceType,
          sourceColor: inc.sourceColor || getSourceTypeColor(inc.sourceType),
          accountName: inc.accountName,
          amount: inc.amount,
          description: inc.description,
          date: inc.date,
          isTaxable: inc.taxable
        })
      );

    const dayUpcoming = recurringList
      .filter((r) => r.status === 'ACTIVE' && r.nextIncomeDate === dateStr)
      .map(
        (r): IncomeCalendarItem => ({
          id: r.id,
          type: 'UPCOMING',
          sourceName: r.sourceName,
          sourceType: r.sourceType,
          sourceColor: r.sourceColor || getSourceTypeColor(r.sourceType),
          accountName: r.accountName,
          amount: r.expectedAmount,
          description: `Scheduled ${r.frequency} expected income`,
          date: r.nextIncomeDate!
        })
      );

    const recordedAmount = dayRecorded.reduce((sum, item) => sum + item.amount, 0);
    const upcomingAmount = dayUpcoming.reduce((sum, item) => sum + item.amount, 0);

    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      recordedAmount: Number(recordedAmount.toFixed(2)),
      upcomingAmount: Number(upcomingAmount.toFixed(2)),
      totalAmount: Number((recordedAmount + upcomingAmount).toFixed(2)),
      recordedCount: dayRecorded.length,
      upcomingCount: dayUpcoming.length,
      items: [...dayRecorded, ...dayUpcoming]
    });
  }

  // Pad next month days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month, i);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: false,
      recordedAmount: 0,
      upcomingAmount: 0,
      totalAmount: 0,
      recordedCount: 0,
      upcomingCount: 0,
      items: []
    });
  }

  return days;
}

/**
 * Generates dynamic smart insights based on income state.
 */
export function deriveIncomeInsights(
  incomes: Income[],
  overview: IncomeOverviewData | null,
  sources: IncomeSource[],
  recurring: RecurringIncome[]
): IncomeInsight[] {
  const insights: IncomeInsight[] = [];
  const recorded = incomes.filter((i) => i.status === 'RECORDED');
  const total = recorded.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  if (overview && overview.incomeGrowthPercentage > 0) {
    insights.push({
      id: 'ins-1',
      title: 'Income Growth on Track',
      description: `Your income is up ${overview.incomeGrowthPercentage}% compared to the previous period.`,
      type: 'positive',
      icon: 'fa-solid fa-arrow-trend-up',
      metric: `+${overview.incomeGrowthPercentage}%`
    });
  }

  if (overview && overview.topSourceName) {
    insights.push({
      id: 'ins-2',
      title: 'Primary Revenue Stream',
      description: `${overview.topSourceName} makes up ${overview.topSourcePercentage}% of your total earnings this month.`,
      type: 'info',
      icon: 'fa-solid fa-chart-pie',
      metric: `${overview.topSourcePercentage}%`
    });
  }

  const activeRecurring = recurring.filter((r) => r.status === 'ACTIVE');
  if (activeRecurring.length > 0) {
    const totalExpected = activeRecurring.reduce((sum, r) => sum + r.expectedAmount, 0);
    insights.push({
      id: 'ins-3',
      title: 'Predictable Monthly Cash Flow',
      description: `You have ${activeRecurring.length} active recurring schedules providing ₹${totalExpected.toLocaleString()} in expected baseline income.`,
      type: 'positive',
      icon: 'fa-solid fa-repeat',
      metric: `₹${totalExpected.toLocaleString()}`
    });
  }

  const taxableTotal = recorded.filter((i) => i.taxable).reduce((sum, i) => sum + i.amount, 0);
  if (taxableTotal > 0 && total > 0) {
    const taxablePct = Math.round((taxableTotal / total) * 100);
    insights.push({
      id: 'ins-4',
      title: 'Taxable Income Ratio',
      description: `${taxablePct}% of your received income is designated as taxable. Consider allocating for quarterly tax estimated payments.`,
      type: 'neutral',
      icon: 'fa-solid fa-file-invoice-dollar',
      metric: `${taxablePct}%`
    });
  }

  return insights;
}
