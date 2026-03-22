import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotCard } from './pot-card';

describe('PotCard', () => {
  let component: PotCard;
  let fixture: ComponentFixture<PotCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PotCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PotCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
