// Shallow test to verify that the form renderer component boots.
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRendererComponent } from './form-renderer.component';

describe('FormRendererComponent', () => {
  let component: FormRendererComponent;
  let fixture: ComponentFixture<FormRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone component is imported directly.
      imports: [FormRendererComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
