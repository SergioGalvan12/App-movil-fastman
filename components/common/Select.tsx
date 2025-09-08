// components/common/Select.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface SelectProps<T> {
  options: T[];
  valueKey: keyof T;
  labelKey: keyof T;
  selectedValue: T[keyof T] | null;
  onValueChange: (value: T[keyof T] | null) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  errorStyle?: TextStyle;
}

export default function Select<T extends Record<string, any>>({
  options,
  valueKey,
  labelKey,
  selectedValue,
  onValueChange,
  placeholder = '— Selecciona —',
  loading = false,
  error = '',
  disabled = false,
  style,
  errorStyle,
}: SelectProps<T>) {
  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={[styles.wrapper, style]}>
      {error ? <Text style={[styles.error, errorStyle]}>{error}</Text> : null}

      <Picker
        selectedValue={selectedValue as any}
        onValueChange={(value) => onValueChange(value ?? null)}
        style={styles.picker}
        enabled={!disabled}
      >
        {/* placeholder con value = null */}
        <Picker.Item label={placeholder} value={null as any} />
        {options.map((opt, i) => (
          <Picker.Item key={i} label={String(opt[labelKey])} value={opt[valueKey] as any} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1B2A56',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  picker: {
    height: 60,
  },
  loader: {
    marginVertical: 10,
  },
  error: {
    color: '#E53935',
    fontSize: 12,
    padding: 4,
  },
});
