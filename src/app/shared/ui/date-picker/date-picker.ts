import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal, computed, HostListener, forwardRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnChanges, ControlValueAccessor {
  // 'range' keeps the original two-ended behavior; 'single' picks one date and works with formControlName.
  @Input()
  mode: 'single' | 'range' = 'range';

  @Input()
  disabled = false;

  @Input()
  selectedDate: DateRange | null = null;

  @Output()
  selectedDateChange = new EventEmitter<DateRange>();

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isOpen = signal(false);

  readonly currentMonth = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  readonly selectedStart = signal<Date | null>(null);

  readonly selectedEnd = signal<Date | null>(null);

  readonly tempStart = signal<Date | null>(null);

  readonly tempEnd = signal<Date | null>(null);

  readonly monthName = computed(() => {
    return this.currentMonth().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  readonly calendarDays = computed(() => {
    const current = this.currentMonth();

    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const previousMonthDays = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      day: number;
      currentMonth: boolean;
    }> = [];

    // Fill preceding days so the grid starts on Sunday.
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = previousMonthDays - i;

      days.push({
        date: new Date(year, month - 1, day),
        day,
        currentMonth: false,
      });
    }

    // Fill current month days.
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        day,
        currentMonth: true,
      });
    }

    // Fill remaining slots from the next month.
    let nextDay = 1;

    while (days.length < 42) {
      days.push({
        date: new Date(year, month + 1, nextDay),
        day: nextDay,
        currentMonth: false,
      });

      nextDay++;
    }

    return days;
  });

  constructor() {
    this.setThisMonth(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedDate']) {
      return;
    }

    const value = changes['selectedDate'].currentValue as DateRange | null;

    if (!value || (!value.start && !value.end)) {
      return;
    }

    const normalizedStart = value.start ? this.normalizeDate(value.start) : null;
    const normalizedEnd = value.end ? this.normalizeDate(value.end) : null;

    this.selectedStart.set(normalizedStart);
    this.selectedEnd.set(normalizedEnd);
    this.tempStart.set(normalizedStart);
    this.tempEnd.set(normalizedEnd);

    const monthReference = normalizedStart ?? normalizedEnd;

    if (monthReference) {
      this.currentMonth.set(new Date(monthReference.getFullYear(), monthReference.getMonth(), 1));
    }
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }
    this.isOpen.update((value) => !value);

    if (this.isOpen()) {
      this.tempStart.set(this.selectedStart());
      this.tempEnd.set(this.selectedEnd());
    }
  }

  open(): void {
    this.isOpen.set(true);

    this.tempStart.set(this.selectedStart());
    this.tempEnd.set(this.selectedEnd());
  }

  close(): void {
    this.isOpen.set(false);
  }

  previousMonth(): void {
    const current = this.currentMonth();

    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentMonth();

    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  selectDate(date: Date): void {
    // Single mode: pick one date, emit immediately, and close.
    if (this.mode === 'single') {
      const normalized = this.normalizeDate(date);
      this.selectedStart.set(normalized);
      this.selectedEnd.set(normalized);
      this.tempStart.set(normalized);
      this.tempEnd.set(normalized);
      this.isOpen.set(false);
      this.onChange(this.formatIsoDate(normalized));
      this.onTouched();
      this.selectedDateChange.emit({ start: normalized, end: normalized });
      return;
    }

    const start = this.tempStart();
    const end = this.tempEnd();

    // Start a new range when there is no active start, or after a completed range.
    if (!start || (start && end)) {
      this.tempStart.set(this.normalizeDate(date));
      this.tempEnd.set(null);
      return;
    }

    // If second click is earlier, swap range boundaries.
    if (this.isBefore(date, start)) {
      this.tempStart.set(this.normalizeDate(date));
      this.tempEnd.set(start);
      return;
    }

    // Otherwise finalize the range.
    this.tempEnd.set(this.normalizeDate(date));
  }

  isSelectedStart(date: Date): boolean {
    const start = this.tempStart();

    return !!start && this.isSameDate(date, start);
  }

  isSelectedEnd(date: Date): boolean {
    const end = this.tempEnd();

    return !!end && this.isSameDate(date, end);
  }

  isInRange(date: Date): boolean {
    const start = this.tempStart();
    const end = this.tempEnd();

    if (!start || !end) {
      return false;
    }

    const current = this.normalizeDate(date).getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();

    return current > startTime && current < endTime;
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  setThisMonth(closeAfter = true): void {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.selectedStart.set(start);
    this.selectedEnd.set(end);

    this.tempStart.set(start);
    this.tempEnd.set(end);

    this.currentMonth.set(new Date(now.getFullYear(), now.getMonth(), 1));

    if (closeAfter) {
      this.isOpen.set(false);

      this.emitRange();
    }
  }

  clear(): void {
    this.tempStart.set(null);
    this.tempEnd.set(null);
  }

  apply(): void {
    const start = this.tempStart();
    const end = this.tempEnd();

    if (!start) {
      return;
    }

    this.selectedStart.set(start);
    this.selectedEnd.set(end);

    this.isOpen.set(false);

    this.emitRange();
  }

  getDisplayTitle(): string {
    const start = this.selectedStart();
    const end = this.selectedEnd();

    if (this.mode === 'single') {
      return start ? this.formatShortDate(start) : 'Select Date';
    }

    if (!start && !end) {
      return 'Select Date';
    }

    if (start && end && this.isCurrentMonthRange(start, end)) {
      return 'This Month';
    }

    if (start && end) {
      return `${this.formatShortDate(start)} - ${this.formatShortDate(end)}`;
    }

    if (start) {
      return this.formatShortDate(start);
    }

    return 'Select Date';
  }

  getDisplaySubtitle(): string {
    const start = this.selectedStart();
    const end = this.selectedEnd();

    if (this.mode === 'single') {
      return '';
    }

    if (!start) {
      return '';
    }

    if (end) {
      return `${this.formatFullDate(start)} - ${this.formatFullDate(end)}`;
    }

    return this.formatFullDate(start);
  }

  private emitRange(): void {
    this.selectedDateChange.emit({
      start: this.selectedStart(),
      end: this.selectedEnd(),
    });
  }

  private isCurrentMonthRange(start: Date, end: Date): boolean {
    const now = new Date();

    const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const expectedEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.isSameDate(start, expectedStart) && this.isSameDate(end, expectedEnd);
  }

  private formatShortDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDate(first: Date, second: Date): boolean {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  private isBefore(first: Date, second: Date): boolean {
    return this.normalizeDate(first).getTime() < this.normalizeDate(second).getTime();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  // --- ControlValueAccessor (single mode with formControlName) ---
  writeValue(value: unknown): void {
    if (this.mode === 'single') {
      const date =
        typeof value === 'string' && value
          ? this.parseIsoDate(value)
          : value instanceof Date
            ? this.normalizeDate(value)
            : null;
      this.selectedStart.set(date);
      this.selectedEnd.set(date);
      this.tempStart.set(date);
      this.tempEnd.set(date);
      if (date) {
        this.currentMonth.set(new Date(date.getFullYear(), date.getMonth(), 1));
      }
      return;
    }

    const range = value as DateRange | null;
    const normalizedStart = range?.start ? this.normalizeDate(range.start) : null;
    const normalizedEnd = range?.end ? this.normalizeDate(range.end) : null;
    this.selectedStart.set(normalizedStart);
    this.selectedEnd.set(normalizedEnd);
    this.tempStart.set(normalizedStart);
    this.tempEnd.set(normalizedEnd);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : this.normalizeDate(parsed);
  }

  private formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
