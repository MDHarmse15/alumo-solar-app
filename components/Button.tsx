import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  TouchableOpacityProps, 
  ActivityIndicator,
  View,
  TextStyle,
  ViewStyle 
} from 'react-native';
import { useGlobalStyles, SPACING } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';

export type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
};

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const globalStyles = useGlobalStyles();
  const backgroundColor = useThemeColor({}, variant === 'primary' ? 'primary' : 'secondary');
  
  // Determine button style based on variant
  let buttonStyle;
  let textStyle;
  
  switch (variant) {
    case 'secondary':
      buttonStyle = globalStyles.buttonSecondary;
      textStyle = globalStyles.buttonText;
      break;
    case 'outline':
      buttonStyle = globalStyles.buttonOutline;
      textStyle = globalStyles.buttonOutlineText;
      break;
    default:
      buttonStyle = globalStyles.button;
      textStyle = globalStyles.buttonText;
  }
  
  // Apply size
  const sizeStyle = buttonSizes[size];
  const textSizeStyle = textSizes[size];
  
  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? backgroundColor : 'white'} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[textStyle, textSizeStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const buttonSizes: Record<string, ViewStyle> = {
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  medium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
};

const textSizes: Record<string, TextStyle> = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.xs,
  },
}); 