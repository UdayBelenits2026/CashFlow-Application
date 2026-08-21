import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountNumber',
  standalone: true
})
export class AccountNumberPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const visible = value.slice(-4);
    const masked = '*'.repeat(Math.max(0, value.length - 4));
    return `${masked}${visible}`;
  }
}