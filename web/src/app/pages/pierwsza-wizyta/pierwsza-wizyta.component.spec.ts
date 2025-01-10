import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PierwszaWizytaComponent } from './pierwsza-wizyta.component';

describe('PierwszaWizytaComponent', () => {
  let component: PierwszaWizytaComponent;
  let fixture: ComponentFixture<PierwszaWizytaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PierwszaWizytaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PierwszaWizytaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
