import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule }  from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule }  from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

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
    MatSlideToggleModule, MatButtonModule, MatTableModule
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

  /**
   * Rebuilds the form whenever the template changes.
   * This ensures the preview stays in sync with the builder.
   */
  ngOnChanges() {
    this.form = this.builder.buildReactiveForm(this.template);
  }

  /**
   * Adds a new empty row to a grid field.
   * Creates an object with empty values for each column.
   * 
   * @param field - The grid field configuration
   */
  addGridRow(field: FieldConfig) {
    const rows = this.form.get(field.fieldId)?.value ?? [];
    const newRow: any = {};

    // Initialize each column with empty value
    field.columns?.forEach(c => newRow[c.columnId] = '');
    rows.push(newRow);

    // Update form control with new rows array
    this.form.get(field.fieldId)?.setValue(rows);
  }

  /**
   * Removes a row from a grid field at the specified index.
   * 
   * @param field - The grid field configuration
   * @param index - Zero-based index of the row to remove
   */
  removeGridRow(field: FieldConfig, index: number) {
    const rows = this.form.get(field.fieldId)?.value ?? [];
    rows.splice(index, 1);
    this.form.get(field.fieldId)?.setValue(rows);
  }

  /**
   * Extracts column IDs from a grid field for table rendering.
   * Used by Material table to define which columns to display.
   * 
   * @param field - The grid field configuration
   * @returns Array of column IDs
   */
  getGridColumns(field: FieldConfig): string[] {
    return field.columns?.map(c => c.columnId) ?? [];
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
}
