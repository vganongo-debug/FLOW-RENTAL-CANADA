/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vert forêt en couleur primaire (ex-teal). Le nom de jeton est
        // conservé pour ne pas réécrire tous les composants.
        teal: {
          DEFAULT: '#2E503E',
          dark: '#12271B',
          mid: '#4E7260',
          light: '#E0F0E7',
        },
        // Terracotta en accent (ex-cuivre). Assombrie par rapport a la
        // reference (#BC6F4C) : sur un bouton plein en texte papier elle ne
        // donnait que 3,65:1, sous le seuil AA de 4,5. A 4,85:1 elle passe,
        // en bouton comme en texte d'accent sur creme.
        copper: {
          DEFAULT: '#AA5830',
          dark: '#8B492A',
          light: '#F5D8C1',
        },
        ink: '#12271B',
        coal: '#0B1C13',
        panel: {
          DEFAULT: '#193124',
          mid: '#1B3727',
        },
        card: '#233C2D',
        ivory: '#F6F4EB',
        sand: '#E8E3D4',
        g80: '#C9CDBE',
        g60: '#909C92',
        g40: '#4F5C54',
        g20: '#213328',
        // Le blanc pur cède la place au ton papier de la référence : c'est
        // lui qui donne la chaleur des cartes. `bg-white` et `text-white`
        // sont utilisés partout, les remapper suffit.
        white: '#FCFAF4',
      },
      fontFamily: {
        // Une seule famille pour titres, texte et étiquettes : c'est de là
        // que vient la lisibilité de la référence.
        display: ['"Hanken Grotesk"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['"Hanken Grotesk"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        label: ['"Hanken Grotesk"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '6px',
        input: '4px',
        badge: '2px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(12, 26, 26, 0.06), 0 1px 3px 0 rgba(12, 26, 26, 0.10)',
        panel: '0 4px 12px -2px rgba(12, 26, 26, 0.12)',
      },
      letterSpacing: {
        // La référence pousse ses étiquettes majuscules à 0.10–0.14em.
        label: '0.12em',
      },
    },
  },
  plugins: [],
}
