import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
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
    const group: Record<string, FormControl> = {};

    template.fields.forEach((field) => {
      // Grid fields store array of row data
      if (field.type === 'grid') {
        group[field.fieldId] = new FormControl(field.defaultValue ?? []);
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
   * 
   * @param field - Field configuration with validation rules
   * @returns Array of Angular validator functions
   */
  private mapValidators(field: FieldConfig): ValidatorFn[] {
    const fns: ValidatorFn[] = [];

    // Add required validator if field is marked required
    if (field.required) fns.push(Validators.required);
    if (!field.validators) return fns;

    // Map each validator config to Angular validator
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
}
