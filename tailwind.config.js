// tailwind.config.js
module.exports = {
  content: [ // Make sure content path is configured correctly for your project
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // etc.
  ],
  theme: {
    extend: {
      colors: {
        // Your existing core/brand colors
        'brand-blue': '#3b82f6',
        'highlight-green': '#22c55e',
        'warning-yellow': '#eab308',
        'accent-purple': '#a855f7',
        'gold-highlight': '#f59e0b', // Consider using 'amber' below for consistency

        // --- Expanded Pastel Definitions ---

        // Blue (Info, Median, General UI) - Based on Tailwind Blue
        'pastel-bg-blue':    '#eff6ff', // blue-50
        'pastel-border-blue': '#bfdbfe', // blue-200
        'pastel-text-blue':  '#1e40af', // blue-800 (Good contrast)

        // Green (Success, Optimistic, Developed Markets) - Based on Tailwind Green
        'pastel-bg-green':    '#f0fdf4', // green-50
        'pastel-border-green': '#bbf7d0', // green-200
        'pastel-text-green':  '#166534', // green-800

        // Red (Danger, Pessimistic) - Based on Tailwind Red
        'pastel-bg-red':     '#fef2f2', // red-50
        'pastel-border-red':  '#fecaca', // red-200
        'pastel-text-red':   '#991b1b', // red-800

        // Yellow (Warning, Bonds) - Based on Tailwind Yellow
        'pastel-bg-yellow':    '#fefce8', // yellow-50
        'pastel-border-yellow': '#fef08a', // yellow-200
        'pastel-text-yellow':  '#854d0e', // yellow-800

        // Amber (Alternative Yellow/Gold) - Based on Tailwind Amber
        'pastel-bg-amber':    '#fffbeb', // amber-50
        'pastel-border-amber': '#fde68a', // amber-200
        'pastel-text-amber':  '#92400e', // amber-800

        // Purple (Accent, Crypto?) - Based on Tailwind Purple
        'pastel-bg-purple':    '#faf5ff', // purple-50
        'pastel-border-purple': '#e9d5ff', // purple-200
        'pastel-text-purple':  '#6b21a8', // purple-800

        // Teal (Sector Focus) - Based on Tailwind Teal
        'pastel-bg-teal':    '#f0fdfa', // teal-50
        'pastel-border-teal': '#99f6e4', // teal-200
        'pastel-text-teal':  '#115e59', // teal-800

        // Lime (Emerging Markets) - Based on Tailwind Lime
        'pastel-bg-lime':    '#f7fee7', // lime-50
        'pastel-border-lime': '#d9f99d', // lime-200
        'pastel-text-lime':  '#3f6212', // lime-800

        // Orange (Bitcoin) - Based on Tailwind Orange
        'pastel-bg-orange':    '#fff7ed', // orange-50
        'pastel-border-orange': '#fed7aa', // orange-200
        'pastel-text-orange':  '#9a3412', // orange-800

        // Indigo (Ethereum) - Based on Tailwind Indigo
        'pastel-bg-indigo':    '#eef2ff', // indigo-50
        'pastel-border-indigo': '#c7d2fe', // indigo-200
        'pastel-text-indigo':  '#3730a3', // indigo-800

        // (Optional) Gray for subtle backgrounds/borders if needed beyond defaults
        'pastel-bg-gray':    '#f9fafb', // gray-50
        'pastel-border-gray': '#e5e7eb', // gray-200
        'pastel-text-gray':  '#1f2937', // gray-800

      },
    },
  },
  plugins: [],
}
