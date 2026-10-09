/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        raised: 'var(--color-raised)',
        line: 'var(--color-line)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
          faint: 'var(--color-ink-faint)',
        },
        muted: 'var(--color-ink-muted)',
        faint: 'var(--color-ink-faint)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
          ink: 'var(--color-accent-ink)',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
          soft: 'var(--color-amber-soft)',
        },
        sage: {
          DEFAULT: 'var(--color-sage)',
          soft: 'var(--color-sage-soft)',
        },
        rose: {
          DEFAULT: 'var(--color-rose)',
          soft: 'var(--color-rose-soft)',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        xl: '0.75rem',
        lg: '0.5rem',
        md: '0.375rem',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        600: '600ms',
      },
    },
  },
  plugins: [],
}
