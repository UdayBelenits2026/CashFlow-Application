import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { DashboardCustomizationService } from '../../services/dashboard-customization.service';
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
  // Constants for widget definitions and layout size options
  readonly widgetDefinitions = DASHBOARD_WIDGET_DEFINITIONS;
  readonly sizeOptions: Array<{ label: string; value: 'medium' | 'wide' }> = [
    { label: 'Medium (1 column)', value: 'medium' },
    { label: 'Wide (2 columns)', value: 'wide' },
  ];
  // Tab, preview mode, and draft widget configuration state
  readonly activeTab = signal<CustomizeTab>('available');
  readonly previewMode = signal<PreviewMode>('desktop');
  readonly draftWidgets = signal<DashboardWidgetConfig[]>([]);
  readonly isEdited = signal<boolean>(false);
  // Computes whether all available widgets are selected
  readonly allWidgetsSelected = computed(() =>
    this.draftWidgets().every((widget) => widget.selected),
  );
  // Computes count of selected widgets
  readonly selectedWidgetCount = computed(
    () => this.draftWidgets().filter((widget) => widget.selected).length,
  );
  // Computes sorted list of selected widgets
  readonly selectedWidgets = computed(() =>
    this.draftWidgets()
      .filter((widget) => widget.selected)
      .sort((a, b) => a.order - b.order),
  );
  // Computes list of available widget definitions with selection status
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
  // Synchronizes loaded widget configurations from facade into draft state
  constructor() {
    effect(() => {
      const state = this.facade.dashboardState();
      if (!state.loading && !this.isEdited()) {
        untracked(() => {
          const loadedConfig = state.widgetConfig.length
            ? this.customizationService.normalizeConfig(state.widgetConfig)
            : cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG);
          this.draftWidgets.set(sortWidgetConfig(loadedConfig));
          this.resequenceOrders();
        });
      }
    });
  }
  // Loads dashboard state on init
  ngOnInit(): void {
    this.facade.loadDashboard();
  }
  // Sets active customization tab
  setTab(tab: CustomizeTab): void {
    this.activeTab.set(tab);
  }
  // Sets active preview mode
  setPreviewMode(mode: PreviewMode): void {
    this.previewMode.set(mode);
  }
  // Toggles selection for all available widgets
  toggleSelectAll(): void {
    this.isEdited.set(true);
    const shouldSelectAll = !this.allWidgetsSelected();
    this.draftWidgets.update((widgets) =>
      widgets.map((widget) => ({
        ...widget,
        selected: shouldSelectAll,
      })),
    );
    this.resequenceOrders();
  }
  // Toggles selection for a single widget
  onToggleWidget(widgetId: DashboardWidgetId, checked: boolean): void {
    this.isEdited.set(true);
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
  // Changes layout width setting for a widget
  onLayoutChange(widgetId: DashboardWidgetId, layout: 'medium' | 'wide'): void {
    this.isEdited.set(true);
    this.draftWidgets.update((widgets) =>
      widgets.map((widget) => (widget.id === widgetId ? { ...widget, layout } : widget)),
    );
  }
  // Removes widget from active layout
  onRemoveWidget(widgetId: DashboardWidgetId): void {
    this.onToggleWidget(widgetId, false);
  }
  // Handles drag-and-drop reordering of selected widgets
  onDrop(event: CdkDragDrop<DashboardWidgetConfig[]>): void {
    this.isEdited.set(true);
    const selected = [...this.selectedWidgets()];
    moveItemInArray(selected, event.previousIndex, event.currentIndex);
    this.resequenceOrders(selected.map((widget) => widget.id));
  }
  // Resets widget configuration to defaults
  resetToDefault(): void {
    this.isEdited.set(true);
    this.draftWidgets.set(cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG));
    this.resequenceOrders();
  }
  // Cancels customization and navigates to dashboard home
  cancel(): void {
    void this.router.navigate(['/dashboard/home']);
  }
  // Closes customization modal
  close(): void {
    this.cancel();
  }
  // Saves draft widget configuration and navigates to dashboard home
  saveChanges(): void {
    this.facade.saveWidgetConfig(this.draftWidgets());
    void this.router.navigate(['/dashboard/home']);
  }
  // Retrieves human-readable title for a widget ID
  widgetTitle(widgetId: DashboardWidgetId): string {
    return this.widgetDefinitions.find((widget) => widget.id === widgetId)?.title ?? widgetId;
  }
  // Resequences order property indices across all widgets
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
