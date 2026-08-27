// Summary card models and metadata mapping
export interface SummaryCard {
  id: 'income' | 'expenses' | 'cashFlow' | 'savings';
  title: string;
  amount: number;
  selectedMonthAmount: number;
  previousMonthAmount: number;
  percentage: number;
  trend: 'up' | 'down';
  comparison: string;
  icon: string;
}
export type SummaryCardResponse = SummaryCard;
export const SUMMARY_CARD_METADATA: Record<SummaryCard['id'], { title: string; icon: string }> = {
  income: { title: 'Total Income', icon: 'fa-wallet' },
  expenses: { title: 'Total Expenses', icon: 'fa-money-bill-transfer' },
  cashFlow: { title: 'Net Cash Flow', icon: 'fa-chart-line' },
  savings: { title: 'Total Savings', icon: 'fa-piggy-bank' },
};
// Summary card identifiers used for comparisons
export const SUMMARY_CARD_ID = {
  income: 'income',
  expenses: 'expenses',
  cashFlow: 'cashFlow',
  savings: 'savings',
} as const;
// Raw summary card shape as received from the backend before UI mapping
export interface RawSummaryCard {
  id: SummaryCard['id'];
  title?: string;
  icon?: string;
  amount?: number;
  selectedMonthAmount?: number;
  previousMonthAmount?: number;
  percentage?: number;
  trend?: 'up' | 'down';
}
// Maps summary card API response data to full UI model
export function mapSummaryCardResponse(
  rawCards: RawSummaryCard[] | undefined | null,
): SummaryCard[] {
  if (!rawCards) return [];
  return rawCards.map((card): SummaryCard => {
    const cardId = card.id as SummaryCard['id'];
    const meta = SUMMARY_CARD_METADATA[cardId] ?? { title: '', icon: 'fa-wallet' };
    const selected = card.selectedMonthAmount ?? card.amount ?? 0;
    const previous = card.previousMonthAmount ?? 0;
    let percentage = card.percentage ?? 0;
    if (previous !== 0) {
      percentage = Math.round(Math.abs(((selected - previous) / previous) * 100) * 10) / 10;
    }
    const trend: 'up' | 'down' = card.trend ?? (selected >= previous ? 'up' : 'down');
    return {
      id: cardId,
      title: card.title || meta.title,
      icon: card.icon || meta.icon,
      selectedMonthAmount: selected,
      previousMonthAmount: previous,
      amount: selected,
      percentage,
      trend,
      comparison: 'vs last month',
    };
  });
}
