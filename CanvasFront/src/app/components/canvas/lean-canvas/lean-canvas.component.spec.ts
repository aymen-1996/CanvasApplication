import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeanCanvasComponent } from './lean-canvas.component';

describe('LeanCanvasComponent', () => {
  let component: LeanCanvasComponent;
  let fixture: ComponentFixture<LeanCanvasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeanCanvasComponent]
    });
    fixture = TestBed.createComponent(LeanCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
