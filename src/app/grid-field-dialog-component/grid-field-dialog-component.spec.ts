import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridFieldDialogComponent } from './grid-field-dialog-component';

describe('GridFieldDialogComponent', () => {
  let component: GridFieldDialogComponent;
  let fixture: ComponentFixture<GridFieldDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridFieldDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridFieldDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
