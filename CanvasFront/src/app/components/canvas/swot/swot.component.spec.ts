import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwotComponent } from './swot.component';

describe('SwotComponent', () => {
  let component: SwotComponent;
  let fixture: ComponentFixture<SwotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SwotComponent]
    });
    fixture = TestBed.createComponent(SwotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
