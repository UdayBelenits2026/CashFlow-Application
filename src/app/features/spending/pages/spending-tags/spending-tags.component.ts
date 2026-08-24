import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { Tag } from '../../models/tag.model';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-spending-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './spending-tags.component.html',
  styleUrl: './spending-tags.component.scss'
})
export class SpendingTagsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly fb: FormBuilder = inject(FormBuilder);

  readonly tags$: Observable<Tag[]> = this.spendingFacade.tags$;
  readonly allExpenses$: Observable<Expense[]> = this.spendingFacade.allExpenses$;

  tagForm!: FormGroup;
  searchTerm: string = '';
  showCreateModal: boolean = false;
  editingTag: Tag | null = null;

  readonly presetColors: string[] = [
    '#2563EB', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#64748B'  // Slate
  ];

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    this.initForm();
  }

  initForm(): void {
    this.tagForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      description: [''],
      color: ['#2563EB', Validators.required]
    });
  }

  selectColor(color: string): void {
    this.tagForm.patchValue({ color });
  }

  openCreateModal(): void {
    this.editingTag = null;
    this.tagForm.reset({
      name: '',
      description: '',
      color: '#2563EB'
    });
    this.showCreateModal = true;
  }

  openEditModal(tag: Tag): void {
    this.editingTag = tag;
    this.tagForm.patchValue({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#2563EB'
    });
    this.showCreateModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingTag = null;
  }

  onSaveTag(): void {
    if (this.tagForm.invalid) return;

    const val = this.tagForm.value;
    if (this.editingTag) {
      // Delete old tag and add updated tag
      this.spendingFacade.deleteTag(this.editingTag.id);
      const updatedTag: Tag = {
        id: this.editingTag.id,
        name: val.name.trim(),
        description: val.description ? val.description.trim() : undefined,
        color: val.color,
        count: this.editingTag.count || 0
      };
      this.spendingFacade.addTag(updatedTag);
    } else {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name: val.name.trim(),
        description: val.description ? val.description.trim() : undefined,
        color: val.color,
        count: 0
      };
      this.spendingFacade.addTag(newTag);
    }

    this.closeModal();
  }

  onDeleteTag(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the tag "${name}"?`)) {
      this.spendingFacade.deleteTag(id);
    }
  }

  filterTags(tags: Tag[]): Tag[] {
    if (!this.searchTerm.trim()) return tags;
    const term = this.searchTerm.toLowerCase();
    return tags.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
    );
  }

  getTotalUsage(tags: Tag[]): number {
    return tags.reduce((sum, t) => sum + (t.count || 0), 0);
  }
}
