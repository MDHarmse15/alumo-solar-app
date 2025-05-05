import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useGlobalStyles, SPACING, FONT_SIZE } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/constants/Styles';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
};

export default function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const globalStyles = useGlobalStyles();
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: any) => {
    setIsFocused(false);
    rest.onBlur && rest.onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[globalStyles.textSecondary, styles.label]}>{label}</Text>
      )}
      <View
        style={[
          globalStyles.input,
          styles.inputContainer,
          isFocused && { borderColor: primaryColor },
          error && { borderColor: errorColor },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            { color: textColor, flex: 1 },
            leftIcon ? styles.hasLeftIcon : null,
            style,
          ]}
          placeholderTextColor={borderColor}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordIcon}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={borderColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  hasLeftIcon: {
    paddingLeft: 0,
  },
  passwordIcon: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
}); 