import {
  recalculateIncomeOverviewAndSources,
  calculateNextRecurringDate,
  calculateUpcomingIncomeItems,
  computeSourceReportItems,
  computeCalendarDays
} from './income.calculations';
import { Income } from '../models/income.model';
import { IncomeSource } from '../models/income-source.model';
import { RecurringIncome } from '../models/recurring-income.model';
import { IncomeOverviewData } from '../models/income-summary.model';

describe('IncomeCalculations', () => {
  const mockOverview: IncomeOverviewData = {
    totalIncome: 0,
    incomeGrowthPercentage: 10,
    receiptsCount: 0,
    receiptsGrowthCount: 0,
    averageMonthly: 0,
    averageMonthlyGrowthPercentage: 0,
    topSourceName: '',
    topSourceAmount: 0,
    topSourcePercentage: 0,
    activeSourcesCount: 0,
    taxableIncome: 0,
    totalRecurringExpected: 0
  };

  const mockSources: IncomeSource[] = [
    { id: 'src-1', name: 'Salary', type: 'Salary', taxable: true, isRecurring: true, status: 'ACTIVE' },
    { id: 'src-2', name: 'Freelance', type: 'Freelance', taxable: true, isRecurring: false, status: 'ACTIVE' }
  ];

  const mockIncomes: Income[] = [
    {
      id: 'inc-1',
      accountId: 'acc-1',
      accountName: 'Chase Checking',
      incomeSourceId: 'src-1',
      sourceName: 'Salary',
      sourceType: 'Salary',
      amount: 5000,
      date: '2026-05-01',
      description: 'Monthly Salary',
      taxable: true,
      status: 'RECORDED'
    },
    {
      id: 'inc-2',
      accountId: 'acc-1',
      accountName: 'Chase Checking',
      incomeSourceId: 'src-2',
      sourceName: 'Freelance',
      sourceType: 'Freelance',
      amount: 1000,
      date: '2026-05-15',
      description: 'Design Gig',
      taxable: true,
      status: 'RECORDED'
    }
  ];

  const mockRecurring: RecurringIncome[] = [
    {
      id: 'rec-1',
      incomeSourceId: 'src-1',
      sourceName: 'Salary',
      sourceType: 'Salary',
      accountId: 'acc-1',
      accountName: 'Chase Checking',
      expectedAmount: 5000,
      frequency: 'MONTHLY',
      startDate: '2026-01-01',
      nextIncomeDate: '2026-06-01',
      status: 'ACTIVE'
    }
  ];

  it('should recalculate total income, taxable income, and top source accurately', () => {
    const result = recalculateIncomeOverviewAndSources(mockIncomes, mockSources, mockRecurring, mockOverview);
    expect(result.overview).toBeTruthy();
    expect(result.overview?.totalIncome).toBe(6000);
    expect(result.overview?.taxableIncome).toBe(6000);
    expect(result.overview?.topSourceName).toBe('Salary');
    expect(result.overview?.topSourceAmount).toBe(5000);
    expect(result.overview?.receiptsCount).toBe(2);
  });

  it('should advance recurring dates correctly by frequency', () => {
    expect(calculateNextRecurringDate('2026-05-01', 'MONTHLY')).toBe('2026-06-01');
    expect(calculateNextRecurringDate('2026-05-01', 'WEEKLY')).toBe('2026-05-08');
    expect(calculateNextRecurringDate('2026-05-01', 'BI_WEEKLY')).toBe('2026-05-15');
    expect(calculateNextRecurringDate('2026-05-01', 'QUARTERLY')).toBe('2026-08-01');
    expect(calculateNextRecurringDate('2026-05-01', 'ANNUALLY')).toBe('2027-05-01');
  });

  it('should compute breakdown report items properly', () => {
    const reportItems = computeSourceReportItems(mockIncomes, mockSources);
    expect(reportItems.length).toBe(2);
    expect(reportItems[0].sourceName).toBe('Salary');
    expect(reportItems[0].percentage).toBeCloseTo(83.3, 1);
    expect(reportItems[1].sourceName).toBe('Freelance');
    expect(reportItems[1].percentage).toBeCloseTo(16.7, 1);
  });

  it('should compute calendar days grid with recorded & upcoming markers', () => {
    const calendarDays = computeCalendarDays(2026, 5, mockIncomes, mockRecurring);
    expect(calendarDays.length).toBeGreaterThanOrEqual(35);
    const may1Day = calendarDays.find((d) => d.date === '2026-05-01');
    expect(may1Day).toBeTruthy();
    expect(may1Day?.recordedAmount).toBe(5000);
    expect(may1Day?.recordedCount).toBe(1);
  });
});
