import { TestBed } from '@angular/core/testing';

import { Pots } from './pots';

describe('Pots', () => {
  let service: Pots;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pots);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
