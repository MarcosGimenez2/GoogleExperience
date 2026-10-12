import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Impactos } from './impactos';

describe('Impactos', () => {
  let component: Impactos;
  let fixture: ComponentFixture<Impactos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Impactos],
    }).compileComponents();

    fixture = TestBed.createComponent(Impactos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
