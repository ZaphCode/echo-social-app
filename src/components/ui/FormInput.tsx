import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TextInputProps, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import Text from './Text';

type FormInputProps = TextInputProps & {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  multiline?: boolean;
};

export default function FormInput({ 
  label, 
  icon, 
  multiline, 
  style,
  onFocus,
  onBlur,
  ...props 
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <Text color="white" style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused
      ]}>
        <Feather 
          name={icon} 
          size={20} 
          color={isFocused ? theme.colors.primaryBlue : theme.colors.lightGray} 
          style={styles.inputIcon} 
        />
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            style
          ]}
          placeholderTextColor={theme.colors.lightGray}
          multiline={multiline}
          onFocus={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.lightGray,
    marginBottom: 4,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: theme.colors.primaryBlue,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 12,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 24,
    padding: 0,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
}); 