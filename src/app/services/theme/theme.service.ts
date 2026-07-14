import { Injectable } from '@angular/core';

const STORAGE_KEY = 'glowpic-theme';
export type ThemeMode = 'dark' | 'light';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private currentTheme: ThemeMode = 'dark';

    constructor() {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        this.setTheme(saved === 'light' ? 'light' : 'dark');
    }

    getTheme(): ThemeMode {
        return this.currentTheme;
    }

    toggleTheme(): ThemeMode {
        return this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
    }

    setTheme(theme: ThemeMode): ThemeMode {
        this.currentTheme = theme;
        const root = document.documentElement;

        if (theme === 'light') {
            root.classList.add('light-theme');
        } else {
            root.classList.remove('light-theme');
        }

        localStorage.setItem(STORAGE_KEY, theme);
        return theme;
    }
}
