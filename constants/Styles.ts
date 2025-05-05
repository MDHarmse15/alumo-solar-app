import { StyleSheet } from 'react-native';
import Colors from './Colors';
import { useColorScheme } from '@/components/useColorScheme';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHT = {
  regular: 'normal' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: 'bold' as const,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  circle: 9999,
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function getGlobalStyles(scheme: 'light' | 'dark') {
  const colors = Colors[scheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    padding: {
      padding: SPACING.md,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    title: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: FONT_WEIGHT.bold,
      color: colors.text,
      marginBottom: SPACING.md,
    },
    subtitle: {
      fontSize: FONT_SIZE.lg,
      fontWeight: FONT_WEIGHT.semibold,
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    text: {
      fontSize: FONT_SIZE.md,
      color: colors.text,
    },
    textSecondary: {
      fontSize: FONT_SIZE.md,
      color: colors.textSecondary,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.background,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.bold,
    },
    buttonSecondary: {
      backgroundColor: colors.secondary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonOutlineText: {
      color: colors.primary,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.bold,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: FONT_SIZE.md,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export const useGlobalStyles = () => {
  const colorScheme = useColorScheme() ?? 'light';
  return getGlobalStyles(colorScheme);
}; 