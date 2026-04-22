/**
 * Design System Tokens for Vibrant, Modern UI
 * Enforces consistent colors, spacing, shadows, and typography across all components
 */

// ============================================================
// COLOR PALETTE
// ============================================================

export const colors = {
  // Backgrounds
  background: {
    primary: "bg-slate-50",
    secondary: "bg-gray-50",
    gradient: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
  },

  // Card Backgrounds - Vibrant Pastels
  cards: {
    white: "bg-white",
    indigo: "bg-indigo-100",
    orange: "bg-orange-100",
    emerald: "bg-emerald-100",
    purple: "bg-purple-100",
    rose: "bg-rose-100",
    blue: "bg-blue-100",
    amber: "bg-amber-100",
  },

  // Text
  text: {
    primary: "text-slate-900",
    secondary: "text-slate-600",
    tertiary: "text-slate-500",
    light: "text-slate-400",
    inverse: "text-white",
  },

  // Badge Colors
  badges: {
    low: { bg: "bg-blue-100", text: "text-blue-700" },
    medium: { bg: "bg-amber-100", text: "text-amber-700" },
    high: { bg: "bg-orange-100", text: "text-orange-700" },
    urgent: { bg: "bg-rose-100", text: "text-rose-700" },
    success: { bg: "bg-emerald-100", text: "text-emerald-700" },
    info: { bg: "bg-indigo-100", text: "text-indigo-700" },
  },

  // Icon Colors
  icons: {
    primary: "text-indigo-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    orange: "text-orange-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
  },

  // Gradients
  gradients: {
    primary: "from-indigo-500 to-purple-600",
    secondary: "from-purple-500 to-pink-500",
    success: "from-emerald-500 to-teal-500",
    warning: "from-orange-400 to-rose-400",
    accent: "from-indigo-500 via-purple-500 to-pink-500",
  },
};

// ============================================================
// SPACING
// ============================================================

export const spacing = {
  card: "p-6",
  cardLarge: "p-8",
  section: "space-y-6",
  sectionLarge: "space-y-8",
  gap: "gap-5",
  gapLarge: "gap-8",
};

// ============================================================
// BORDER RADIUS
// ============================================================

export const radius = {
  sm: "rounded-lg",
  md: "rounded-2xl",
  lg: "rounded-3xl",
  full: "rounded-full",
};

// ============================================================
// SHADOWS
// ============================================================

export const shadows = {
  soft: "shadow-soft",
  softLg: "shadow-soft-lg",
  default: "shadow-md",
  lg: "shadow-lg",
};

// ============================================================
// HOVER & TRANSITION EFFECTS
// ============================================================

export const effects = {
  cardHover:
    "transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg",
  cardHoverLarge:
    "transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-lg",
  buttonHover:
    "transition-all duration-200 hover:scale-105 hover:shadow-soft-lg",
  buttonActive: "transition-all duration-100 active:scale-95",
  smoothTransition: "transition-all duration-300",
};

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  h1: "text-4xl md:text-5xl font-bold",
  h2: "text-3xl font-bold",
  h3: "text-2xl font-bold",
  h4: "text-xl font-bold",
  h5: "text-lg font-semibold",
  body: "text-base",
  bodySmall: "text-sm",
  label: "text-xs font-semibold uppercase tracking-wider",
};

// ============================================================
// COMPONENT PRESETS
// ============================================================

export const components = {
  // Button presets
  button: {
    primary: `px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-soft hover:shadow-soft-lg transition-all hover:scale-105 active:scale-95`,
    secondary: `px-6 py-3 rounded-full font-semibold bg-white text-slate-900 border-2 border-slate-200 shadow-soft hover:shadow-soft-lg transition-all hover:scale-105 active:scale-95`,
    outlined: `px-6 py-3 rounded-full font-semibold border-2 border-indigo-500 text-indigo-600 transition-all hover:bg-indigo-50`,
  },

  // Card presets
  card: `bg-white rounded-3xl p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1`,
  cardHoverActive: `bg-white rounded-3xl p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer group`,

  // Badge presets
  badge: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold`,

  // Progress bar
  progressBar: `w-full bg-slate-100 rounded-full h-4 overflow-hidden`,
  progressBarFill: `h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 rounded-full`,
};

// ============================================================
// ANIMATION DELAYS
// ============================================================

export const animations = {
  staggerDelay: 0.05,
  delayMap: {
    0: 0,
    1: 0.1,
    2: 0.2,
    3: 0.3,
    4: 0.4,
    5: 0.5,
  },
};
