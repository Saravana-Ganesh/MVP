import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule }  from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DynamicPreviewComponent } from '../dynamic-preview-component/dynamic-preview-component';
import { TemplateBuilderService } from '../service/template-builder.service';
import { FieldConfig, FieldType, FormTemplate, OptionItem, ValidatorConfig } from '../models/form-template.model';
import { GridFieldDialogComponent } from '../grid-field-dialog-component/grid-field-dialog-component';

/**
 * Admin console for building dynamic forms.
 * Provides a visual interface to:
 * - Add/edit/delete form fields
 * - Configure field properties and validation
 * - Preview the form in real-time
 * - Export/import form templates as JSON
 */
@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatInputModule, MatSelectModule, MatCheckboxModule,
    MatIconModule, MatDialogModule, MatCardModule, MatChipsModule,
    DynamicPreviewComponent
  ],
  templateUrl: './form-builder.html',
  styleUrls: ['./form-builder.css']
})
export class FormBuilderComponent {
  /** FormBuilder service for creating reactive forms */
  private fb = inject(FormBuilder);
  
  /** Service for template operations */
  private templateSvc = inject(TemplateBuilderService);
  
  /** Dialog service for opening grid configuration */
  private dialog = inject(MatDialog);

  /** Available field types for dropdown selection */
  fieldTypes: FieldType[] = [
    'text','number','email','date','textarea','select','radio','checkbox','toggle','grid'
  ];

  /** The form template being built (contains all fields) */
  template: FormTemplate = this.templateSvc.createEmptyTemplate();

  /** Admin form for configuring a single field before adding it */
  adminForm = this.fb.group({
    label: ['', Validators.required],           // Field label
    type: ['text' as FieldType, Validators.required], // Field type
    placeholder: [''],                          // Placeholder text
    required: [false],                          // Required flag
    defaultValue: [''],                         // Default value
    layout: ['1-column'],                       // Responsive layout
    optionsText: [''],                          // Comma-separated options for select/radio
    validators: this.fb.array([] as FormGroup[]) // Array of validation rules
  });

  /**
   * Getter for the validators FormArray.
   * Provides easy access to validation rules being configured.
   * 
   * @returns FormArray of validator configurations
   */
  get validatorsArray(): FormArray {
    return this.adminForm.get('validators') as FormArray;
  }

  /**
   * Adds a new validator configuration row to the admin form.
   * Allows users to add multiple validation rules to a field.
   */
  addValidatorRow() {
    const row = this.fb.group({
      name: ['required' as ValidatorConfig['name']], // Validator type
      value: [''],                                    // Validator value (e.g., min: 5)
      message: ['']                                   // Custom error message
    });
    this.validatorsArray.push(row);
  }

  /**
   * Removes a validator configuration at the specified index.
   * 
   * @param index - Zero-based index of the validator to remove
   */
  removeValidatorRow(index: number) {
    this.validatorsArray.removeAt(index);
  }

  /**
   * Creates a new field from the admin form and adds it to the template.
   * For grid fields, opens a dialog for column configuration.
   * Validates the form before adding the field.
   */
  addField() {
    // Don't add if form is invalid
    if (this.adminForm.invalid) return;

    const value = this.adminForm.value;

    // Generate a valid field ID from the label
    const fieldId = this.templateSvc.createFieldIdFromLabel(value.label!);

    // Build the field configuration object
    const fieldConfig: FieldConfig = {
      fieldId,
      label: value.label!,
      type: value.type!,
      placeholder: value.placeholder ?? '',
      required: value.required ?? false,
      defaultValue: value.defaultValue ?? '',
      layout: value.layout as any
    };

    // Parse options for select/radio fields
    if (value.type === 'select' || value.type === 'radio') {
      fieldConfig.options = this.parseOptions(value.optionsText ?? '');
    }

    // Add validators if any were configured
    const validators = this.parseValidators();
    if (validators.length) fieldConfig.validators = validators;

    // Grid fields need column configuration via dialog
    if (value.type === 'grid') {
      this.openGridDialog(fieldConfig);
      return;
    }

    // Add field to template and reset form
    this.template.fields.push(fieldConfig);
    this.resetAdminForm();
  }

