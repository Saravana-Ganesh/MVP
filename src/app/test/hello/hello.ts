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

  loadTemplate(): Observable<any> {
    return this.http.get('assets/form-template.json');
  }

  buildForm(template: any): FormGroup {
    const group: any = {};
    template.fields.forEach((field: any) => {
      group[field.fieldId] = new FormControl(
        '',
        field.required ? Validators.required : []
      );
    });
    return new FormGroup(group);
  }
}
