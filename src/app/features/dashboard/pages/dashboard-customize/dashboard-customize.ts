import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { DashboardCustomizationService } from '../../data/dashboard-customization.service';
import {
  CustomizeTab,
  DashboardWidgetConfig,
  DashboardWidgetId,
  PreviewMode,
} from '../../models/dashboard.models';
import {
  cloneWidgetConfig,
  DASHBOARD_WIDGET_DEFAULT_CONFIG,
  DASHBOARD_WIDGET_DEFINITIONS,
  sortWidgetConfig,
} from '../../utility/dashboard-widget-config';

@Component({
  selector: 'app-cf-dashboard-customize',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard-customize.html',
  styleUrl: './dashboard-customize.scss',
})
export class DashboardCustomize implements OnInit {
  private readonly router = inject(Router);
  private readonly facade = inject(DashboardFacade);
  private readonly customizationService = inject(DashboardCustomizationService);

  readonly widgetDefinitions = DASHBOARD_WIDGET_DEFINITIONS;
  readonly sizeOptions: Array<{ label: string; value: 'medium' | 'wide' }> = [
    { label: 'Medium (1 column)', value: 'medium' },
    { label: 'Wide (2 columns)', value: 'wide' },
  ];

  readonly activeTab = signal<CustomizeTab>('available');
  readonly previewMode = signal<PreviewMode>('desktop');
  readonly draftWidgets = signal<DashboardWidgetConfig[]>([]);

  readonly allWidgetsSelected = computed(() =>
    this.draftWidgets().every((widget) => widget.selected),
  );

  readonly selectedWidgetCount = computed(
    () => this.draftWidgets().filter((widget) => widget.selected).length,
  );

  readonly selectedWidgets = computed(() =>
    this.draftWidgets()
      .filter((widget) => widget.selected)
      .sort((a, b) => a.order - b.order),
  );

  readonly availableWidgets = computed(() => {
    const byId = new Map(this.draftWidgets().map((widget) => [widget.id, widget]));
    return this.widgetDefinitions.map((definition) => ({
      id: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      selected: byId.get(definition.id)?.selected ?? false,
    }));
  });

  constructor() {
    effect(() => {
      const state = this.facade.dashboardState();
      if (!state.loading) {
        untracked(() => {
          if (this.draftWidgets().length === 0) {
            const loadedConfig = state.widgetConfig.length
              ? this.customizationService.normalizeConfig(state.widgetConfig)
              : cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG);

            this.draftWidgets.set(sortWidgetConfig(loadedConfig));
            this.resequenceOrders();
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.facade.loadDashboard();
  }

  setTab(tab: CustomizeTab): void {
    this.activeTab.set(tab);
  }

  setPreviewMode(mode: PreviewMode): void {
    this.previewMode.set(mode);
  }

  toggleSelectAll(): void {
    const shouldSelectAll = !this.allWidgetsSelected();
    this.draftWidgets.update((widgets) =>
      widgets.map((widget) => ({
        ...widget,
        selected: shouldSelectAll,
      })),
    );

    this.resequenceOrders();
  }

  onToggleWidget(widgetId: DashboardWidgetId, checked: boolean): void {
    const selectedOrders = this.draftWidgets()
      .filter((widget) => widget.selected)
      .map((widget) => widget.order);
    const nextSelectedOrder = selectedOrders.length > 0 ? Math.max(...selectedOrders) + 1 : 0;

    this.draftWidgets.update((widgets) =>
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              selected: checked,
              order: checked ? nextSelectedOrder : widget.order,
            }
          : widget,
      ),
    );

    this.resequenceOrders();
  }

  onLayoutChange(widgetId: DashboardWidgetId, layout: 'medium' | 'wide'): void {
    this.draftWidgets.update((widgets) =>
      widgets.map((widget) => (widget.id === widgetId ? { ...widget, layout } : widget)),
    );
  }

  onRemoveWidget(widgetId: DashboardWidgetId): void {
    this.onToggleWidget(widgetId, false);
  }

  onDrop(event: CdkDragDrop<DashboardWidgetConfig[]>): void {
    const selected = [...this.selectedWidgets()];
    moveItemInArray(selected, event.previousIndex, event.currentIndex);
    this.resequenceOrders(selected.map((widget) => widget.id));
  }

  resetToDefault(): void {
    this.draftWidgets.set(cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG));
    this.resequenceOrders();
  }

  cancel(): void {
    void this.router.navigate(['/dashboard/home']);
  }

  close(): void {
    this.cancel();
  }

  saveChanges(): void {
    this.facade.saveWidgetConfig(this.draftWidgets());
    void this.router.navigate(['/dashboard/home']);
  }

  widgetTitle(widgetId: DashboardWidgetId): string {
    return this.widgetDefinitions.find((widget) => widget.id === widgetId)?.title ?? widgetId;
  }

  private resequenceOrders(selectedOrder?: DashboardWidgetId[]): void {
    const currentDraft = this.draftWidgets();
    const widgetMap = new Map(currentDraft.map((widget) => [widget.id, { ...widget }]));

    const selectedWidgets = selectedOrder
      ? selectedOrder
          .map((id) => widgetMap.get(id))
          .filter((widget): widget is DashboardWidgetConfig => Boolean(widget && widget.selected))
      : currentDraft
          .filter((widget) => widget.selected)
          .sort((a, b) => a.order - b.order)
          .map((widget) => ({ ...widget }));

    const selectedIds = new Set(selectedWidgets.map((widget) => widget.id));
    const unselectedWidgets = currentDraft
      .filter((widget) => !selectedIds.has(widget.id))
      .map((widget) => ({ ...widget }))
      .sort((a, b) => a.order - b.order);

    const reordered = [...selectedWidgets, ...unselectedWidgets].map((widget, index) => ({
      ...widget,
      order: index,
    }));

    this.draftWidgets.set(reordered);
  }
}
