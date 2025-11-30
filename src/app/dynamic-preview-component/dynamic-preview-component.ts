import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule }  from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule }  from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';

import { FormTemplate, FieldConfig } from '../models/form-template.model';
import { TemplateBuilderService } from '../service/template-builder.service';

/**
 * Live preview component for the form builder.
 * Renders a fully functional form based on the template configuration.
 * Updates in real-time as the user modifies the form design.
 */
@Component({
  selector: 'app-dynamic-preview',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule,
    MatSlideToggleModule, MatButtonModule, AgGridModule, MatIconModule
  ],
  templateUrl: './dynamic-preview-component.html',
  styleUrls: ['./dynamic-preview-component.css']
})
export class DynamicPreviewComponent implements OnChanges {
  /** Form template passed from parent (form builder) */
  @Input() template!: FormTemplate;

  /** Service for building reactive forms */
  private builder = inject(TemplateBuilderService);

  /** The reactive form group containing all field controls */
  form!: FormGroup;

  /** Holds row data for each grid field */
  gridRowData: Record<string, any[]> = {};
  
  /** Holds column definitions for each grid field */
  gridColumnDefs: Record<string, ColDef[]> = {};
  
  /** Holds grid APIs for each grid field */
  gridApis: Record<string, GridApi> = {};

  /**
   * Rebuilds the form whenever the template changes.
   * This ensures the preview stays in sync with the builder.
   */
  ngOnChanges() {
    this.form = this.builder.buildReactiveForm(this.template);
    
    // Build column definitions for grids
    this.buildGridColumnDefs();
    
    // Initialize grid fields with specified initial rows
    this.template.fields.forEach(field => {
      if (field.type === 'grid') {
        const grid = this.getGrid(field.fieldId);
        const initialRows = field.initialRows ?? 0;
        
        // Add initial rows to the grid
        for (let i = 0; i < initialRows; i++) {
          const row = this.builder.buildGridRow(field.columns || []);
          grid.push(row);
        }
        
        // Update grid data for AG Grid rendering
        this.updateGridData(field.fieldId, grid);
      }
    });
  }
  
  /**
   * Build column definitions for AG Grid from field configuration.
   */
  private buildGridColumnDefs() {
    this.template.fields.forEach(field => {
      if (field.type === 'grid') {
        const colDefs: ColDef[] = (field.columns || []).map((col: any) => ({
          field: col.columnId,
          headerName: col.label || col.columnId,
          editable: true,
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
              this.deleteGridRow(field.fieldId, params.rowIndex);
            });
            return button;
          },
          editable: false,
          width: 100
        });
        
        this.gridColumnDefs[field.fieldId] = colDefs;
      }
    });
  }

  /**
   * Get the FormArray for a grid field.
   */
  getGrid(fieldId: string): FormArray {
    return this.form.get(fieldId) as FormArray;
  }

  /**
   * Adds a new row to a grid field.
   * Creates a FormGroup with FormControls for each column.
   * 
   * @param field - The grid field configuration
   */
  addGridRow(field: FieldConfig) {
    console.log('addGridRow called with field:', field);
    console.log('Form controls:', Object.keys(this.form.controls));
    console.log('Looking for fieldId:', field.fieldId);
    
    const grid = this.getGrid(field.fieldId);
    if (!grid) {
      console.error(`Grid field '${field.fieldId}' not found in form`);
      console.error('Available controls:', this.form.controls);
      return;
    }
    
    const row = this.builder.buildGridRow(field.columns || []);
    grid.push(row);
    this.updateGridData(field.fieldId, grid);
  }

  /**
   * Removes a row from a grid field at the specified index.
   * 
   * @param fieldId - The grid field ID
   * @param index - Zero-based index of the row to remove
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
  onCellValueChanged(event: any, field: FieldConfig) {
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

  /**
   * Handles form submission in preview mode.
   * Validates the form and displays the data in an alert.
   * In production, this would send data to a backend.
   */
  submit() {
    // Mark all fields as touched to show validation errors
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    // Display form data (for preview purposes)
    alert('Preview Submit Data:\n' + JSON.stringify(this.form.value, null, 2));
  }

  /**
   * Generates user-friendly error messages for field validation.
   * Checks for custom messages first, then falls back to default messages.
   * Only shows errors after the field has been touched.
   * 
   * @param field - The field configuration
   * @returns Error message string or null if no error
   */
  showError(field: FieldConfig): string | null {
    const control = this.form.get(field.fieldId);
    
    // Don't show errors until field is touched and invalid
    if (!control || !control.touched || control.valid) return null;

    const errors = control.errors ?? {};
    
    // Check for custom error message from validator config
    const customMsg = field.validators?.find(v => errors[v.name])?.message;
    if (customMsg) return customMsg;

    // Default error messages for common validators
    if (errors['required']) return `${field.label} is required`;
    if (errors['minlength']) return `${field.label} min length ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `${field.label} max length ${errors['maxlength'].requiredLength}`;
    if (errors['min']) return `${field.label} min ${errors['min'].min}`;
    if (errors['max']) return `${field.label} max ${errors['max'].max}`;
    if (errors['pattern']) return `${field.label} invalid format`;
    if (errors['email']) return `Invalid email`;

    // Generic fallback message
    return `Invalid ${field.label}`;
  }

  /**
   * Gets the value from an option (handles both string and OptionItem formats).
   * 
   * @param option - Either a string or OptionItem object
   * @returns The option value
   */
  getOptionValue(option: string | any): string {
    return typeof option === 'string' ? option : option.value;
  }

  /**
   * Gets the label from an option (handles both string and OptionItem formats).
   * 
   * @param option - Either a string or OptionItem object
   * @returns The option label
   */
  getOptionLabel(option: string | any): string {
    return typeof option === 'string' ? option : option.label;
  }
}
