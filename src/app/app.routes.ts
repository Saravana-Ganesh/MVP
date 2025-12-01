import { Routes } from '@angular/router';
import { FormRendererComponent } from './form-renderer/form-renderer.component';
import { FormBuilderComponent } from './form-builder/form-builder';

/**
 * Application routing configuration.
 * Defines all available routes in the application.
 * 
 * Routes:
 * - '' (root) -> Redirects to /builder
 * - /builder -> Form builder admin console for creating forms
 * - /form -> Form renderer for displaying forms from JSON templates
 */
export const routes: Routes = [
  // Form renderer - displays forms from JSON templates
  { path: 'form', component: FormRendererComponent },
  
  // Form builder admin console - visual form designer
  { path: 'builder', component: FormBuilderComponent },
  
  // Default route redirects to builder
  { path: '', redirectTo: '/builder', pathMatch: 'full' }
];
