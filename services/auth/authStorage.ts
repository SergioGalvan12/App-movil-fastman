// Un pequeño helper para guardar y leer los datos de sesión
// services/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DOMAIN: '@fastman:domain',
  USERNAME: '@fastman:username',
  EMPRESA: '@fastman:empresaId',
  ACCESS: '@fastman:accessToken',
  PERSONAL_ID: '@fastman:personalId',
  PERSONAL_NAME: '@fastman:personalName',
};

/** Guarda la sesión completa tras login exitoso */
export async function saveSession({
  domain,
  username,
  empresaId,
  accessToken,
  personalId,
  personalName
}: {
  domain: string;
  username: string;
  empresaId: number;
  accessToken: string;
  personalId: number;
  personalName: string;
}) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.DOMAIN, domain],
    [STORAGE_KEYS.USERNAME, username],
    [STORAGE_KEYS.EMPRESA, String(empresaId)],
    [STORAGE_KEYS.ACCESS, accessToken],
    [STORAGE_KEYS.PERSONAL_ID, String(personalId)],
    [STORAGE_KEYS.PERSONAL_NAME, personalName],
  ]);
}

/** Recupera lo que haya en sesión (o null) */
export async function getCurrentSession(): Promise<{
  domain: string;
  username: string;
  empresaId: number;
  accessToken: string;
  personalId: number;
  personalName: string;
} | null> {
  const stores = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
  const data = Object.fromEntries(stores as [string, string][]);
  if (!data[STORAGE_KEYS.USERNAME]) return null;
  return {
    domain: data[STORAGE_KEYS.DOMAIN]!,
    username: data[STORAGE_KEYS.USERNAME]!,
    empresaId: Number(data[STORAGE_KEYS.EMPRESA]!) || 0,
    accessToken: data[STORAGE_KEYS.ACCESS]!,
    personalId: Number(data[STORAGE_KEYS.PERSONAL_ID]!) || 0,
    personalName: data[STORAGE_KEYS.PERSONAL_NAME]!,
  };
}
