// theme.js - Modern, elegant design system
export const theme = {
  colors: {
    // Primary palette - Deep teal/medical blue
    primary: '#0D9488',        // Teal-600 - main brand color
    primaryLight: '#14B8A6',   // Teal-500 - lighter accent
    primaryDark: '#0F766E',    // Teal-700 - darker shade
    
    // Secondary palette - Warm coral/salmon
    secondary: '#F97316',      // Orange-500 - accent/CTAs
    secondaryLight: '#FB923C', // Orange-400
    secondaryDark: '#EA580C',  // Orange-600
    
    // Backgrounds
    background: '#F8FAFC',     // Slate-50 - main background
    surface: '#FFFFFF',        // White - cards/surfaces
    surfaceAlt: '#F1F5F9',     // Slate-100 - alternate surface
    
    // Text colors
    text: '#1E293B',           // Slate-800 - primary text
    textSecondary: '#64748B',  // Slate-500 - secondary text
    textLight: '#94A3B8',      // Slate-400 - disabled/hints
    
    // UI elements
    border: '#E2E8F0',         // Slate-200 - borders
    borderFocus: '#0D9488',    // Same as primary
    inputBackground: '#FFFFFF',
    
    // Status colors
    success: '#10B981',        // Green-500
    error: '#EF4444',          // Red-500
    warning: '#F59E0B',        // Amber-500
    info: '#3B82F6',           // Blue-500
    
    // Gradients
    gradientPrimary: ['#0D9488', '#14B8A6'],
    gradientSecondary: ['#F97316', '#FB923C'],
  },
  
  fonts: {
    // Font sizes
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    
    // Font weights
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    
    // Legacy support
    titleSize: 28,
    textSize: 16,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },
  
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};