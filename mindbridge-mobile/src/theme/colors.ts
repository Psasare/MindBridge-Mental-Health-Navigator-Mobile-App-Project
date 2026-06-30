// ─────────────────────────────────────────────────────────────────────────────
// MindBridge Official Design System (Apple HIG Inspired)
// ─────────────────────────────────────────────────────────────────────────────

// ── Palette constants ─────────────────────────────────────────────────────────
const P = {
  cloudMilk:   '#FDFBF7', // Dribbble Cream (Keep this for clean bg)
  dreamy:      '#F4F0EA', 
  amberSmoke:  '#F2E0D0',
  frost:       '#E4F0F6',
  blueMirage:  '#6E88B0', // Restored original MindBridge Plum
  matchaMist:  '#C2D8C4',
  mossVelvet:  '#385144', // Restored original Sage
  ocean:       '#006989',
  dustyCoal:   '#1F2937', // Dribbble Slate (Keep for text)
  abyss:       '#121212', 
};

// ── Light Mode ────────────────────────────────────────────────────────────────
export const lightColors = {
  plum:      P.blueMirage,          
  plumLight: '#9EB4CC',             
  sage:      P.mossVelvet,          
  ocean:     P.ocean,               

  background:          P.cloudMilk,
  backgroundSecondary: P.dreamy,
  surface:             '#FFFFFF',   

  surfaceWarm: P.amberSmoke,        
  surfaceCool: P.frost,             

  text: {
    primary:   '#1F2937',           
    secondary: '#6B7A8A',           
    tertiary:  '#A0AAB5',           
    onPrimary: '#FFFFFF',           
    onWarm:    P.mossVelvet,        
    onCool:    P.ocean,             
    disabled:  '#D1D5DB',
  },

  accents: {
    cloudMilk:  P.cloudMilk,
    dreamy:     P.dreamy,
    amberSmoke: P.amberSmoke,
    frost:      P.frost,
    blueMirage: P.blueMirage,
    matchaMist: P.matchaMist,
    mossVelvet: P.mossVelvet,
    ocean:      P.ocean,
    dustyCoal:  P.dustyCoal,
    abyss:      P.abyss,

    blueMirageLight: '#9EB4CC',
    mossVelvetLight: '#4A7060',
    oceanLight:      '#0090B8',
    matchaMistDark:  '#8AAA8C',

    powderBlue:   '#9EB4CC',
    softMint:     P.matchaMist,
    dustyRose:    '#C49E9E',        
    sand:         '#D8C8B0',
    terracotta:   '#B87060',
    softGray:     '#B0BEC5',
    gentlePeach:  '#E8B49A',
    slate:        P.blueMirage,
    eucalyptus:   P.mossVelvet,
    softLilac:    '#A0A4C0',
    paleCoral:    '#D09080',
    forestGreen:  '#2E4A3A',
  },

  semantic: {
    success: P.mossVelvet,          
    danger:  '#FF3B30', 
    warning: '#FF9500', 
    info:    '#007AFF', 
  },
};

// ── Dark Mode ─────────────────────────────────────────────────────────────────
export const darkColors = {
  plum:      '#9EB4CC',             
  plumLight: P.blueMirage,
  sage:      '#5A8A70',             
  ocean:     '#0099C0',             

  background:          P.abyss,           
  backgroundSecondary: '#111520',          
  surface:             P.dustyCoal,       

  surfaceWarm: '#2E2218',           
  surfaceCool: '#141C28',           

  text: {
    primary:   '#EEF2F7',           
    secondary: '#A8B8C8',           
    tertiary:  '#708090',           
    onPrimary: P.abyss,             
    onWarm:    '#E8C8A8',           
    onCool:    '#90C8E0',           
    disabled:  '#3A4A5A',
  },

  accents: {
    cloudMilk:  '#2A2A2A',          
    dreamy:     '#1E2228',          
    amberSmoke: '#2E2218',          
    frost:      '#141C28',          
    blueMirage: '#9EB4CC',          
    matchaMist: '#2A3C2C',          
    mossVelvet: '#4A7060',          
    ocean:      '#0080A8',          
    dustyCoal:  P.dustyCoal,        
    abyss:      P.abyss,            

    blueMirageLight: '#B0C8E0',
    mossVelvetLight: '#5A8070',
    oceanLight:      '#00A8C8',
    matchaMistDark:  '#3A5040',

    powderBlue:   '#7090B0',
    softMint:     '#6A9C7A',
    dustyRose:    '#A07878',
    sand:         '#A08060',
    terracotta:   '#C07858',
    softGray:     '#6A7880',
    gentlePeach:  '#C09080',
    slate:        '#7090B0',
    eucalyptus:   '#508068',
    softLilac:    '#7880A8',
    paleCoral:    '#B07868',
    forestGreen:  '#3A5A48',
  },

  semantic: {
    success: '#34C759', 
    danger:  '#FF453A', 
    warning: '#FF9F0A', 
    info:    '#0A84FF', 
  },
};

// ─── Structural tokens (Apple HIG Inspired) ─────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 24,
};

// Apple uses continuous curves. We approximate with these radii.
export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 18, // Adjusted for squircle feel
  lg: 24,
  xl: 32,
  pill: 9999,
};

// Depth & Elevation
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  }
};

// ─── Typography System ────────────────────────────────────────────────────────
// Product Sans: Headers (Impact & Clarity)
// Poppins: UI Elements & Buttons (Geometric precision)
// Montserrat: Body (Readability)
export const typography = {
  fonts: {
    header:   'ProductSans-Bold',
    accent:   'Poppins-SemiBold',
    ui:       'Poppins-Medium',
    body:     'Montserrat-Regular',
    bodyBold: 'Montserrat-Bold',
    caption:  'Montserrat-Medium',
    captionMedium: 'Montserrat-SemiBold',
  },
  h1: { fontSize: 34, fontFamily: 'ProductSans-Bold', letterSpacing: 0.36 },
  h2: { fontSize: 28, fontFamily: 'ProductSans-Bold', letterSpacing: 0.38 },
  h3: { fontSize: 22, fontFamily: 'ProductSans-Bold', letterSpacing: -0.26 },
  h4: { fontSize: 17, fontFamily: 'ProductSans-Bold', letterSpacing: -0.41 },
  body: {
    fontSize: 17,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  bodyBold: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  ui: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  caption: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.08,
  },
  captionMedium: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: -0.08,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.0,
  },
  // Legacy aliases
  content: { fontSize: 16, fontFamily: 'Montserrat-Regular', lineHeight: 26 },
  secondary: { fontSize: 15, fontFamily: 'Montserrat-Regular', lineHeight: 22 },
  humanist: { fontSize: 15, fontFamily: 'Poppins-Medium', lineHeight: 22 },
};

export const theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  shadows
};
