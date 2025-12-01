import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule }  from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FieldConfig, GridColumn } from '../models';

/**
 * Dialog component for configuring grid/table field columns.
 * Allows users to define column structure, types, validation, and initial row settings.
 * Opened from the form builder when adding a grid field.
 */
@Component({
  selector: 'app-grid-column-config-dialog',
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
  templateUrl: './grid-column-config-dialog.component.html',
  styleUrl: './grid-column-config-dialog.component.css',
})
export class GridColumnConfigDialogComponent {
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
    private ref: MatDialogRef<GridColumnConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public baseField: FieldConfig
  ) {
    // Initialize form with min/max rows, initial rows, add row button control, and empty columns array
    this.columnsForm = this.fb.group({
      minRows: [1, [Validators.required, Validators.min(1)]],
      maxRows: [10, [Validators.required, Validators.min(1)]],
      initialRows: [1, [Validators.required, Validators.min(1)]],
      allowAddRow: [true],    // Default to showing "Add Row" button
      columns: this.fb.array([] as FormGroup[])
    }, { validators: this.gridRowValidator });
    
    // Start with one column by default
    this.addColumn();
    
    // Listen to changes and re-validate
    this.setupValidationListeners();
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
      label: ['', Validators.required],     // Display label text
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
      ...this.baseField,                                      // Spread base field properties
      columns: cols,                                          // Add column definitions
      minRows: this.columnsForm.value.minRows ?? 1,          // Minimum rows allowed
      maxRows: this.columnsForm.value.maxRows ?? 10,         // Maximum rows allowed
      initialRows: this.columnsForm.value.initialRows ?? 1,  // Initial rows to create
      allowAddRow: this.columnsForm.value.allowAddRow ?? true, // Show "Add Row" button
      defaultValue: []                                        // Start with empty rows
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

  /**
   * Custom validator for grid row configuration.
   * Validates business rules for minRows, maxRows, initialRows, and allowAddRow.
   * 
   * Business Rules:
   * 1. minRows <= initialRows <= maxRows
   * 2. If allowAddRow is false, minRows must equal maxRows (fixed number)
   * 3. All values must be positive integers
   * 
   * @param control - Form group containing row configuration
   * @returns Validation errors object or null if valid
   */
  private gridRowValidator(control: AbstractControl): ValidationErrors | null {
    const minRows = control.get('minRows')?.value;
    const maxRows = control.get('maxRows')?.value;
    const initialRows = control.get('initialRows')?.value;
    const allowAddRow = control.get('allowAddRow')?.value;

    const errors: ValidationErrors = {};

    // Rule: minRows must be <= maxRows
    if (minRows > maxRows) {
      errors['minGreaterThanMax'] = {
        message: 'Minimum rows cannot be greater than maximum rows',
        minRows,
        maxRows
      };
    }

    // Rule: initialRows must be >= minRows
    if (initialRows < minRows) {
      errors['initialLessThanMin'] = {
        message: 'Initial rows cannot be less than minimum rows',
        initialRows,
        minRows
      };
    }

    // Rule: initialRows must be <= maxRows
    if (initialRows > maxRows) {
      errors['initialGreaterThanMax'] = {
        message: 'Initial rows cannot be greater than maximum rows',
        initialRows,
        maxRows
      };
    }

    // Rule: If allowAddRow is false, minRows must equal maxRows (fixed number case)
    if (allowAddRow === false && minRows !== maxRows) {
      errors['fixedRowsMismatch'] = {
        message: 'When "Add Row" is disabled, minimum and maximum rows must be equal (fixed number of samples)',
        minRows,
        maxRows,
        suggestion: `Set both to ${minRows} for exactly ${minRows} fixed samples`
      };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Sets up listeners to re-validate when form values change.
   * Ensures validation updates in real-time as user modifies configuration.
   */
  private setupValidationListeners() {
    // Re-validate entire form when any row config changes
    this.columnsForm.get('minRows')?.valueChanges.subscribe(() => {
      this.columnsForm.updateValueAndValidity({ emitEvent: false });
    });
    
    this.columnsForm.get('maxRows')?.valueChanges.subscribe(() => {
      this.columnsForm.updateValueAndValidity({ emitEvent: false });
    });
    
    this.columnsForm.get('initialRows')?.valueChanges.subscribe(() => {
      this.columnsForm.updateValueAndValidity({ emitEvent: false });
    });
    
    this.columnsForm.get('allowAddRow')?.valueChanges.subscribe(() => {
      this.columnsForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Gets validation error messages for display.
   * Returns user-friendly error messages based on validation state.
   * 
   * @returns Array of error messages
   */
  getValidationErrors(): string[] {
    const errors: string[] = [];
    const formErrors = this.columnsForm.errors;

    if (!formErrors) return errors;

    if (formErrors['minGreaterThanMax']) {
      errors.push(`⚠️ Minimum rows (${formErrors['minGreaterThanMax'].minRows}) cannot be greater than maximum rows (${formErrors['minGreaterThanMax'].maxRows})`);
    }

    if (formErrors['initialLessThanMin']) {
      errors.push(`⚠️ Initial rows (${formErrors['initialLessThanMin'].initialRows}) cannot be less than minimum rows (${formErrors['initialLessThanMin'].minRows})`);
    }

    if (formErrors['initialGreaterThanMax']) {
      errors.push(`⚠️ Initial rows (${formErrors['initialGreaterThanMax'].initialRows}) cannot be greater than maximum rows (${formErrors['initialGreaterThanMax'].maxRows})`);
    }

    if (formErrors['fixedRowsMismatch']) {
      errors.push(`⚠️ Fixed samples mode: When "Allow Add Row" is disabled, minimum and maximum rows must be equal. ${formErrors['fixedRowsMismatch'].suggestion}`);
    }

    return errors;
  }

  /**
   * Helper method to identify which business case pattern is being used.
   * Useful for providing contextual help to users.
   * 
   * @returns Description of the current configuration pattern
   */
  getConfigurationPattern(): string {
    const minRows = this.columnsForm.get('minRows')?.value;
    const maxRows = this.columnsForm.get('maxRows')?.value;
    const initialRows = this.columnsForm.get('initialRows')?.value;
    const allowAddRow = this.columnsForm.get('allowAddRow')?.value;

    if (minRows === maxRows && !allowAddRow) {
      return `Fixed ${minRows} samples (no flexibility)`;
    } else if (minRows < maxRows && allowAddRow && initialRows === minRows) {
      return `Minimum ${minRows} samples, can add up to ${maxRows}`;
    } else if (minRows < initialRows && initialRows <= maxRows && allowAddRow) {
      return `Start with ${initialRows} rows, only ${minRows} mandatory, max ${maxRows}`;
    } else if (this.columnsForm.valid) {
      return `Custom configuration: Min=${minRows}, Initial=${initialRows}, Max=${maxRows}`;
    }

    return 'Configure row settings based on QC sampling requirements';
  }
}
