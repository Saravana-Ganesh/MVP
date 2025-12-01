/**
 * Validator Models
 * Configuration interfaces for field validation rules.
 */

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
 * Validation configuration object (alternative format).
 * Used for simple validation rules like {required: true, email: true}.
 */
export interface ValidationObject {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}
