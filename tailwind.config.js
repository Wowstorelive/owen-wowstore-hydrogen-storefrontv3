import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import rtlPlugin from 'tailwindcss-rtl';

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fade: {
          '0%': {opacity: 0},
          '100%': {opacity: 1},
        },
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        contrast: 'rgb(var(--color-contrast) / <alpha-value>)',
        notice: 'rgb(var(--color-accent) / <alpha-value>)',
        shopPay: 'rgb(var(--color-shop-pay) / <alpha-value>)',
      },
      screens: {
        sm: '32em',
        md: '48em',
        lg: '75em',
        xl: '90em',
        '2xl': '96em',
        'sm-max': {max: '48em'},
        'md-max': {max: '64em'},
        'sm-only': {min: '32em', max: '48em'},
        'md-only': {min: '48em', max: '64em'},
        'lg-only': {min: '64em', max: '80em'},
        'xl-only': {min: '80em', max: '96em'},
        '2xl-only': {min: '96em'},
      },
      spacing: {
        nav: 'var(--height-nav)',
        screen: 'var(--screen-height, 100vh)',
      },
      height: {
        screen: 'var(--screen-height, 100vh)',
        'screen-no-nav':
          'calc(var(--screen-height, 100vh) - var(--height-nav))',
        'screen-dynamic': 'var(--screen-height-dynamic, 100vh)',
      },
      width: {
        mobileGallery: 'calc(100vw - 3rem)',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"IBMPlexSerif"', 'Palatino', 'ui-serif'],
      },
      fontSize: {
        display: ['var(--font-size-display)', '1.1'],
        heading: ['var(--font-size-heading)', '1.25'],
        lead: ['var(--font-size-lead)', '1.333'],
        copy: ['var(--font-size-copy)', '1.5'],
        fine: ['var(--font-size-fine)', '1.333'],
      },
      maxWidth: {
        'prose-narrow': '45ch',
        'prose-wide': '80ch',
      },
      boxShadow: {
        border: 'inset 0px 0px 0px 1px rgb(var(--color-primary) / 0.08)',
        darkHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.4)',
        lightHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.05)',
      },
      aspectRatio: {
        '4/2': '4 / 2',
        '4/3': '4 / 3',
        '3/4': '3 / 4',
        '3/2': '3 / 2',
        '12/5': '12 / 5',
        '8/12': '8 / 12',
        '5/6': '5 / 6',
      },
      minWidth: {
        full: '100%',
        '1/2': '50%',
        '1/3': '33.33%',
        '1/4': '25%',
        '1/5': '20%',
        '1/6': '16.66%',
      },
    },
  },
  darkMode: 'class',
  safelist: [
    'my-2',
    'my-4',
    'py-5',
    'aspect-4/2',
    'aspect-4/3',
    'aspect-3/4',
    'aspect-12/5',
    'aspect-8/12',
    'aspect-5/6',
    'md:aspect-4/2',
    'md:aspect-4/3',
    'md:aspect-3/4',
    'md:aspect-12/5',
    'md:aspect-8/12',
    'md:aspect-5/6',
  ],
  plugins: [formsPlugin, typographyPlugin, rtlPlugin],
};
