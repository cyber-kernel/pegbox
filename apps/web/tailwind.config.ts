import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/*/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../tools/*/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          text: 'var(--primary-text)',
        },
        focus: 'var(--focus)',
        success: {
          text: 'var(--success-text)',
          bg: 'var(--success-bg)',
        },
        warning: {
          text: 'var(--warning-text)',
          bg: 'var(--warning-bg)',
        },
        danger: {
          text: 'var(--danger-text)',
          bg: 'var(--danger-bg)',
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
