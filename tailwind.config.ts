import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3F5F3B",
          dark: "#2F472C",
        },
        secondary: {
          DEFAULT: "#D9A441",
        },
        accent: {
          DEFAULT: "#A7C957",
        },
        earth: {
          DEFAULT: "#8B5E34",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          bg: "#FAF7EF",
        },
        text: {
          main: "#1F2933",
          muted: "#667085",
        },
        border: {
          DEFAULT: "#E7E2D6",
        },
        danger: {
          DEFAULT: "#DC2626",
        },
        success: {
          DEFAULT: "#16A34A",
        },
        warning: {
          DEFAULT: "#F59E0B",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
