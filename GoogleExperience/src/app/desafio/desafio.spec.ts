import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Desafio } from './desafio';

describe('Desafio', () => {
  let component: Desafio;
  let fixture: ComponentFixture<Desafio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Desafio],
    }).compileComponents();

    fixture = TestBed.createComponent(Desafio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
