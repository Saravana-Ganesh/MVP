import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component.
 * This is the entry point of the Angular application.
 * Contains the router outlet that displays routed components:
 * - /builder - Form builder admin console
 * - /form - Dynamic form renderer
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  /** Application title signal for reactive updates */
  protected readonly title = signal('FormGeneratorEngine');
}
