import { IncomeSourceType } from './income-source.model';

export interface IncomeCalendarItem {
  id: string;
  type: 'RECORDED' | 'UPCOMING';
  sourceName: string;
  sourceType: IncomeSourceType;
  sourceColor: string;
  accountName: string;
  amount: number;
  description: string;
  date: string;
  isTaxable?: boolean;
}

export interface IncomeCalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  recordedAmount: number;
  upcomingAmount: number;
  totalAmount: number;
  recordedCount: number;
  upcomingCount: number;
  items: IncomeCalendarItem[];
}
