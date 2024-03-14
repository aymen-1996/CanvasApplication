import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpCanvasComponent } from './vp-canvas.component';

describe('VpCanvasComponent', () => {
  let component: VpCanvasComponent;
  let fixture: ComponentFixture<VpCanvasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VpCanvasComponent]
    });
    fixture = TestBed.createComponent(VpCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
