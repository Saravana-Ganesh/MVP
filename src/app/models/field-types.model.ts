/**
 * Field Type Models
 * Core interfaces for form field configuration and types.
 */

import { ValidatorConfig, ValidationObject } from './validators.model';
import { GridColumn } from './grid.model';

/**
 * Supported field types for the dynamic form builder.
 * Each type renders a different UI component.
 */
export type FieldType =
  | 'text'      // Single-line text input
  | 'number'    // Numeric input with up/down arrows
  | 'email'     // Email input with validation
  | 'date'      // Date picker
  | 'radio'     // Radio button group
  | 'checkbox'  // Single checkbox
  | 'toggle'    // Material slide toggle
  | 'select'    // Dropdown select
  | 'textarea'  // Multi-line text input
  | 'grid';     // Dynamic table with add/remove rows

/**
 * Option item for select dropdowns and radio button groups.
 * Label is displayed to user, value is stored in form.
 */
export interface OptionItem {
  label: string;                      // Display text
  value: string | number | boolean;  // Actual value stored
}

/**
 * Complete configuration for a single form field.
 * Contains all properties needed to render and validate the field.
 */
export interface FieldConfig {
  fieldId: string;      // Unique identifier (used as form control name)
  label: string;        // Display label for the field
  type: FieldType;      // Type of input control to render
  placeholder?: string; // Placeholder text for input fields
  required?: boolean;   // Whether the field is required
  defaultValue?: any;   // Initial value for the field
  header?: string;      // Header text for the field

  // Options for select/radio fields (supports both formats)
  options?: OptionItem[] | string[];

  // Validation rules (supports both formats)
  validators?: ValidatorConfig[];
  validation?: ValidationObject;

  // Grid/table specific properties
  columns?: GridColumn[];  // Column definitions for grid type
  minRows?: number;        // Minimum number of rows
  maxRows?: number;        // Maximum number of rows
  initialRows?: number;    // Number of rows to create at grid initialization
  allowAddRow?: boolean;   // Whether to show "Add Row" button

  // Responsive layout configuration
  layout?: '1-column' | '2-column' | '3-column' | 'full-width';
}
