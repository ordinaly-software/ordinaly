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
  			dark: {
  				DEFAULT: '#1A1924',
  				foreground: '#FFFFFF'
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
  			ivory: {
  				light: 'color-mix(in srgb, var(--swatch--ivory-light) calc(<alpha-value> * 100%), transparent)',
  				medium: 'color-mix(in srgb, var(--swatch--ivory-medium) calc(<alpha-value> * 100%), transparent)',
  				dark: 'color-mix(in srgb, var(--swatch--ivory-dark) calc(<alpha-value> * 100%), transparent)'
  			},
  			oat: 'color-mix(in srgb, var(--swatch--oat) calc(<alpha-value> * 100%), transparent)',
  			cloud: {
  				light: 'color-mix(in srgb, var(--swatch--cloud-light) calc(<alpha-value> * 100%), transparent)',
  				medium: 'color-mix(in srgb, var(--swatch--cloud-medium) calc(<alpha-value> * 100%), transparent)',
  				dark: 'color-mix(in srgb, var(--swatch--cloud-dark) calc(<alpha-value> * 100%), transparent)'
  			},
  			slate: {
  				dark: 'color-mix(in srgb, var(--swatch--slate-dark) calc(<alpha-value> * 100%), transparent)',
  				medium: 'color-mix(in srgb, var(--swatch--slate-medium) calc(<alpha-value> * 100%), transparent)',
  				light: 'color-mix(in srgb, var(--swatch--slate-light) calc(<alpha-value> * 100%), transparent)'
  			},
  			clay: 'color-mix(in srgb, var(--swatch--clay) calc(<alpha-value> * 100%), transparent)',
  			'clay-fill': 'color-mix(in srgb, var(--swatch--clay-fill) calc(<alpha-value> * 100%), transparent)',
  			'flame-dark': 'color-mix(in srgb, var(--swatch--flame-dark) calc(<alpha-value> * 100%), transparent)',
  			flame: 'color-mix(in srgb, var(--swatch--flame) calc(<alpha-value> * 100%), transparent)',
  			cobalt: {
  				DEFAULT: 'color-mix(in srgb, var(--swatch--cobalt) calc(<alpha-value> * 100%), transparent)',
  				dark: 'color-mix(in srgb, var(--swatch--cobalt-dark) calc(<alpha-value> * 100%), transparent)',
  				light: 'color-mix(in srgb, var(--swatch--cobalt-light) calc(<alpha-value> * 100%), transparent)'
  			},
  			kraft: 'color-mix(in srgb, var(--swatch--kraft) calc(<alpha-value> * 100%), transparent)',
  			manilla: 'color-mix(in srgb, var(--swatch--manilla) calc(<alpha-value> * 100%), transparent)',
  			olive: 'color-mix(in srgb, var(--swatch--olive) calc(<alpha-value> * 100%), transparent)',
  			cactus: 'color-mix(in srgb, var(--swatch--cactus) calc(<alpha-value> * 100%), transparent)',
  			sky: 'color-mix(in srgb, var(--swatch--sky) calc(<alpha-value> * 100%), transparent)',
  			heather: 'color-mix(in srgb, var(--swatch--heather) calc(<alpha-value> * 100%), transparent)',
  			fig: 'color-mix(in srgb, var(--swatch--fig) calc(<alpha-value> * 100%), transparent)',
  			coral: 'color-mix(in srgb, var(--swatch--coral) calc(<alpha-value> * 100%), transparent)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'a-s': 'var(--radius-s)',
  			'a-m': 'var(--radius-m)',
  			'a-l': 'var(--radius-l)',
  			'a-xl': 'var(--radius-xl)',
  			'a-full': 'var(--radius-full)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)'
  			],
  			serif: [
  				'var(--font-serif)'
  			]
  		},
  		fontSize: {
  			'detail-xs': 'var(--font-size-detail-xs)',
  			'detail-s': 'var(--font-size-detail-s)',
  			'detail-m': 'var(--font-size-detail-m)',
  			'detail-l': 'var(--font-size-detail-l)',
  			'detail-xl': 'var(--font-size-detail-xl)',
  			'display-xs': 'var(--font-size-display-xs)',
  			'display-s': 'var(--font-size-display-s)',
  			'display-m': 'var(--font-size-display-m)',
  			'display-l': 'var(--font-size-display-l)',
  			'display-xl': 'var(--font-size-display-xl)',
  			'display-xxl': 'var(--font-size-display-xxl)',
  			'display-xxxl': 'var(--font-size-display-xxxl)',
  			'paragraph-m': 'var(--font-size-paragraph-m)'
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
  			},
  			'background-gradient': {
  				'0%, 100%': {
  					transform: 'translate(0, 0)',
  					animationDelay: 'var(--background-gradient-delay, 0s)'
  				},
  				'20%': {
  					transform: 'translate(calc(100% * var(--tx-1, 1)), calc(100% * var(--ty-1, 1)))'
  				},
  				'40%': {
  					transform: 'translate(calc(100% * var(--tx-2, -1)), calc(100% * var(--ty-2, 1)))'
  				},
  				'60%': {
  					transform: 'translate(calc(100% * var(--tx-3, 1)), calc(100% * var(--ty-3, -1)))'
  				},
  				'80%': {
  					transform: 'translate(calc(100% * var(--tx-4, -1)), calc(100% * var(--ty-4, -1)))'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'background-gradient': 'background-gradient var(--background-gradient-speed, 15s) cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
