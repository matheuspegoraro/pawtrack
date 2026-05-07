export const Colors = {
  terracotta: '#B5633B',
  terracottaLight: '#F5E6DB',
  terracottaDark: '#8C4A2B',
  sand: '#F5F0EB',
  cream: '#FBF8F5',
  warmWhite: '#FDFCFA',
  amber: '#C4882A',
  amberLight: '#FBF0DB',
  sage: '#5A9E6F',
  sageLight: '#E2F0E6',
  coral: '#D94F3D',
  coralLight: '#FBEAE8',
  plum: '#8B5A9E',
  plumLight: '#F0E5F5',
  textPrimary: '#2A2017',
  textSecondary: '#6B5D52',
  textTertiary: '#9E9189',
  border: '#E8E0D8',
  white: '#FFFFFF',

  // For backwards compat with template components
  light: {
    text: '#2A2017',
    background: '#FDFCFA',
    tint: '#B5633B',
    icon: '#9E9189',
    tabIconDefault: '#9E9189',
    tabIconSelected: '#B5633B',
  },
  dark: {
    text: '#2A2017',
    background: '#FDFCFA',
    tint: '#B5633B',
    icon: '#9E9189',
    tabIconDefault: '#9E9189',
    tabIconSelected: '#B5633B',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 100,
} as const;
