import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

interface SearchInputProps {
  placeholder?: string;
}

const SearchInput = ({ placeholder = "" }: SearchInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Búsqueda</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    height: 48,
    width: 350,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  input: {
    fontSize: 12,
    paddingHorizontal: 10,
    color: '#212121',
    height: '100%',
  },
});

export default SearchInput;