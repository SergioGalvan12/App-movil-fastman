import React, { useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../src/navigation/types';
import { checkDomain } from '../../services/auth/authService';
import { showToast } from '../../services/notifications/ToastService';
import apiClient, { clearAuthToken } from '../../services/apiClient';
import { getCurrentSession, getRememberMe } from '../../services/auth/authStorage';
import { REQUIRE_DOMAIN_INPUT, DEFAULT_DOMAIN, LOCKED_DOMAIN } from '@env';

import { ScreenContainer } from '../../src/ui/ScreenContainer/ScreenContainer';
import { AppInput } from '../../src/ui/AppInput/AppInput';
import { AppButton } from '../../src/ui/AppButton/AppButton';
import { AuthLayout } from '../../src/ui/AuthLayout/AuthLayout';

type DomainScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Domain'>;
type Props = { navigation: DomainScreenNavigationProp };

export default function DomainScreen({ navigation }: Props) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const requireDomain = String(REQUIRE_DOMAIN_INPUT).toLowerCase() === 'true';

      if (!requireDomain) {
        const auto = (LOCKED_DOMAIN || DEFAULT_DOMAIN || '').trim().toLowerCase();

        if (auto) {
          apiClient.setDomain(auto);
        }

        clearAuthToken();
        navigation.replace('User', { domain: auto || 'local', username: '' });
        return;
      }

      const remember = await getRememberMe();
      if (remember) {
        const session = await getCurrentSession();

        if (session) {
          navigation.replace('Password', {
            domain: session.domain,
            username: session.username,
            empresaId: session.empresaId,
          });
        }
      }
    })();
  }, [navigation]);

  const handleNext = async () => {
    const raw = domain.trim().toLowerCase();

    if (!raw) {
      const message = 'Por favor ingresa el dominio de tu empresa';
      setError(message);
      showToast('error', 'Dominio requerido', message);
      return;
    }

    setError('');

    if (raw === 'local') {
      apiClient.setDomain('local');
      clearAuthToken();
      navigation.navigate('User', { domain: raw, username: '' });
      return;
    }

    setLoading(true);

    try {
      apiClient.setDomain(raw);
      clearAuthToken();

      const result = await checkDomain(raw);

      if (result.success) {
        navigation.navigate('User', { domain: raw, username: '' });
      } else {
        const message = `El dominio "${raw}" no existe en Fastman.io`;
        setError(message);
        showToast('error', 'Dominio no registrado', message);
      }
    } catch (err) {
      const message = 'Error al verificar el dominio, revisa dominio.';
      setError(message);
      showToast('error', message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AuthLayout title="Iniciar sesión">
        <AppInput
          label="Dominio de la empresa"
          value={domain}
          placeholder="Ingresa el dominio (ej: gpp)"
          onChangeText={(text) => {
            setDomain(text);
            if (error) setError('');
          }}
          autoCapitalize="none"
          keyboardType="url"
          editable={!loading}
          error={error}
        />

        <AppButton
          title="Siguiente"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
        />
      </AuthLayout>
    </ScreenContainer>
  );
}