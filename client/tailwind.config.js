/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Override defaults with our curated scale only
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1200px',
    },
    extend: {
      // ─── Colour Palette ──────────────────────────────────────────────
      colors: {
        // Background
        bg: 'hsl(var(--bg))',
        'bg-subtle': 'hsl(var(--bg-subtle))',
        // Ink
        ink: 'hsl(var(--ink))',
        'ink-2': 'hsl(var(--ink-2))',
        'ink-3': 'hsl(var(--ink-3))',
        // Borders
        line: 'hsl(var(--line))',
        'line-2': 'hsl(var(--line-2))',
        // Accent (single, deep forest green)
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          hover: 'hsl(var(--accent-hover))',
          subtle: 'hsl(var(--accent-subtle))',
          foreground: 'hsl(var(--accent-fg))',
        },
        // Feedback
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
        // Surface cards
        surface: 'hsl(var(--surface))',
        'surface-2': 'hsl(var(--surface-2))',
        // Semantic aliases for shadcn compat
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--ink))',
        primary: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-fg))' },
        secondary: { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--ink))' },
        muted: { DEFAULT: 'hsl(var(--bg-subtle))', foreground: 'hsl(var(--ink-3))' },
        destructive: { DEFAULT: 'hsl(var(--error))', foreground: 'hsl(0 0% 98%)' },
        border: 'hsl(var(--line))',
        input: 'hsl(var(--line))',
        ring: 'hsl(var(--accent))',
        card: { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--ink))' },
        popover: { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--ink))' },
      },

      // ─── Typography ──────────────────────────────────────────────────
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Fluid type scale using clamp
        'display-2xl': ['clamp(3rem, 6vw + 1rem, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-xl': ['clamp(2.25rem, 4vw + 1rem, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-lg': ['clamp(1.875rem, 3vw + 0.5rem, 3rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['clamp(1.5rem, 2vw + 0.5rem, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        'display-sm': ['clamp(1.25rem, 1.5vw + 0.25rem, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.65', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'label': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        // Keep Tailwind defaults for utility purposes
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
      },

      // ─── Spacing ─────────────────────────────────────────────────────
      maxWidth: {
        content: '1200px',
        prose: '68ch',
        narrow: '52ch',
      },
      spacing: {
        section: 'clamp(4rem, 8vw, 10rem)',
        'section-sm': 'clamp(2.5rem, 5vw, 6rem)',
      },

      // ─── Borders & Radius ─────────────────────────────────────────────
      borderRadius: {
        control: '6px',   // buttons, inputs, badges
        card: '10px',     // cards, panels
        lg: '10px',
        md: '6px',
        sm: '4px',
        full: '9999px',
      },

      // ─── Shadows ────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 4px 0 hsl(0 0% 0% / 0.05)',
        'card-hover': '0 4px 12px 0 hsl(0 0% 0% / 0.08)',
        focus: '0 0 0 3px hsl(var(--accent) / 0.25)',
      },

      // ─── Motion tokens ──────────────────────────────────────────────
      transitionDuration: {
        micro: '150ms',
        ui: '300ms',
        reveal: '700ms',
      },
      transitionTimingFunction: {
        omc: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
