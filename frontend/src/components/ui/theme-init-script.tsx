"use client";

// Sets the `dark` class before first paint (avoids a theme flash). It only has
// to run in the HTML sent by the server: when React renders the layout again
// on the client (e.g. switching locale remounts <html>), a new <script> would
// never execute and React 19 logs "Encountered a script tag while rendering
// React component". Rendering nothing on the client avoids that; React skips
// the extra server-rendered node in <head> when hydrating.
const THEME_INIT_SCRIPT = `
              (function() {
                function canPersistTheme() {
                  try {
                    const rawPreferences = localStorage.getItem('cookie-preferences');
                    if (!rawPreferences) return true;
                    const parsed = JSON.parse(rawPreferences);
                    return parsed.functional !== false;
                  } catch { return true; }
                }

                function getInitialTheme() {
                  const allowPersistence = canPersistTheme();
                  if (allowPersistence) {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
                  } else {
                    localStorage.removeItem('theme');
                  }
                  return 'light';
                }

                const theme = getInitialTheme();
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              })();
            `;

export default function ThemeInitScript() {
  if (typeof window !== "undefined") return null;
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
