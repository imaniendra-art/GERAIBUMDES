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
          DEFAULT: "#1F6F4A",
          dark: "#256F54",
        },
        secondary: {
          DEFAULT: "#E8B931",
        },
        cta: {
          DEFAULT: "#F28C28",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          bg: "#F8F9F7",
        },
        text: {
          main: "#222222",
          muted: "#666666",
        },
        border: {
          DEFAULT: "#EAEAEA",
        },
        danger: {
          DEFAULT: "#D32F2F",
        },
        success: {
          DEFAULT: "#2E7D32",
        },
        warning: {
          DEFAULT: "#F4B400",
        },
        info: {
          DEFAULT: "#1976D2",
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
