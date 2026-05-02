export type ThemeMode = 'light' | 'dark' | 'system'

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem('verdant-theme') as ThemeMode
  return stored || 'system'
}

export function setThemePreference(theme: ThemeMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem('verdant-theme', theme)
}

export function applyThemeClass(theme: ThemeMode) {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  const activeTheme = theme === 'system' ? getSystemTheme() : theme
  
  if (activeTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('verdant-theme') || 'system';
      var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      var activeTheme = stored === 'system' ? (darkQuery.matches ? 'dark' : 'light') : stored;
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;
