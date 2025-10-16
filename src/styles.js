// src/styles.js

export const colors = {
  primary: "#FF3131",
  secondary: "#FF914D",
  light: "#FFF5F0",
  textDark: "#333333",
  textGray: "#666666",
  white: "#FFFFFF",
};

export const gradients = {
  main: "bg-gradient-to-br from-[#FF914D] to-[#FF3131]",
};

export const formStyles = {
  container: "flex justify-center items-center min-h-screen bg-gray-100",
  card: "bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8",
  title: "text-3xl font-bold text-[#FF3131] text-center mb-2",
  subtitle: "text-gray-500 text-center mb-6",
  grid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input:
    "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF914D] focus:outline-none",
  button:
    "w-full py-2 text-white font-semibold rounded-lg shadow-md transition duration-300 bg-[#FF3131] hover:bg-[#FF914D]",
};
