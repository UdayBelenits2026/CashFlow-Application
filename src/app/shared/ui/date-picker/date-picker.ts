import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal, computed, HostListener } from '@angular/core';
import { DatePipe } from '@angular/common';

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
})
export class DatePickerComponent implements OnChanges {
  @Input()
  selectedDate: DateRange | null = null;

  @Output()
  selectedDateChange = new EventEmitter<DateRange>();

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
}
