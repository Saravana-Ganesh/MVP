/**
 * FormRendererComponent
 * ---------------------
 * Renders a dynamic form based on a JSON template configuration.
 * Supports standard input controls (text, number, email, textarea, date, radio, select)
 * and dynamic grid/table fields with add/remove row functionality.
 */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';

// Service that loads templates and builds reactive forms for rendering.
import { FormRenderService } from '../service/form-render.service';

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    AgGridModule,
    MatIconModule,
  ],
  templateUrl: './form-renderer.component.html',
  styleUrl: './form-renderer.component.css'
})
export class FormRendererComponent implements OnInit {

  /** JSON template loaded from the backend/assets. */
  template: any;
  /** Root reactive form built from the template. */
  form!: FormGroup;

  /** Holds row data for each grid field */
  gridRowData: Record<string, any[]> = {};
  
  /** Holds column definitions for each grid field */
  gridColumnDefs: Record<string, ColDef[]> = {};
  
  /** Holds grid APIs for each grid field */
  gridApis: Record<string, GridApi> = {};

  constructor(
    private formService: FormRenderService
  ) { }

  /**
   * Load the form template on first render and initialise
   * the reactive form and grid data sources.
   */
  ngOnInit() {
    this.formService.loadTemplate().subscribe({
      next: (template) => {
        // Persist the template so the template HTML can render fields.
        this.template = template;
        // Build the reactive form (all controls + grids) from the template.
        this.form = this.formService.buildForm(template);
        
        // Initialize grid fields with specified initial rows
        this.initializeGridFields();
        this.buildGridColumnDefs();
      },
      error: (err) => console.error('Template load error:', err),
    });
  }

  /**
   * Build column definitions for AG Grid from field configuration.
   */
  private buildGridColumnDefs() {
    if (!this.template || !this.template.fields) return;
    
    this.template.fields.forEach((field: any) => {
      if (field.type === 'grid') {
        const colDefs: ColDef[] = field.columns.map((col: any) => ({
          field: col.columnId,
          headerName: col.header || col.label || col.columnId,
          editable: true,
          resizable: true,
          sortable: true,
          filter: true,
          cellEditor: col.type === 'select' ? 'agSelectCellEditor' : undefined,
          cellEditorParams: col.type === 'select' ? { values: col.options } : undefined,
          minWidth: 100,
          flex: 1,
          cellClass: 'excel-cell',
          headerClass: 'excel-header',
        }));
        
        // Add actions column
        colDefs.push({
          headerName: 'Actions',
          field: 'actions',
          cellRenderer: (params: any) => {
            const button = document.createElement('button');
            button.innerHTML = '🗑️';
            button.classList.add('ag-grid-delete-btn');
            button.addEventListener('click', () => {
              // Use node.rowIndex to get the current row index dynamically
              const currentRowIndex = params.node.rowIndex;
              this.deleteGridRow(field.fieldId, currentRowIndex);
            });
            return button;
          },
          editable: false,
          resizable: false,
          sortable: false,
          filter: false,
          width: 80,
          pinned: 'right',
          cellClass: 'excel-actions-cell',
          headerClass: 'excel-header'
        });
        
        this.gridColumnDefs[field.fieldId] = colDefs;
      }
    });
  }
  
  /**
   * Initialize grid fields with pre-populated rows based on initialRows property.
   * This ensures grids display with the configured number of empty rows on load.
   */
  private initializeGridFields() {
    if (!this.template || !this.template.fields) return;
    
    this.template.fields.forEach((field: any) => {
      if (field.type === 'grid') {
        const grid = this.getGrid(field.fieldId);
        const initialRows = field.initialRows ?? 0;
        
        // Add initial rows to the grid
        for (let i = 0; i < initialRows; i++) {
          const row = this.formService.buildGridRow(field.columns || []);
          grid.push(row);
        }
        
        // Update grid data for AG Grid rendering
        this.updateGridData(field.fieldId, grid);
      }
    });
  }

  getGrid(fieldId: string): FormArray {
    return this.form.get(fieldId) as FormArray;
  }

  /**
   * Add a new row to a grid field.
   */
  addGridRow(field: any) {
    const grid = this.getGrid(field.fieldId);
    const row = this.formService.buildGridRow(field.columns);

    grid.push(row);
    this.updateGridData(field.fieldId, grid);
  }

  /**
   * Remove an existing row from a grid field.
   */
  deleteGridRow(fieldId: string, index: number) {
    const grid = this.getGrid(fieldId);
    grid.removeAt(index);
    this.updateGridData(fieldId, grid);
  }

  /**
   * AG Grid consumes plain objects; convert FormGroup controls to plain data.
   */
  updateGridData(fieldId: string, grid: FormArray) {
    this.gridRowData[fieldId] = grid.controls.map((control: any) => control.value);
    
    // Refresh grid if API is available, otherwise data binding will handle it
    if (this.gridApis[fieldId]) {
      try {
        this.gridApis[fieldId].setGridOption('rowData', [...this.gridRowData[fieldId]]);
      } catch (error) {
        // Grid not fully initialized yet, data binding will handle the update
        console.log('Grid API not ready, using data binding');
      }
    }
  }
  
  /**
   * Handle grid ready event to store API reference.
   */
  onGridReady(event: GridReadyEvent, fieldId: string) {
    this.gridApis[fieldId] = event.api;
    
    // Set initial data if available
    if (this.gridRowData[fieldId] && this.gridRowData[fieldId].length > 0) {
      try {
        event.api.setGridOption('rowData', [...this.gridRowData[fieldId]]);
      } catch (error) {
        console.log('Error setting initial grid data:', error);
      }
    }
  }
  
  /**
   * Handle cell value changes in AG Grid.
   */
  onCellValueChanged(event: any, field: any) {
    const grid = this.getGrid(field.fieldId);
    const rowIndex = event.rowIndex;
    const colId = event.column.getColId();
    const newValue = event.newValue;
    
    // Update the FormArray with the new value
    const rowFormGroup = grid.at(rowIndex);
    if (rowFormGroup) {
      rowFormGroup.get(colId)?.setValue(newValue);
    }
  }

  /* ----------------------- VALIDATION HANDLERS ----------------------- */

  /**
   * Centralised logic to decide when to show a validation error
   * for a simple field.
   */
  shouldShowError(fieldId: string): boolean {
    const control = this.form.get(fieldId);
    return !!control && control.invalid && control.touched;
  }

  /**
   * Delegate to the service to build a user friendly error message.
   */
  getErrorMessage(fieldId: string): string {
    return this.formService.getErrorMessage(this.form.get(fieldId));
  }

  onSubmit() {
    console.log('FORM VALUE → ', this.form.value);
  }
}
