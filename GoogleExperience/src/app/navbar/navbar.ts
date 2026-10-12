import { Component, EventEmitter, Input, Output } from '@angular/core';

type Theme = 'dark' | 'light';

@Component({
  selector: 'app-navbar',
  standalone: false,
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  @Input() theme: Theme = 'dark';

  @Output() themeChange = new EventEmitter<Theme>();

  toggleTheme(): void {
    this.themeChange.emit(this.theme === 'dark' ? 'light' : 'dark');
  }
}
