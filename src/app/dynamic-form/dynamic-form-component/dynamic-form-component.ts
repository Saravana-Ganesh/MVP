/**
 * DynamicFormComponent
 * --------------------
 * Renders a form based on a JSON template and supports:
 *  - Standard input controls (text, number, email, textarea, date, radio, select)
 *  - A dynamic Material table ("grid") for repeated rows.
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
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

// Service that loads the template and builds the reactive form.
import { DynamicFormService } from '../../service/dynamic-form-service';

@Component({
  selector: 'app-dynamic-form',
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
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './dynamic-form-component.html',
  styleUrl: './dynamic-form-component.css'
})
export class DynamicFormComponent implements OnInit {

  /** JSON template loaded from the backend/assets. */
  template: any;
  /** Root reactive form built from the template. */
  form!: FormGroup;

  /** Holds dataSources for each grid field */
  gridDataSources: Record<string, any[]> = {};

  constructor(
    private formService: DynamicFormService
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
      },
      error: (err) => console.error('Template load error:', err),
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
   * Material table consumes plain arrays; keep a mirror of the
   * FormArray controls for each grid field.
   */
  updateGridData(fieldId: string, grid: FormArray) {
    this.gridDataSources[fieldId] = [...grid.controls];
  }

  /**
   * Returns the column ids for a grid definition (without actions column).
   */
  getColumnIds(field: any): string[] {
    return field.columns.map((c: any) => c.columnId);
  }

  /**
   * Returns the column ids including the "actions" column used by the table.
   */
  getColumnIdsWithActions(field: any): string[] {
    return [...this.getColumnIds(field), 'actions'];
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
