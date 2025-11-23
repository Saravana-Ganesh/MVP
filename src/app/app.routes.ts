import { Routes } from '@angular/router';
import { DynamicFormComponent } from './dynamic-form/dynamic-form-component/dynamic-form-component';
import { FormBuilderComponent } from './form-builder/form-builder';

/**
 * Application routing configuration.
 * Defines all available routes in the application.
 * 
 * Routes:
 * - '' (root) -> Redirects to /builder
 * - /builder -> Form builder admin console for creating forms
 * - /form -> Dynamic form renderer for displaying forms from JSON
 */
export const routes: Routes = [
  // Dynamic form renderer - displays forms from JSON templates
  { path: 'form', component: DynamicFormComponent },
  
  // Form builder admin console - visual form designer
  { path: 'builder', component: FormBuilderComponent },
  
  // Default route redirects to builder
  { path: '', redirectTo: '/builder', pathMatch: 'full' }
];
