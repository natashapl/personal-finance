import { TestBed } from '@angular/core/testing';

import { Budgets } from './budgets';

describe('Budgets', () => {
  let service: Budgets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Budgets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
