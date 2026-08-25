import { Pipe, PipeTransform } from '@angular/core';

// Masks an account number so only the last four characters remain visible.
@Pipe({
  name: 'accountNumber',
  standalone: true
})
export class AccountNumberPipe implements PipeTransform {
  transform(value: string | null | undefined, visibleDigits = 4): string {
    if (!value) {
      return '';
    }

    const raw = String(value).trim();
    if (raw.length <= visibleDigits) {
      return raw;
    }

    const lastVisible = raw.slice(-visibleDigits);
    return `•••• ${lastVisible}`;
  }
}
