import { Component, input, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SpendingCategoryItem } from '../../models/spending-summary.model';

@Component({
  selector: 'app-category-breakdown',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './category-breakdown.component.html',
  styleUrl: './category-breakdown.component.scss'
})
export class CategoryBreakdownComponent {
  readonly categories = input<SpendingCategoryItem[]>([]);

  readonly displayCategories = computed(() => (this.categories() || []).slice(0, 5));

  readonly totalAmount = computed(() => 
    (this.categories() || []).reduce((sum, c) => sum + (c.amount || 0), 0)
  );
}
