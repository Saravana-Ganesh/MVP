/**
 * DynamicFormService
 * ------------------
 * Responsible for:
 *  - Loading the JSON template.
 *  - Building the root FormGroup from the template definition.
 *  - Creating grid row FormGroups.
 *  - Generating user-friendly validation messages.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DynamicFormService {
  constructor(private http: HttpClient, private fb: FormBuilder) {}

  /**
   * Fetch the dynamic form template (fields, types, validation rules, etc.).
   */
  loadTemplate(): Observable<any> {
    return this.http.get('assets/form-template1.json');
  }

  /**
   * Build a FormGroup for all fields defined in the template.
   *  - Non-grid fields become simple FormControls.
   *  - Grid fields become empty FormArrays; rows are added later.
   */
  buildForm(template: any): FormGroup {
    const group: any = {};

    template.fields.forEach((field: any) => {
      if (field.type === 'grid') {
        group[field.fieldId] = this.fb.array([]);
      } else {
        group[field.fieldId] = new FormControl('', this.buildValidators(field));
      }
    });

    return new FormGroup(group);
  }

  /* ------------------------ VALIDATOR FACTORY ------------------------ */

  /**
   * Build a list of Angular validators from the field's validation metadata.
   */
  buildValidators(field: any): any[] {
    const rules = field.validation || {};
    const v: any[] = [];

    if (field.required || rules.required) v.push(Validators.required);
    if (rules.email) v.push(Validators.email);
    if (rules.minLength) v.push(Validators.minLength(rules.minLength));
    if (rules.maxLength) v.push(Validators.maxLength(rules.maxLength));
    if (rules.min !== undefined) v.push(Validators.min(rules.min));
    if (rules.max !== undefined) v.push(Validators.max(rules.max));
    if (rules.pattern) v.push(Validators.pattern(rules.pattern));

    return v;
  }

  /* ------------------------ GRID ROW BUILDER ------------------------ */

  /**
   * Build a FormGroup representing a single row in a grid.
   */
  buildGridRow(columns: any[]): FormGroup {
    const row: any = {};

    columns.forEach((col) => {
      row[col.columnId] = new FormControl('');
    });

    return new FormGroup(row);
  }

  /* ------------------------ ERROR MESSAGE BUILDER -------------------- */

  /**
   * Translate validation errors on a control into a user-friendly message.
   */
  getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) return '';

    const e = control.errors;

    if (e['required']) return 'This field is required';
    if (e['email']) return 'Enter a valid email address';
    if (e['minlength']) {
      return `Minimum length is ${e['minlength'].requiredLength}`;
    }
    if (e['maxlength']) {
      return `Maximum length is ${e['maxlength'].requiredLength}`;
    }
    if (e['min']) return `Minimum value is ${e['min'].min}`;
    if (e['max']) return `Maximum value is ${e['max'].max}`;

    return 'Invalid value';
  }
}
