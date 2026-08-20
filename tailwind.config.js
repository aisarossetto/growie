/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        growie: {
          dark: '#050021',      // Dark Indigo / Black (Menu ativo, texto principal)
          purple: '#463d94',    // Purple Base (Headers, cards secundários, bordas)
          cyan: '#00afef',      // Bright Blue / Cyan (Links, badges, positivo)
          lilac: '#8A70D6',     // Lilás Accent
          lilacLight: '#A78BFA',// Lilás Light (Gradientes CTAs)
          bg: '#F8F9FA',        // Off-white primário
          bgSecondary: '#F4F4F8', // Off-white secundário
          card: '#FFFFFF',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-lilac': '0 0 20px -5px rgba(138, 112, 214, 0.4)',
        'glow-cyan': '0 0 20px -5px rgba(0, 175, 239, 0.3)',
        'card-soft': '0 4px 20px -2px rgba(5, 0, 33, 0.05)',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #8A70D6 0%, #463d94 100%)',
        'gradient-cyan-purple': 'linear-gradient(135deg, #00afef 0%, #8A70D6 100%)',
        'gradient-dark-purple': 'linear-gradient(135deg, #050021 0%, #463d94 100%)',
      }
    },
  },
  plugins: [],
}
