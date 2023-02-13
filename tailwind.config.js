/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
import { plugin } from "tailwindcss/plugin";

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#212529",
        secondary: "#343a40",
        tertiary: "#495057",
        quaternary: "#fb8500",
        primaryText: "#8ecae6",
        secondaryText: "#fdfcdc",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".btn": {
          padding: ".5rem 1rem",
          borderRadius: ".25rem",
          fontWeight: "600",
        },
        ".btn-blue": {
          backgroundColor: "#3490dc",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#2779bd",
          },
        },
        ".btn-red": {
          backgroundColor: "#e3342f",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#cc1f1a",
          },
        },
      });
    }),
  ],
};
