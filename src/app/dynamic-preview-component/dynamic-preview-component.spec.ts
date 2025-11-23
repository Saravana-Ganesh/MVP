import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicPreviewComponent } from './dynamic-preview-component';

describe('DynamicPreviewComponent', () => {
  let component: DynamicPreviewComponent;
  let fixture: ComponentFixture<DynamicPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
