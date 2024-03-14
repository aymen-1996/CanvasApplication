import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpathieComponent } from './empathie.component';

describe('EmpathieComponent', () => {
  let component: EmpathieComponent;
  let fixture: ComponentFixture<EmpathieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpathieComponent]
    });
    fixture = TestBed.createComponent(EmpathieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
