// Basic creation test for the FormRenderService.
import { TestBed } from '@angular/core/testing';

import { FormRenderService } from './form-render.service';

describe('FormRenderService', () => {
  let service: FormRenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormRenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
