// Wklej zawartość `theme` do swojego tailwind.config.ts (scal z tym, co już masz).
// Kolory MUSZĄ być mapowane przez hsl(var(--...)) — inaczej motywy z styles/index.css
// nie zadziałają.

export const nextbyteTheme = {
  darkMode: ['class'],
  theme: {
    screens: { xs: '475px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'nb-xs': 'var(--r-xs)',
        'nb-sm': 'var(--r-sm)',
        nb: 'var(--r-md)',
        'nb-lg': 'var(--r-lg)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        landing: ['"DM Sans"', 'Inter', 'sans-serif'],
        grotesk: ['"Space Grotesk"', '"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'tab-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 4s linear infinite',
        'tab-in': 'tab-in 0.22s ease-out both',
        'fade-in': 'fade-in 0.18s ease-out both',
      },
    },
  },
}
