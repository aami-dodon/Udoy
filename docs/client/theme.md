# Theme

Material UI theme configuration lives in `src/theme`. The `theme.js` file centralises palette, typography, and component overrides so shared styling decisions stay consistent across features. Palette values come from `shared/theme/brand.js`, which is also used by the backend email templates to keep brand colours aligned. The app mounts the theme in `index.jsx` via `ThemeProvider` and `CssBaseline`.
