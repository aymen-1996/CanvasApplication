import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupInviteComponent } from './popup-invite.component';

describe('PopupInviteComponent', () => {
  let component: PopupInviteComponent;
  let fixture: ComponentFixture<PopupInviteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupInviteComponent]
    });
    fixture = TestBed.createComponent(PopupInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
