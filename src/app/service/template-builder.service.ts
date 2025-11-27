import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators, ValidatorFn } from '@angular/forms';
import { FieldConfig, FormTemplate, ValidatorConfig } from '../models/form-template.model';

/**
 * Service responsible for building reactive forms from JSON templates.
 * Converts template configurations into Angular FormGroups with validation.
 */
@Injectable({ providedIn: 'root' })
export class TemplateBuilderService {

  /**
   * Builds a reactive FormGroup from a form template.
   * Creates FormControls for each field with appropriate validators.
   * 
   * @param template - The form template containing field configurations
   * @returns FormGroup with all fields and validation rules
   */
  buildReactiveForm(template: FormTemplate): FormGroup {
    const group: any = {};

    template.fields.forEach((field) => {
      // Grid fields use FormArray to hold row FormGroups
      if (field.type === 'grid') {
        group[field.fieldId] = new FormArray([]);
        return;
      }

      // Regular fields get validators and default values
      const validatorFns = this.mapValidators(field);
      group[field.fieldId] = new FormControl(
        field.defaultValue ?? '',
        validatorFns
      );
    });

    return new FormGroup(group);
  }

  /**
   * Converts field validation config into Angular ValidatorFn array.
   * Handles both field-level required flag and explicit validators.
   * Supports both 'validators' array and 'validation' object formats.
   * 
   * @param field - Field configuration with validation rules
   * @returns Array of Angular validator functions
   */
  private mapValidators(field: FieldConfig): ValidatorFn[] {
    const fns: ValidatorFn[] = [];

    // Add required validator if field is marked required
    if (field.required) fns.push(Validators.required);

    // Handle 'validators' array format
    if (field.validators) {
      for (const v of field.validators) {
        switch (v.name) {
          case 'minLength': fns.push(Validators.minLength(v.value)); break;
          case 'maxLength': fns.push(Validators.maxLength(v.value)); break;
          case 'min': fns.push(Validators.min(v.value)); break;
          case 'max': fns.push(Validators.max(v.value)); break;
          case 'pattern': fns.push(Validators.pattern(v.value)); break;
          case 'email': fns.push(Validators.email); break;
          case 'required': fns.push(Validators.required); break;
        }
      }
    }

    // Handle 'validation' object format
    if (field.validation) {
      const val = field.validation;
      if (val.required) fns.push(Validators.required);
      if (val.email) fns.push(Validators.email);
      if (val.minLength) fns.push(Validators.minLength(val.minLength));
      if (val.maxLength) fns.push(Validators.maxLength(val.maxLength));
      if (val.min !== undefined) fns.push(Validators.min(val.min));
      if (val.max !== undefined) fns.push(Validators.max(val.max));
      if (val.pattern) fns.push(Validators.pattern(val.pattern));
    }

    return fns;
  }

  /**
   * Creates a new empty form template.
   * Used by the form builder to initialize a new form.
   * 
   * @returns Empty FormTemplate with default title
   */
  createEmptyTemplate(): FormTemplate {
    return { title: 'Untitled Form', version: 1, fields: [] };
  }

  /**
   * Generates a valid field ID from a user-provided label.
   * Converts label to lowercase, removes special chars, and removes spaces.
   * Example: "First Name" -> "firstname"
   * 
   * @param label - Human-readable field label
   * @returns Valid field ID for use as form control name
   */
  createFieldIdFromLabel(label: string): string {
    return label
      .trim()                        // Remove leading/trailing spaces
      .toLowerCase()                 // Convert to lowercase
      .replace(/[^a-z0-9]+/g, ' ')  // Replace special chars with space
      .trim()                        // Remove spaces again
      .replace(/\s+/g, '');          // Remove all remaining spaces
  }

  /**
   * Builds a FormGroup representing a single row in a grid.
   * Creates FormControls for each column in the grid.
   * 
   * @param columns - Array of column configurations
   * @returns FormGroup with controls for each column
   */
  buildGridRow(columns: any[]): FormGroup {
    const row: Record<string, FormControl> = {};

    columns.forEach((col) => {
      row[col.columnId] = new FormControl('');
    });

    return new FormGroup(row);
  }
}
