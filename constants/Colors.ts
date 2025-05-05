// Alumo Solar App Color Scheme
// Primary colors
const primaryGreen = '#289F5D';
const primaryBlue = '#1D3557';

// Secondary colors
const secondaryBlue = '#457B9D';
const secondaryGreen = '#4BB377';

// Accent colors
const accentYellow = '#FFCA3A';
const accentOrange = '#FF8C42';

// Neutrals
const white = '#FFFFFF';
const offWhite = '#F5F5F5';
const lightGray = '#E5E5E5';
const mediumGray = '#9E9E9E';
const darkGray = '#424242';
const black = '#222222';

export default {
  light: {
    primary: primaryGreen,
    secondary: secondaryBlue,
    accent: accentYellow,
    background: white,
    backgroundSecondary: offWhite,
    text: black,
    textSecondary: darkGray,
    border: lightGray,
    card: white,
    error: '#E63946',
    success: secondaryGreen,
    warning: accentOrange,
  },
  dark: {
    primary: primaryGreen,
    secondary: secondaryBlue,
    accent: accentYellow,
    background: black,
    backgroundSecondary: darkGray,
    text: white,
    textSecondary: lightGray,
    border: darkGray,
    card: darkGray,
    error: '#E63946',
    success: secondaryGreen,
    warning: accentOrange,
  },
};
