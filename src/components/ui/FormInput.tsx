import React from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';
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
  ...props 
}: FormInputProps) {
  return (
    <>
      <Text color="white" style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Feather 
          name={icon} 
          size={20} 
          color={theme.colors.lightGray} 
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
    marginLeft: 4,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
}); 