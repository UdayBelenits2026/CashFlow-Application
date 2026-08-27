import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFilter,
  faXmark,
  faBookmark,
  faEllipsisVertical,
  faMagnifyingGlass,
  faCalendarDays,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { CUSTOM_DATE_RANGE, DashboardFilterState } from '../../models/dashboard.models';
import { DashboardFacade } from '../../facades/dashboard.facade';
import * as FilterOptions from '../../data/dashboard-filter-options';
import { getDateRangeValues } from '../../utility/dashboard-date-range.util';
import {
  DashboardSavedFiltersService,
  SavedFilter,
} from '../../services/dashboard-saved-filters.service';

@Component({
  selector: 'app-cf-dashboard-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dashboard-filter.html',
  styleUrl: './dashboard-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFilterComponent {
  private readonly facade = inject(DashboardFacade);
  private readonly savedFiltersService = inject(DashboardSavedFiltersService);

  // Inputs and outputs for filter modal visibility and actions
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly applyFilter = output<DashboardFilterState>();
  // FontAwesome icon definitions
  readonly filterIcon = faFilter;
  readonly closeIcon = faXmark;
  readonly bookmarkIcon = faBookmark;
  readonly ellipsisIcon = faEllipsisVertical;
  readonly searchIcon = faMagnifyingGlass;
  readonly calendarIcon = faCalendarDays;
  readonly plusIcon = faPlus;
  readonly trashIcon = faTrashCan;
  // Options for filter selection dropdowns
  readonly dateRanges = FilterOptions.DASHBOARD_DATE_RANGES;
  readonly accounts = FilterOptions.DASHBOARD_ACCOUNTS;
  readonly incomeExpenseOptions = FilterOptions.INCOME_EXPENSE_OPTIONS;
  readonly categories = FilterOptions.DASHBOARD_CATEGORIES;
  readonly transactionTypes = FilterOptions.TRANSACTION_TYPE_OPTIONS;
  readonly tags = FilterOptions.DASHBOARD_TAGS;
  readonly paymentMethods = FilterOptions.PAYMENT_METHOD_OPTIONS;
  readonly transactionStatuses = FilterOptions.TRANSACTION_STATUS_OPTIONS;
  readonly recurringOptions = FilterOptions.RECURRING_OPTIONS;
  readonly budgets = FilterOptions.DASHBOARD_BUDGETS;
  // Reactive state signal for dashboard filter parameters
  readonly filter = signal<DashboardFilterState>(
    this.savedFiltersService.createInitialFilterState(),
  );

  readonly savedFilters = signal<SavedFilter[]>(this.savedFiltersService.load());
  readonly isSavingFilter = signal(false);
  readonly newFilterName = signal('');
  readonly isManagingFilters = signal(false);
  readonly activeSavedFilterId = signal<string | null>(null);
  readonly submitted = signal(false);
  // Validation computed signals
  readonly isDateInvalid = computed(() => {
    const from = this.filter().fromDate;
    const to = this.filter().toDate;
    return Boolean(from && to && from > to);
  });
  readonly isAmountInvalid = computed(() => {
    const min = this.filter().minAmount;
    const max = this.filter().maxAmount;
    return Boolean(min !== null && max !== null && min > max);
  });
  readonly showDateError = computed(() => this.submitted() && this.isDateInvalid());
  readonly showAmountError = computed(() => this.submitted() && this.isAmountInvalid());
  private persistSavedFilters(list: SavedFilter[]): void {
    this.savedFiltersService.persist(list);
    this.savedFilters.set(list);
  }
  applySavedFilter(saved: SavedFilter): void {
    let filterState = { ...saved.filterState };
    if (filterState.dateRange && filterState.dateRange !== CUSTOM_DATE_RANGE) {
      const { fromDate, toDate } = getDateRangeValues(filterState.dateRange);
      filterState = { ...filterState, fromDate, toDate };
    }
    this.filter.set(filterState);
    this.activeSavedFilterId.set(saved.id);
  }
  toggleSaveFilterInput(): void {
    this.isSavingFilter.update((v) => !v);
    this.newFilterName.set('');
  }
  saveCurrentFilter(): void {
    const name = this.newFilterName().trim();
    if (!name) return;
    const newSaved: SavedFilter = {
      id: 'sf-' + Date.now(),
      name,
      filterState: { ...this.filter() },
    };
    const updated = [...this.savedFilters(), newSaved];
    this.persistSavedFilters(updated);
    this.activeSavedFilterId.set(newSaved.id);
    this.isSavingFilter.set(false);
    this.newFilterName.set('');
  }
  toggleManageFilters(): void {
    this.isManagingFilters.update((v) => !v);
  }
  deleteSavedFilter(id: string, event?: Event): void {
    event?.stopPropagation();
    const updated = this.savedFilters().filter((sf) => sf.id !== id);
    this.persistSavedFilters(updated);
    if (this.activeSavedFilterId() === id) {
      this.activeSavedFilterId.set(null);
    }
  }
  // Updates specific filter property value in signal state
  updateFilter<K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]): void {
    this.activeSavedFilterId.set(null);
    if (key === 'dateRange' && typeof value === 'string') {
      if (value === CUSTOM_DATE_RANGE) {
        this.filter.update((currentFilter) => ({
          ...currentFilter,
          dateRange: value,
        }));
      } else {
        const { fromDate, toDate } = getDateRangeValues(value);
        this.filter.update((currentFilter) => ({
          ...currentFilter,
          dateRange: value,
          fromDate,
          toDate,
        }));
      }
    } else {
      this.filter.update((currentFilter) => ({
        ...currentFilter,
        [key]: value,
      }));
    }
  }

  // Resets all filter signals to initial state
  resetFilters(): void {
    this.submitted.set(false);
    this.activeSavedFilterId.set(null);
    this.filter.set(this.savedFiltersService.createInitialFilterState());
  }
  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.submitted.set(false);
        const active = this.facade.activeFilters();
        if (active) {
          this.filter.update((curr) => ({
            ...curr,
            ...active,
          }));
        }
      }
    });
  }
  // Emits selected filters and closes modal if validation passes
  applyFilters(): void {
    this.submitted.set(true);
    if (this.isDateInvalid() || this.isAmountInvalid()) {
      return;
    }
    this.facade.applyFilters(this.filter());
    this.applyFilter.emit(this.filter());
    this.onClose();
  }
  // Emits close modal event
  onClose(): void {
    this.submitted.set(false);
    this.closeModal.emit();
  }
}
