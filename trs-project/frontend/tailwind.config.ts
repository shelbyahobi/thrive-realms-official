import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)'],
                serif: ['var(--font-serif)'],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                gold: {
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                }
            },
        },
    },
    plugins: [],
};
export default config;
