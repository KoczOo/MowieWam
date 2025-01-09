import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ONasComponent } from './o-nas.component';

describe('ONasComponent', () => {
  let component: ONasComponent;
  let fixture: ComponentFixture<ONasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ONasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ONasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
