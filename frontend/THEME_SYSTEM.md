# 🎨 Theme System Documentation

## Overview
OneFlow now features a complete Dark/Light theme system with smooth transitions using CSS variables and Zustand state management.

## Features

### ✨ Implemented Features
- **Dark/Light Mode Toggle** - Seamlessly switch between themes
- **Smooth Transitions** - All colors transition smoothly with 0.3s ease animation
- **Persistent Theme** - Theme choice is saved in localStorage
- **CSS Variables** - Centralized color management
- **Theme-Aware Components** - All components respect the current theme

### 🎯 Theme Toggle Location
The theme toggle button is located in the **Header** (top-right corner), next to notifications and logout button.

## CSS Variables

### Light Theme Colors
```css
--bg-primary: 249 250 251      /* Main background */
--bg-secondary: 255 255 255    /* Cards, panels */
--bg-tertiary: 243 244 246     /* Hover states */
--text-primary: 17 24 39       /* Main text */
--text-secondary: 75 85 99     /* Secondary text */
--text-tertiary: 156 163 175   /* Tertiary text */
--border-color: 229 231 235    /* Borders */
--primary: 14 165 233          /* Primary brand color */
--primary-hover: 2 132 199     /* Primary hover state */
```

### Dark Theme Colors
```css
--bg-primary: 17 24 39         /* Main background */
--bg-secondary: 31 41 55       /* Cards, panels */
--bg-tertiary: 55 65 81        /* Hover states */
--text-primary: 243 244 246    /* Main text */
--text-secondary: 209 213 219  /* Secondary text */
--text-tertiary: 156 163 175   /* Tertiary text */
--border-color: 75 85 99       /* Borders */
--primary: 56 189 248          /* Primary brand color */
--primary-hover: 14 165 233    /* Primary hover state */
```

## Usage

### Using CSS Variables in Components
```jsx
// Background
style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}

// Text
style={{ color: 'rgb(var(--text-primary))' }}

// Border
style={{ borderColor: 'rgb(var(--border-color))' }}

// Primary Color
style={{ backgroundColor: 'rgb(var(--primary))' }}
```

### Using Theme Store
```jsx
import { useThemeStore } from '../store/themeStore';

function MyComponent() {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## Components Updated

All major components have been updated to support theming:

### Layout Components
- ✅ **MainLayout** - Background transitions
- ✅ **Header** - Theme toggle button, themed background
- ✅ **Sidebar** - Dark sidebar with theme-aware colors

### Auth Pages
- ✅ **Login** - Themed background and form
- ✅ **Signup** - Themed background and form

### UI Components
- ✅ **Cards** - `.card` class with CSS variables
- ✅ **Buttons** - `.btn-primary`, `.btn-secondary`, `.btn-outline`
- ✅ **Input Fields** - `.input-field` with theme-aware styling
- ✅ **Badges** - Status badges with theme support

## Customization

### Changing Theme Colors
Edit `src/index.css` to customize colors:

```css
:root[data-theme="light"] {
  --primary: 14 165 233;  /* Change to your brand color */
  /* ... other variables */
}
```

### Adding New Color Variables
1. Add to both light and dark theme sections in `src/index.css`
2. Use in components with `rgb(var(--your-variable))`

### Creating Custom Theme
```javascript
// In themeStore.js, add a new theme
const themes = {
  light: { /* ... */ },
  dark: { /* ... */ },
  custom: { /* your colors */ }
};
```

## Technical Details

### State Management
- **Store**: `src/store/themeStore.js`
- **Persistence**: localStorage with key `theme-storage`
- **Default**: Light mode

### Transitions
All theme-related properties have smooth transitions:
```css
* {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease;
}
```

### Theme Initialization
Theme is initialized in `App.jsx` on mount, reading from localStorage.

## Benefits

1. **Better UX** - Users can choose their preferred theme
2. **Eye Comfort** - Dark mode reduces eye strain
3. **Professional** - Shows attention to detail
4. **Accessible** - Respects user preferences
5. **Modern** - Follows current web design trends

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ All modern browsers supporting CSS Variables

## Future Enhancements

Potential improvements:
- [ ] System theme detection (prefers-color-scheme)
- [ ] Multiple theme options (e.g., blue, green, purple)
- [ ] High contrast mode for accessibility
- [ ] Custom theme builder
- [ ] Per-project theme settings

---

**Enjoy your new theme system! 🌓**