  /**
   * Loads a field into the admin form for editing.
   * Removes the field from the template (will be re-added on save).
   * 
   * @param index - Index of the field to edit
   */
  editField(index: number) {
    const field = this.template.fields[index];
    
    // Load field values into admin form
    this.adminForm.patchValue({
      label: field.label,
      type: field.type,
      placeholder: field.placeholder ?? '',
      required: field.required ?? false,
      defaultValue: field.defaultValue ?? '',
      layout: field.layout ?? '1-column',
      optionsText: field.options?.map(o => o.label).join(', ') ?? ''
    });

    // Load validators into form array
    this.validatorsArray.clear();
    (field.validators ?? []).forEach(v => {
      this.validatorsArray.push(this.fb.group({
        name: [v.name],
        value: [v.value ?? ''],
        message: [v.message ?? '']
      }));
    });

    // Remove from template (will be re-added when user clicks Add Field)
    this.template.fields.splice(index, 1);
  }

  /**
   * Permanently removes a field from the template.
   * 
   * @param index - Index of the field to delete
   */
  deleteField(index: number) {
    this.template.fields.splice(index, 1);
  }

  /**
   * Moves a field up in the order (swaps with previous field).
   * Cannot move the first field up.
   * 
   * @param index - Index of the field to move
   */
  moveUp(index: number) {
    if (index <= 0) return;
    // Swap with previous field
    [this.template.fields[index-1], this.template.fields[index]] =
      [this.template.fields[index], this.template.fields[index-1]];
  }

  /**
   * Moves a field down in the order (swaps with next field).
   * Cannot move the last field down.
   * 
   * @param index - Index of the field to move
   */
  moveDown(index: number) {
    if (index >= this.template.fields.length-1) return;
    // Swap with next field
    [this.template.fields[index+1], this.template.fields[index]] =
      [this.template.fields[index], this.template.fields[index+1]];
  }

  /**
   * Opens a dialog for configuring grid field columns.
   * Called when user adds a grid type field.
   * 
   * @param baseField - Base field configuration without columns
   */
  private openGridDialog(baseField: FieldConfig) {
    const ref = this.dialog.open(GridFieldDialogComponent, {
      width: '800px',
      data: baseField
    });

    // Add field to template if dialog returns a configuration
    ref.afterClosed().subscribe((gridField?: FieldConfig) => {
      if (gridField) {
        this.template.fields.push(gridField);
      }
      this.resetAdminForm();
    });
  }

  /**
   * Loads a form template from JSON string.
   * Allows users to import and edit existing templates.
   * 
   * @param raw - JSON string containing the template
   */
  loadTemplateFromJson(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      this.template = parsed;
    } catch (e) {
      alert('Invalid JSON');
    }
  }

  /**
   * Parses comma-separated options text into OptionItem array.
   * Used for select and radio field options.
   * Example: "Option 1, Option 2" -> [{label: "Option 1", value: "Option 1"}, ...]
   * 
   * @param text - Comma-separated options string
   * @returns Array of OptionItem objects
   */
  private parseOptions(text: string): OptionItem[] {
    return text
      .split(',')              // Split by comma
      .map(v => v.trim())      // Remove whitespace
      .filter(v => !!v)        // Remove empty strings
      .map(v => ({ label: v, value: v })); // Create option objects
  }

  /**
   * Converts validator form array into ValidatorConfig array.
   * Filters out empty values and messages.
   * 
   * @returns Array of validator configurations
   */
  private parseValidators(): ValidatorConfig[] {
    return this.validatorsArray.controls.map(ctrl => {
      const v = ctrl.value;
      return {
        name: v.name,
        value: v.value === '' ? undefined : v.value,     // Omit empty values
        message: v.message || undefined                   // Omit empty messages
      } as ValidatorConfig;
    });
  }

  /**
   * Resets the admin form to default values.
   * Called after adding or canceling a field.
   */
  private resetAdminForm() {
    this.adminForm.reset({
      label: '',
      type: 'text',
      placeholder: '',
      required: false,
      defaultValue: '',
      layout: '1-column',
      optionsText: ''
    });
    this.validatorsArray.clear();
  }
}
