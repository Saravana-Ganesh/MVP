import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridColumnConfigDialogComponent } from './grid-column-config-dialog.component';

describe('GridColumnConfigDialogComponent', () => {
  let component: GridColumnConfigDialogComponent;
  let fixture: ComponentFixture<GridColumnConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridColumnConfigDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridColumnConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
