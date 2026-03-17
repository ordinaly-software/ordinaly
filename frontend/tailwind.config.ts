import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
  	"./src/pages/**/*.{ts,tsx}",
  	"./src/components/**/*.{ts,tsx}",
  	"./src/app/**/*.{ts,tsx}",
  	"./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			purple: {
  				DEFAULT: '#623CEA',
  				foreground: '#1A1924'
  			},
  			dark: {
  				DEFAULT: '#1A1924',
  				foreground: '#FFFFFF'
  			},
  			blue: {
  				DEFAULT: '#46B1C9',
  				50: '#E6F7FA',
  				100: '#B3E5FC',
  				200: '#81D4FA',
  				300: '#4FC3F7',
  				400: '#46B1C9',
  				500: '#46B1C9',
  				600: '#3A96A8',
  				700: '#2F7C87',
  				800: '#246166',
  				900: '#194749'
  			},
  			green: {
  				DEFAULT: '#0255D5',
  				50: '#EFF6FF',
  				100: '#DBEAFE',
  				200: '#BFDBFE',
  				300: '#93C5FD',
  				400: '#60A5FA',
  				500: '#3B82F6',
  				600: '#0255D5',
  				700: '#0144AA',
  				800: '#01388A',
  				900: '#0A255C',
  				dark: '#7DB5FF',
  				dark_alt: '#60A5FA'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			/* Anthropic Design System swatches */
  			ivory: {
  				light:  'var(--swatch--ivory-light)',
  				medium: 'var(--swatch--ivory-medium)',
  				dark:   'var(--swatch--ivory-dark)',
  			},
  			oat:    'var(--swatch--oat)',
  			cloud: {
  				light:  'var(--swatch--cloud-light)',
  				medium: 'var(--swatch--cloud-medium)',
  				dark:   'var(--swatch--cloud-dark)',
  			},
  			slate: {
  				dark:   'var(--swatch--slate-dark)',
  				medium: 'var(--swatch--slate-medium)',
  				light:  'var(--swatch--slate-light)',
  			},
  			clay:   'var(--swatch--clay)',
  			flame:  'var(--swatch--flame)',
  			cobalt: 'var(--swatch--cobalt)',
  			kraft:  'var(--swatch--kraft)',
  			manilla:'var(--swatch--manilla)',
  			olive:  'var(--swatch--olive)',
  			cactus: 'var(--swatch--cactus)',
  			sky:    'var(--swatch--sky)',
  			heather:'var(--swatch--heather)',
  			fig:    'var(--swatch--fig)',
  			coral:  'var(--swatch--coral)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			/* Anthropic radii */
  			'a-s':    'var(--radius-s)',
  			'a-m':    'var(--radius-m)',
  			'a-l':    'var(--radius-l)',
  			'a-xl':   'var(--radius-xl)',
  			'a-full': 'var(--radius-full)',
  		},
  		fontFamily: {
  			sans:  ['var(--font-sans)'],
  			serif: ['var(--font-serif)'],
  		},
  		fontSize: {
  			'detail-xs':    'var(--font-size-detail-xs)',
  			'detail-s':     'var(--font-size-detail-s)',
  			'detail-m':     'var(--font-size-detail-m)',
  			'detail-l':     'var(--font-size-detail-l)',
  			'detail-xl':    'var(--font-size-detail-xl)',
  			'display-xs':   'var(--font-size-display-xs)',
  			'display-s':    'var(--font-size-display-s)',
  			'display-m':    'var(--font-size-display-m)',
  			'display-l':    'var(--font-size-display-l)',
  			'display-xl':   'var(--font-size-display-xl)',
  			'display-xxl':  'var(--font-size-display-xxl)',
  			'display-xxxl': 'var(--font-size-display-xxxl)',
  			'paragraph-m':  'var(--font-size-paragraph-m)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
