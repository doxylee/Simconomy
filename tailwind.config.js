module.exports = {
    mode: "jit",
    purge: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class", // or 'media' or 'class'
    theme: {
        extend: {
            spacing: {
                100: "25rem",
                128: "32rem",
                144: "36rem",
                160: "40rem",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
