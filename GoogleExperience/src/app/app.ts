import { Component, OnInit, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('GoogleExperience');

  theme: Theme = 'dark';

  ngOnInit(): void {
    try {
      const savedTheme = localStorage.getItem('google-experience-theme');

      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.theme = savedTheme;
      }
    } catch {
      this.theme = 'dark';
    }
  }

  changeTheme(theme: Theme): void {
    this.theme = theme;

    try {
      localStorage.setItem('google-experience-theme', theme);
    } catch {
      // O site continua funcionando mesmo se o armazenamento estiver indisponível.
    }
  }
}
