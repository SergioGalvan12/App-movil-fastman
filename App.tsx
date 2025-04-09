import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (user: string, pass: string) => {
    // Simula login:
    if (user === 'test' && pass === '123') {
      setIsLoggedIn(true);
    } else {
      alert('Credenciales inválidas');
    }
  };

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <BottomTabNavigator />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}


