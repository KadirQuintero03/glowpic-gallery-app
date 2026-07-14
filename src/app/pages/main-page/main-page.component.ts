import { Component } from '@angular/core';
import { ThemeService, ThemeMode } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {

  constructor(private themeService: ThemeService) { }

  get isLight(): boolean {
    return this.themeService.getTheme() === 'light';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
