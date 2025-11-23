import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule }  from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FieldConfig, GridColumn } from '../models/form-template.model';

/**
 * Dialog component for configuring grid/table field columns.
 * Allows users to define column structure, types, and constraints.
 * Opened from the form builder when adding a grid field.
 */
@Component({
  selector: 'app-grid-field-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './grid-field-dialog-component.html',
  styleUrl: './grid-field-dialog-component.css',
})
export class GridFieldDialogComponent {
  /** Form for configuring grid columns and row limits */
  columnsForm: FormGroup;

  /**
   * Initializes the dialog with form controls.
   * 
   * @param fb - FormBuilder for creating reactive forms
   * @param ref - Dialog reference for closing and returning data
   * @param baseField - The base field configuration passed from form builder
   */
  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<GridFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public baseField: FieldConfig
  ) {
    // Initialize form with min/max rows and empty columns array
    this.columnsForm = this.fb.group({
      minRows: [0],
      maxRows: [10],
      columns: this.fb.array([] as FormGroup[])
    });
    
    // Start with one column by default
    this.addColumn();
  }

  /**
   * Getter for the columns FormArray.
   * Provides easy access to the array of column form groups.
   * 
   * @returns FormArray containing column configurations
   */
  get columnsArray(): FormArray {
    return this.columnsForm.get('columns') as FormArray;
  }

  /**
   * Adds a new column configuration to the grid.
   * Creates a form group with default values and validation.
   */
  addColumn() {
    this.columnsArray.push(this.fb.group({
      columnId: ['', Validators.required],  // Unique ID for the column
      header: ['', Validators.required],    // Display header text
      type: ['text', Validators.required],  // Input type (text/number/date)
      required: [false]                     // Whether column is required
    }));
  }

  /**
   * Removes a column configuration at the specified index.
   * 
   * @param index - Zero-based index of the column to remove
   */
  removeColumn(index: number) {
    this.columnsArray.removeAt(index);
  }

  /**
   * Saves the grid configuration and closes the dialog.
   * Validates the form and returns the complete field config.
   * Returns undefined if form is invalid.
   */
  save() {
    // Don't save if form is invalid
    if (this.columnsForm.invalid) return;

    // Extract column configurations
    const cols: GridColumn[] = this.columnsArray.value;

    // Build complete grid field configuration
    const gridField: FieldConfig = {
      ...this.baseField,                                  // Spread base field properties
      columns: cols,                                      // Add column definitions
      minRows: this.columnsForm.value.minRows ?? 1,      // Minimum rows allowed
      maxRows: this.columnsForm.value.maxRows ?? 10,     // Maximum rows allowed
      defaultValue: []                                    // Start with empty rows
    };

    // Close dialog and return the configured field
    this.ref.close(gridField);
  }

  /**
   * Closes the dialog without saving.
   * Returns undefined to the caller.
   */
  close() {
    this.ref.close();
  }
}
