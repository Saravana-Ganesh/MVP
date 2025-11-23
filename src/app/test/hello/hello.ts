/**
 * Simple demo component used in tests to verify
 * template loading and reactive form building.
 */
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-hello',
  imports: [],
  templateUrl: './hello.html',
  styleUrl: './hello.css',
})
export class Hello {
  constructor(private http: HttpClient) {}

  /**
   * Load a simple form template from assets.
   */
  loadTemplate(): Observable<any> {
    return this.http.get('assets/form-template.json');
  }

  /**
   * Build a basic FormGroup with required validators
   * for all fields that are marked as required in the template.
   */
  buildForm(template: any): FormGroup {
    const group: any = {};

    template.fields.forEach((field: any) => {
      group[field.fieldId] = new FormControl(
        '',
        field.required ? Validators.required : [],
      );
    });

    return new FormGroup(group);
  }
}
