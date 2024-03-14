import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAcceptedComponent } from './popup-accepted.component';

describe('PopupAcceptedComponent', () => {
  let component: PopupAcceptedComponent;
  let fixture: ComponentFixture<PopupAcceptedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAcceptedComponent]
    });
    fixture = TestBed.createComponent(PopupAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
