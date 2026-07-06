import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          'on-primary': 'var(--color-on-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          hover: 'var(--color-brand-hover)',
          dark: 'var(--color-brand-dark)',
        },
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
        },
        border: {
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        xp: { DEFAULT: 'var(--color-xp)', container: 'var(--color-xp-container)' },
        streak: { DEFAULT: 'var(--color-streak)', container: 'var(--color-streak-container)' },
        success: { DEFAULT: 'var(--color-success)', container: 'var(--color-success-container)' },
        error: { DEFAULT: 'var(--color-error)', container: 'var(--color-error-container)' },
        warning: { DEFAULT: 'var(--color-warning)', container: 'var(--color-warning-container)' },
        info: { DEFAULT: 'var(--color-info)', container: 'var(--color-info-container)' },
        milestone: { DEFAULT: 'var(--color-milestone)', container: 'var(--color-milestone-container)' },
        subject: {
          math: {
            DEFAULT: 'var(--color-subject-math)',
            container: 'var(--color-subject-math-container)',
            text: 'var(--color-subject-math-text)',
          },
          science: {
            DEFAULT: 'var(--color-subject-science)',
            container: 'var(--color-subject-science-container)',
            text: 'var(--color-subject-science-text)',
          },
          history: {
            DEFAULT: 'var(--color-subject-history)',
            container: 'var(--color-subject-history-container)',
            text: 'var(--color-subject-history-text)',
          },
          arts: {
            DEFAULT: 'var(--color-subject-arts)',
            container: 'var(--color-subject-arts-container)',
            text: 'var(--color-subject-arts-text)',
          },
        },
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.0125em', fontWeight: '600' }],
        'display-md': ['2.125rem', { lineHeight: '2.625rem', letterSpacing: '-0.0074em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0em', fontWeight: '600' }],
        'headline-lg': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0em', fontWeight: '600' }],
        'headline-md': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0em', fontWeight: '600' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.5rem', letterSpacing: '0em', fontWeight: '500' }],
        'title-lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em', fontWeight: '500' }],
        'title-md': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0107em', fontWeight: '500' }],
        'title-sm': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.0077em', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0.0094em', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.0179em', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.025em', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0071em', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.0333em', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.0455em', fontWeight: '500' }],
        'hero-lg': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.0125em', fontWeight: '700' }],
        'hero-md': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.0078em', fontWeight: '700' }],
        'hero-sm': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0em', fontWeight: '700' }],
      },
      transitionDuration: { default: '400ms', slow: '500ms' },
      transitionTimingFunction: { waya: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        logo: ['var(--font-logo)', 'sans-serif'],
        nunito: ['var(--font-logo)', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(1deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-0.5deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'float-slow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
