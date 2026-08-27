/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bleu du logo en couleur primaire. Le nom de jeton reste `teal`
        // pour ne pas réécrire tous les composants.
        teal: {
          DEFAULT: '#015FC4',
          dark: '#081D38',
          mid: '#347FCC',
          light: '#E6EFF9',
        },
        // Rouge de la feuille d'érable en accent. 7,16:1 sur texte blanc,
        // donc AAA en bouton plein comme en texte.
        copper: {
          DEFAULT: '#B30307',
          dark: '#7D0205',
          light: '#F6E1E1',
        },
        ink: '#081D38',
        coal: '#050E23',
        panel: {
          DEFAULT: '#142842',
          mid: '#263850',
        },
        card: '#37485E',
        ivory: '#F4F7FB',
        sand: '#E4EAF2',
        g80: '#C6D3E2',
        g60: '#8497AE',
        g40: '#4A5C74',
        g20: '#1B3252',
        // Blanc franc : c'est ce qui donne la netteté au couple marine/bleu.
        white: '#FFFFFF',
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
