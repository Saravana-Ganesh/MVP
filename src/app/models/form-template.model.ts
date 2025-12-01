/**
 * Form Template Models
 * Root template structure for the entire form.
 */

import { FieldConfig } from './field-types.model';

/**
 * Root template structure for the entire form.
 * Contains metadata and all field configurations.
 */
export interface FormTemplate {
  title: string;           // Form title displayed at the top
  version?: number;        // Template version for migration support
  fields: FieldConfig[];   // Array of all form fields
}
