import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Base width on a standard iPhone (e.g., iPhone 13/14)
const scale = SCREEN_WIDTH / 390;

export function RFValue(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// ─────────────────────────────────────────────────────────────────────────────
// MindBridge Official Design System (Apple HIG Inspired)
// ─────────────────────────────────────────────────────────────────────────────

// ── Palette constants ─────────────────────────────────────────────────────────
const P = {
  cloudMilk:   '#FDFBF7', // Dribbble Cream (Keep this for clean bg)
  dreamy:      '#F4F0EA', 
  amberSmoke:  '#F2E0D0',
  frost:       '#E4F0F6',
  blueMirage:  '#4A90E2', // Uplifting, happy sky blue (replaces depressing grey-blue)
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

  background:          '#F2F2F7',   // iOS Grouped Background Light
  backgroundSecondary: '#FFFFFF',
  surface:             '#FFFFFF',   // iOS Surface Light

  surfaceWarm: P.amberSmoke,        
  surfaceCool: P.frost,             

  text: {
    primary:   '#000000',           
    secondary: '#4B5563',           // Darker gray for readability
    tertiary:  '#8A8A8E',           // Distinct but readable gray (fixes #C7C7CC low contrast)
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
  plum:      '#5BA4FC',             // Brighter, more vibrant blue for dark mode
  plumLight: '#8AB4F8',             // Bright pastel blue
  sage:      '#66B086',             // Vibrant, brighter sage/mint
  ocean:     '#00B4D8',             // Vibrant electric cyan/ocean
  
  background:          '#000000',   // iOS Pure OLED Black
  backgroundSecondary: '#1C1C1E',   // iOS Grouped Background Dark       
  surface:             '#1C1C1E',   // iOS Elevated Surface Dark    

  surfaceWarm: '#2E2218',           
  surfaceCool: '#141C28',           

  text: {
    primary:   '#FFFFFF',           
    secondary: '#E5E7EB',           // Crisp light silver for dark mode
    tertiary:  '#9CA3AF',           // Lighter distinct gray
    onPrimary: '#000000',             
    onWarm:    '#F2D7B6',           // Brighter text for warm surfaces
    onCool:    '#AEE2F2',           // Brighter text for cool surfaces
    disabled:  '#636366',           // Solid disabled gray
  },

  accents: {
    cloudMilk:  '#333333',          
    dreamy:     '#262A33',          
    amberSmoke: '#3D2D20',          
    frost:      '#1A2536',          
    blueMirage: '#6CA6F2',          // Vibrant blue mirage
    matchaMist: '#385C40',          // Clearer green
    mossVelvet: '#5CA684',          // Vibrant velvet
    ocean:      '#00AEE0',          // Electric ocean
    dustyCoal:  '#4A5568',          // Lighter coal
    abyss:      '#232323',          

    blueMirageLight: '#8CBDF2',
    mossVelvetLight: '#7EC4A3',
    oceanLight:      '#33D1F2',
    matchaMistDark:  '#4A7353',

    powderBlue:   '#86ADDF',
    softMint:     '#8ED3A4',
    dustyRose:    '#D89696',
    sand:         '#CBAE8F',
    terracotta:   '#E89274',
    softGray:     '#8F9DA6',
    gentlePeach:  '#ECA590',
    slate:        '#86ADDF',
    eucalyptus:   '#72AD8E',
    softLilac:    '#9AA1CE',
    paleCoral:    '#E39783',
    forestGreen:  '#4D7A60',
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
  h1: { fontSize: RFValue(34), fontFamily: 'ProductSans-Bold', letterSpacing: 0.36 },
  h2: { fontSize: RFValue(28), fontFamily: 'ProductSans-Bold', letterSpacing: 0.38 },
  h3: { fontSize: RFValue(22), fontFamily: 'ProductSans-Bold', letterSpacing: -0.26 },
  h4: { fontSize: RFValue(17), fontFamily: 'ProductSans-Bold', letterSpacing: -0.41 },
  body: {
    fontSize: RFValue(17),
    fontFamily: 'Montserrat-Regular',
    lineHeight: RFValue(22),
    letterSpacing: -0.41,
  },
  bodyBold: {
    fontSize: RFValue(17),
    fontFamily: 'Montserrat-Bold',
    lineHeight: RFValue(22),
    letterSpacing: -0.41,
  },
  ui: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Medium',
    lineHeight: RFValue(20),
    letterSpacing: -0.24,
  },
  caption: {
    fontSize: RFValue(13),
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.08,
  },
  captionMedium: {
    fontSize: RFValue(13),
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: -0.08,
  },
  label: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.0,
  },
  // Legacy aliases
  content: { fontSize: RFValue(16), fontFamily: 'Montserrat-Regular', lineHeight: RFValue(26) },
  secondary: { fontSize: RFValue(15), fontFamily: 'Montserrat-Regular', lineHeight: RFValue(22) },
  humanist: { fontSize: RFValue(15), fontFamily: 'Poppins-Medium', lineHeight: RFValue(22) },
};

export const theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  shadows
};
