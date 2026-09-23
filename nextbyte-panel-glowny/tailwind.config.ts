import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
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
		screens: {
			/**
			 * PANEL NA JEDEN EKRAN — warunek na SZEROKOŚĆ **i** WYSOKOŚĆ.
			 *
			 * Michał: „zależy mi, aby wszystko mieściło się na jednym ekranie
			 * kompa i nie trzeba było scrollować".
			 *
			 * Tryb jednego ekranu stał wcześniej na samym `lg:` (≥1024 px
			 * szerokości), czyli nie pytał o wysokość w ogóle. Zmierzone
			 * 04.08.2026 na 1280×720 — zwykły laptop: poza kolumnami idzie
			 * 394 px (nagłówek salda 114, wyszukiwarka 48, Szybka Podróż 144,
			 * odstępy i wyściółka 88), więc na trzy kolumny zostawało 326 px.
			 * Skrzynka spraw dostawała wtedy 46 px na listę, czyli MNIEJ NIŻ
			 * JEDEN wiersz, a dziennik 36 px. Panel wyglądał poprawnie wyłącznie
			 * na wysokim monitorze.
			 *
			 * 800 px to próg, przy którym kolumny mają 406 px. Tyle wystarcza
			 * na skrzynkę z trzema sprawami i kafelek eventu, a 800 px to
			 * wysokość okna na typowym laptopie 13\" — gdyby próg stał wyżej,
			 * „jeden ekran" działałby wyłącznie na dużych monitorach.
			 * Poniżej strona po prostu się przewija, a karty pokazują pełną
			 * treść. Upychanie trzech list po 40 px jest gorsze niż
			 * przewijanie: „bez scrolla" ma znaczyć „wszystko widać",
			 * a nie „wszystko ucięte".
			 */
			'ekran1': { 'raw': '(min-width: 1024px) and (min-height: 800px)' },
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
			// Mobile-specific breakpoints
			'mobile': { 'max': '767px' },
			'tablet': { 'min': '768px', 'max': '1023px' },
			'desktop': { 'min': '1024px' },
			// Touch device queries
			'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
			'mouse': { 'raw': '(hover: hover) and (pointer: fine)' },
		},
		extend: {
			spacing: {
				// Mobile-friendly spacing
				'touch': 'var(--touch-target-min, 44px)',
				'touch-comfortable': 'var(--touch-target-comfortable, 48px)',
				'safe-top': 'var(--safe-area-inset-top, 0px)',
				'safe-bottom': 'var(--safe-area-inset-bottom, 0px)',
				'safe-left': 'var(--safe-area-inset-left, 0px)',
				'safe-right': 'var(--safe-area-inset-right, 0px)',
			},
		fontFamily: {
				sans: ['var(--font-body)', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
				/*
				   KRÓJ STRONY GŁÓWNEJ — osobny wpis, nie podmiana `sans`.

				   Landing przeniesiony od Artura (31.08.2026) używa `font-landing`
				   w kilkuset miejscach. Ten krój to Plus Jakarta Sans, który
				   platforma MA JUŻ LOKALNIE (public/fonts/fonts.css, wagi 300–800)
				   — więc nie dokładamy zależności od Google Fonts, mimo że źródło
				   ładowało go z CDN. Fonty lokalne to świadoma decyzja platformy:
				   działają bez sieci trzeciej strony i nie wysyłają adresów IP
				   odwiedzających do Google.

				   BEZ `var(--font-body)` na początku — inaczej strona główna
				   dziedziczyłaby krój wybrany przez użytkownika w motywie,
				   a ma wyglądać tak samo dla każdego, kto wchodzi z zewnątrz.
				*/
				landing: ['Plus Jakarta Sans', 'DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				heading: ['var(--font-heading)', 'Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				chat: ['var(--font-body)', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
				/*
				   `font-mono` nie miał tu wpisu, więc spadał na domyślny stos Tailwinda,
				   czyli na krój systemowy. Do 20.08.2026 platforma nie miała własnego
				   monospace w ogóle — teraz ma JetBrains Mono w public/fonts.
				
				   CELOWO BEZ `var(--font-mono)`, mimo że sąsiednie wpisy tak robią.
				   Zmienna o tej nazwie NIE ISTNIEJE — ustawiane są tylko `--font-body`
				   i `--font-heading`. A `var()` bez wartości zapasowej, wskazujący na
				   nieistniejącą zmienną, unieważnia CAŁĄ deklarację na etapie wyliczania
				   wartości: `font-family` przyjęłaby wtedy wartość dziedziczoną i klasa
				   `font-mono` przestałaby robić cokolwiek. Pułapka cicha, bo w kodzie
				   wygląda poprawnie.
				*/
				mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			},
			fontSize: {
				/* SYSTEM WYGLĄDU — pięć rozmiarów pisma Panelu Klienta (17.09.2026): etykieta / meta / treść / tytuł / liczba.
				   Zapadka (zapadkaSpojnosci) liczy w Panelu każdy inny rozmiar. */
				/* Wagi przez zmienne: skóra Personalizacji zmienia grubość pisma bez dotykania komponentów
				   (Kajetan 18.09.2026: „brakuje nam grubości czcionek”). */
				/* ⚠️ DWIE RZECZY NARAZ, SCALONE 22.09.2026: skalowanie pisma z Personalizacji
				   (`--skala-pisma`) ORAZ zapas wagi 600 naprawiony na `staging`.

				   ZAPAS 600, NIE 700: `text-etykieta` rysuje etykiety i liczniki takze POZA Vidomontem
				   (14 wywolan `NaglowekSekcji` w Notatkach, Czacie, PromptEx, Petlach). Tam zadna skora nie
				   ustawia `--waga-etykieta`, wiec zapas JEST wartoscia platformy — a ta od zawsze wynosila 600
				   (`font-semibold`). Zapas 700 pogrubial paski sekcji calego B2C. */
				etykieta: ['calc(10px * var(--skala-pisma, 1))', { lineHeight: '1.2', letterSpacing: '.12em', fontWeight: 'var(--waga-etykieta, 600)' }],
				meta: ['calc(11px * var(--skala-pisma, 1))', { lineHeight: '1.4', fontWeight: 'var(--waga-meta, 400)' }],
				tresc: ['calc(13px * var(--skala-pisma, 1))', { lineHeight: '1.45', fontWeight: 'var(--waga-tresc, 400)' }],
				tytul: ['calc(14px * var(--skala-pisma, 1))', { lineHeight: '1.3', fontWeight: 'var(--waga-tytul, 600)' }],
				liczba: ['calc(26px * var(--skala-pisma, 1))', { lineHeight: '1.1', letterSpacing: '-.02em', fontWeight: 'var(--waga-liczba, 700)' }],
				/* przyciski i pigułki akcji — jedyny rozmiar poza pięcioma (makieta §5) */
				przycisk: ['calc(12px * var(--skala-pisma, 1))', { lineHeight: '1', fontWeight: '600' }],
				// Mobile-optimized font sizes
				'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
				'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
				'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
			},
			colors: {
				/* ── SYSTEM WYGLĄDU (Panel Klienta, zaakceptowany 17.09.2026; docs/STANDARD-WYGLADU.md §11b) ──
				   Zmienne w client-panel/clientPanel.css (.vqc-panel, ciemny + jasny). Warstwy W0→W3 + nakładka,
				   pismo t1/t2/t3/wyłączone, ramki ramka/podzial/pole. Po akceptacji Panelu te same nazwy
				   idą na resztę platformy — zmienne wystarczy zdefiniować globalnie. */
				/* warstwy są PÓŁPRZEZROCZYSTE (Kajetan, 17.09.2026: „brak widocznej siatki w tle psuje efekt premium”) —
				   krycie z --wN-a w systemWygladu.css; W1 dodatkowo rozmywa tło (.bg-w1 tamże) */
				w0: 'hsl(var(--w0) / var(--w0-a, 1))',
				w1: 'hsl(var(--w1) / var(--w1-a, 1))',
				w2: 'hsl(var(--w2) / var(--w2-a, 1))',
				w3: 'hsl(var(--w3) / var(--w3-a, 1))',
				/* pole wgłębione — ciemniejsze od otoczenia (STANDARD-WYGLADU §1a/§8a) */
				pole: 'hsl(var(--w0) / var(--pole-a, .6))',
				nakladka: 'hsl(var(--nakladka) / <alpha-value>)',
				t1: 'hsl(var(--t1) / <alpha-value>)',
				t2: 'hsl(var(--t2) / <alpha-value>)',
				t3: 'hsl(var(--t3) / <alpha-value>)',
				'twyl': 'hsl(var(--t-wyl) / <alpha-value>)',
				ramka: 'var(--ramka)',
				podzial: 'var(--podzial)',
				'ramka-pole': 'var(--ramka-pole)',
				najazd: 'var(--najazd)',
				'seria-1': 'hsl(var(--seria-1) / <alpha-value>)',
				'seria-2': 'hsl(var(--seria-2) / <alpha-value>)',
				'seria-3': 'hsl(var(--seria-3) / <alpha-value>)',
				'seria-4': 'hsl(var(--seria-4) / <alpha-value>)',
				'seria-5': 'hsl(var(--seria-5) / <alpha-value>)',
				'seria-6': 'hsl(var(--seria-6) / <alpha-value>)',
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
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				// Trzecia i czwarta semantyka statusu, obok `destructive`.
				// Bez tych wpisow zmienne istnieja w motywach, ale klasy
				// `text-success` / `bg-warning/10` NIE generuja sie wcale —
				// Tailwind tworzy tylko to, co zna z konfiguracji.
				// Wartosci per motyw w `color_settings`, fallback w index.css.
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground, var(--background)))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground, var(--background)))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar))',
					foreground: 'hsl(var(--sidebar-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Brand colors using CSS variables
				brand: {
					primary: 'hsl(var(--brand-primary))',
					'primary-dark': 'hsl(var(--brand-primary-dark))',
					'primary-light': 'hsl(var(--brand-primary-light))',
					bg: 'hsl(var(--background))',
					text: {
						primary: 'hsl(var(--brand-text-primary))',
						secondary: 'hsl(var(--brand-text-secondary))',
						tertiary: 'hsl(var(--brand-text-tertiary))',
						muted: 'hsl(var(--brand-text-muted))'
					},
					gray: {
						50: 'hsl(var(--card))',
						100: 'hsl(var(--border))',
						200: 'hsl(var(--border))',
						300: 'hsl(var(--border))',
						400: 'hsl(var(--muted-foreground))',
						500: 'hsl(var(--muted-foreground))',
						700: 'hsl(var(--card-foreground))',
						900: 'hsl(var(--foreground))'
					}
				}
			},
			borderRadius: {
				/* SYSTEM WYGLĄDU — cztery promienie Panelu Klienta (17.09.2026): pole 8 · rekord 10 · sekcja 12 · okno 16 (+ full). */
				/* Wartości przez zmienne: skóra Personalizacji zmienia charakter narożników (ostre ↔ zaokrąglone)
				   bez dotykania klas w komponentach (STANDARD-WYGLADU §15, 18.09.2026). */
				pole: 'var(--promien-pole, 8px)',
				rekord: 'var(--promien-rekord, 10px)',
				sekcja: 'var(--promien-sekcja, 12px)',
				okno: 'var(--promien-okno, 16px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Mobile-friendly border radius
				'mobile': '0.5rem',
				'mobile-lg': '0.75rem',
			},
			/* SYSTEM WYGLĄDU — cienie (4): brak · aureola wybranego · poświata uwagi (klasa .podswietl-uwaga) · okno. */
			boxShadow: {
				aureola: 'var(--aureola)',
				okno: 'var(--cien-okna)',
			},
			/* SYSTEM WYGLĄDU — ruch: 160 ms (najazd, fokus, stan) i 220 ms (okna, rozwijanie), jedna krzywa. */
			transitionDuration: {
				szybko: 'var(--czas, 160ms)',
				okno: 'var(--czas-okna, 220ms)',
			},
			transitionTimingFunction: {
				system: 'var(--krzywa, cubic-bezier(.2,.7,.2,1))',
			},
			keyframes: {
				// Mobile-optimized animations
				'fade-in-mobile': {
					'0%': {
						opacity: '0',
						transform: 'translateY(8px) scale(0.98)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-up-mobile': {
					'0%': {
						transform: 'translateY(100%)'
					},
					'100%': {
						transform: 'translateY(0)'
					}
				},
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
				/*
				  COFNIĘTE 05.08.2026 — zdejmowałem stąd `translateY` twierdząc,
				  że `transform` na przodku unieważnia `backdrop-filter` dzieci.
				  TO NIEPRAWDA. Sprawdzone stendem: cztery szyby nad pasami
				  o wysokim kontraście, każda z innym przodkiem. Rozmycie umiera
				  przy przodku z `filter` i przy przodku z `backdrop-filter`,
				  a przy zwykłym `transform: translate` DZIAŁA bez zarzutu.
				  Ruch wraca, bo nigdy nic nie psuł.
				*/
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				// Shimmer loading effect
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-4px)' },
					'75%': { transform: 'translateX(4px)' }
				},
				'glow-breathe': {
					'0%': {
						filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.7))'
					},
					'50%': {
						filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.4))'
					},
					'100%': {
						filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.7))'
					}
				},
				// Futuristic loader animations
				'loader-ring-draw': {
					'0%': {
						strokeDashoffset: '0',
						transform: 'rotate(0deg)'
					},
					'100%': {
						strokeDashoffset: '-251.2',
						transform: 'rotate(360deg)'
					}
				},
				'loader-pin-orbit': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				// Gradient border animation
				'gradient-x': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				// Fingerprint pulse animation for 2FA card
				'fingerprint-pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '0.5'
					},
					'50%': {
						transform: 'scale(1.1)',
						opacity: '0.8'
					}
				},
				'marquee': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' },
				},
				// Photo Studio generation animations
				'photo-aurora': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'photo-shimmer': {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' },
				},
				'photo-scan': {
					'0%': { top: '-2px', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { top: '100%', opacity: '0' },
				},
				'photo-orbit': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'photo-orbit-reverse': {
					'0%': { transform: 'rotate(360deg)' },
					'100%': { transform: 'rotate(0deg)' },
				},
				'photo-sparkle': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
					'50%': { transform: 'scale(1.15) rotate(180deg)', opacity: '0.85' },
				},
				'photo-text-shimmer': {
					'0%': { backgroundPosition: '0% center' },
					'100%': { backgroundPosition: '200% center' },
				},
				'photo-dot': {
					'0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
					'40%': { transform: 'scale(1)', opacity: '1' },
				},
				// Aurora — powolne „oddychanie" poświaty sceny powitalnej asystenta.
				// Tylko opacity + scale (kompozyt GPU), bez layoutu; używane pod motion-safe:.
				'aurora-bloom': {
					'0%, 100%': { opacity: '0.55', transform: 'translate(-50%, -50%) scale(0.97)' },
					'50%': { opacity: '0.8', transform: 'translate(-50%, -50%) scale(1.04)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-mobile': 'fade-in-mobile 0.4s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-up-mobile': 'slide-up-mobile 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
				'loader-ring': 'loader-ring-draw 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'loader-pin': 'loader-pin-orbit 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'gradient-x': 'gradient-x 3s ease-in-out infinite',
				'fingerprint-pulse': 'fingerprint-pulse 2s ease-in-out infinite',
				'spin-slow': 'spin 3s linear infinite',
				'marquee': 'marquee 55s linear infinite',
				// Photo Studio generation
				'photo-aurora': 'photo-aurora 8s linear infinite',
				'photo-shimmer': 'photo-shimmer 2.5s ease-in-out infinite',
				'photo-scan': 'photo-scan 2.2s ease-in-out infinite',
				'photo-orbit': 'photo-orbit 3.5s linear infinite',
				'photo-orbit-reverse': 'photo-orbit-reverse 4.5s linear infinite',
				'photo-sparkle': 'photo-sparkle 2s ease-in-out infinite',
				'photo-text-shimmer': 'photo-text-shimmer 3s linear infinite',
				'photo-dot': 'photo-dot 1.4s ease-in-out infinite',
				// Aurora — scena powitalna asystenta
				'aurora-bloom': 'aurora-bloom 8s ease-in-out infinite',
			},
			height: {
				'dvh': '100dvh', // Dynamic viewport height
				'mobile': 'var(--vh-mobile)', // Mobile-safe viewport height
				'chat-mobile': 'calc(var(--vh-dynamic, 100vh) - var(--mobile-header-height))',
				'chat-desktop': 'calc(var(--vh-dynamic, 100vh) - 100px)',
			},
			minHeight: {
				'dvh': '100dvh', // Dynamic viewport height
				'mobile': 'var(--vh-mobile)', // Mobile-safe viewport height
				'touch': 'var(--touch-target-min, 44px)',
				'touch-comfortable': 'var(--touch-target-comfortable, 48px)',
				'screen-mobile': 'var(--mobile-vh, 100vh)',
			},
			// Smooth scroll utilities
			scrollBehavior: {
				'smooth': 'smooth',
				'instant': 'auto'
			},
			// Mobile-specific utilities
			backdropBlur: {
				'mobile': '8px',
				'mobile-strong': '16px',
			},
			// Badge rarity glow effects
			boxShadow: {
				'glow-common': '0 0 4px rgba(156, 163, 175, 0.3)',
				'glow-common-hover': '0 0 6px rgba(156, 163, 175, 0.5)',
				'glow-rare': '0 0 6px rgba(59, 130, 246, 0.4)',
				'glow-rare-hover': '0 0 8px rgba(59, 130, 246, 0.6)',
				'glow-epic': '0 0 8px rgba(147, 51, 234, 0.5)',
				'glow-epic-hover': '0 0 12px rgba(147, 51, 234, 0.7)',
				'glow-legendary': '0 0 10px rgba(251, 191, 36, 0.6)',
				'glow-legendary-hover': '0 0 14px rgba(251, 191, 36, 0.8)',
				'glow-legendary-pulse': '0 0 12px rgba(251, 191, 36, 0.7)',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
		// Mobile-specific plugin utilities
		function({ addUtilities }: { addUtilities: any }) {
			const newUtilities = {
				// Touch target utilities
				'.touch-target': {
					minHeight: 'var(--touch-target-min, 44px)',
					minWidth: 'var(--touch-target-min, 44px)',
				},
				'.touch-target-comfortable': {
					minHeight: 'var(--touch-target-comfortable, 48px)',
					minWidth: 'var(--touch-target-comfortable, 48px)',
				},
				// Safe area utilities
				'.safe-area-top': {
					paddingTop: 'var(--safe-area-inset-top, 0px)',
				},
				'.safe-area-bottom': {
					paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
				},
				'.safe-area-x': {
					paddingLeft: 'var(--safe-area-inset-left, 0px)',
					paddingRight: 'var(--safe-area-inset-right, 0px)',
				},
				'.safe-area-y': {
					paddingTop: 'var(--safe-area-inset-top, 0px)',
					paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
				},
				'.safe-area': {
					paddingTop: 'var(--safe-area-inset-top, 0px)',
					paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
					paddingLeft: 'var(--safe-area-inset-left, 0px)',
					paddingRight: 'var(--safe-area-inset-right, 0px)',
				},
				// Mobile viewport utilities
				'.h-screen-mobile': {
					height: 'var(--mobile-vh, 100vh)',
				},
				'.min-h-screen-mobile': {
					minHeight: 'var(--mobile-vh, 100vh)',
				},
				// Mobile text selection
				'.select-none-mobile': {
					'@media (hover: none) and (pointer: coarse)': {
						'-webkit-user-select': 'none',
						'-moz-user-select': 'none',
						'user-select': 'none',
					},
				},
				// Mobile scroll optimization
				'.scroll-mobile': {
					'-webkit-overflow-scrolling': 'touch',
					'overscroll-behavior': 'contain',
				},
			};
			
			addUtilities(newUtilities);
		},
	],
} satisfies Config;