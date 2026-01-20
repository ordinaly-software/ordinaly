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
  				DEFAULT: '#1F8A0D',
  				50: '#F0F8F3',
  				100: '#D1EFE0',
  				200: '#A3DFC6',
  				300: '#75CEAC',
  				400: '#47BD92',
  				500: '#1F8A0D',
  				600: '#1B7A0B',
  				700: '#176A09',
  				800: '#135A07',
  				900: '#0F4A05',
  				dark: '#3FBD6F',
  				dark_alt: '#2EA55E'
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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
