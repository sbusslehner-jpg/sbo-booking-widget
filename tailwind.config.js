/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}', './index.html'],
  // Important: scope under :host so we can inject into the Shadow Root.
  // We use a custom prefix-free build but rely on CSS variables for theming.
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          fg: 'var(--color-primary-fg)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
        },
        border: 'var(--color-border)',
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          blue: 'var(--color-accent-blue)',
        },
        success: 'var(--color-success)',
        info: {
          bg: 'var(--color-info-bg)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      maxWidth: {
        widget: '720px',
      },
      boxShadow: {
        widget: '0 24px 80px -32px rgba(15, 23, 42, 0.35)',
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // We provide our own base reset inside the Shadow Root to avoid global leakage.
    preflight: false,
  },
}
