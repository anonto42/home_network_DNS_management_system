/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        'accent-purple': {
          DEFAULT: "var(--accent-purple)",
          foreground: "var(--accent-purple-foreground)",
        },
        'accent-gold': {
          DEFAULT: "var(--accent-gold)",
          foreground: "var(--accent-gold-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        xs: '4px',
        xl: '32px',
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      fontFamily: {
        'headline-sm': ['Inter'],
        'display-lg': ['Inter'],
        'headline-lg': ['Inter'],
        'label-md': ['Inter'],
        'body-md': ['Inter'],
        'headline-md': ['Inter'],
        'body-sm': ['Inter'],
        'label-sm': ['Inter'],
        'headline-lg-mobile': ['Inter'],
        'body-lg': ['Inter'],
        'code': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'headline-sm': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'label-md': ['14px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'code': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
}
