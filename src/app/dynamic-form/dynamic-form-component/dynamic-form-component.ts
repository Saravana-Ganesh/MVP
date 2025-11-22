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

  template: any;
  form!: FormGroup;

  /** Holds dataSources for each grid field */
  gridDataSources: Record<string, any[]> = {};

  constructor(
    private formService: DynamicFormService
  ) { }

  ngOnInit() {
    this.formService.loadTemplate().subscribe({
      next: (template) => {
        this.template = template;
        this.form = this.formService.buildForm(template);

        // Initialize empty tables
        this.template.fields
          .filter((f: any) => f.type === 'grid')
          .forEach((grid: any) => {
            this.gridDataSources[grid.fieldId] = [];
          });
      },
      error: (err) => console.error('Template load error:', err),
    });
  }

  getGrid(fieldId: string): FormArray {
    return this.form.get(fieldId) as FormArray;
  }

  addGridRow(field: any) {
    const grid = this.getGrid(field.fieldId);
    const row = this.formService.buildGridRow(field.columns);

    grid.push(row);
    this.updateGridData(field.fieldId, grid);
  }

  deleteGridRow(fieldId: string, index: number) {
    const grid = this.getGrid(fieldId);
    grid.removeAt(index);
    this.updateGridData(fieldId, grid);
  }

  updateGridData(fieldId: string, grid: FormArray) {
    this.gridDataSources[fieldId] = [...grid.controls];
  }

  getColumnIds(field: any): string[] {
    return field.columns.map((c: any) => c.columnId);
  }

  getColumnIdsWithActions(field: any): string[] {
    return [...this.getColumnIds(field), 'actions'];
  }

  /* ----------------------- VALIDATION HANDLERS ----------------------- */

  shouldShowError(fieldId: string): boolean {
    const control = this.form.get(fieldId);
    return !!control && control.invalid && control.touched;
  }

  getErrorMessage(fieldId: string): string {
    return this.formService.getErrorMessage(this.form.get(fieldId));
  }

  onSubmit() {
    console.log('FORM VALUE → ', this.form.value);
  }
}
