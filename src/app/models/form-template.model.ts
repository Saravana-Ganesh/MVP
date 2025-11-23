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
 * Configuration for field validation rules.
 * Defines the validator type, its value, and custom error message.
 */
export interface ValidatorConfig {
  name: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email';
  value?: any;      // Validator value (e.g., minLength: 5, pattern: regex)
  message?: string; // Custom error message to display
}

/**
 * Option item for select dropdowns and radio button groups.
 * Label is displayed to user, value is stored in form.
 */
export interface OptionItem {
  label: string;                      // Display text
  value: string | number | boolean;  // Actual value stored
}

/**
 * Column definition for grid/table fields.
 * Each column represents a cell type in the dynamic table.
 */
export interface GridColumn {
  columnId: string;                   // Unique identifier for the column
  header?: string;                    // Column header text (preferred)
  label?: string;                     // Alternative to header (backward compatibility)
  type: 'text' | 'number' | 'date';  // Input type for cells in this column
  required?: boolean;                 // Whether this column is required
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

  // Options for select/radio fields
  options?: OptionItem[];

  // Validation rules
  validators?: ValidatorConfig[];

  // Grid/table specific properties
  columns?: GridColumn[];  // Column definitions for grid type
  minRows?: number;        // Minimum number of rows
  maxRows?: number;        // Maximum number of rows

  // Responsive layout configuration
  layout?: '1-column' | '2-column' | '3-column' | 'full-width';
}

/**
 * Root template structure for the entire form.
 * Contains metadata and all field configurations.
 */
export interface FormTemplate {
  title: string;           // Form title displayed at the top
  version?: number;        // Template version for migration support
  fields: FieldConfig[];   // Array of all form fields
}
