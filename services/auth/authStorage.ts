// services/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

/**
 * Payload mínimo para extraer la fecha de expiración del JWT
 */
interface JwtPayload {
  exp: number
}

const STORAGE_KEYS = {
  DOMAIN:        '@fastman:domain',
  USERNAME:      '@fastman:username',
  EMPRESA:       '@fastman:empresaId',
  ACCESS:        '@fastman:accessToken',
  REFRESH:       '@fastman:refreshToken',
  ACCESS_EXP:    '@fastman:accessExp',     // timestamp de expiración (segundos)
  PERSONAL_ID:   '@fastman:personalId',
  PERSONAL_NAME: '@fastman:personalName',
  REMEMBER_ME:   '@fastman:rememberMe',
}

/**
 * Guarda la sesión completa tras login exitoso, incluyendo
 * accessToken, refreshToken y su fecha de expiración.
 */
export async function saveSession({
  domain,
  username,
  empresaId,
  accessToken,
  refreshToken,
  personalId,
  personalName,
}: {
  domain:        string
  username:      string
  empresaId:     number
  accessToken:   string
  refreshToken:  string
  personalId:    number
  personalName:  string
}) {
  // Extraemos la fecha de expiración (exp) del accessToken
  let exp = ''
  try {
    const { exp: expSec } = jwtDecode<JwtPayload>(accessToken)
    exp = String(expSec)
  } catch (e) {
    console.warn('[authStorage] No se pudo decodificar exp del JWT:', e)
  }

  // Guardamos todos los valores en AsyncStorage
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.DOMAIN,        domain],
    [STORAGE_KEYS.USERNAME,      username],
    [STORAGE_KEYS.EMPRESA,       String(empresaId)],
    [STORAGE_KEYS.ACCESS,        accessToken],
    [STORAGE_KEYS.REFRESH,       refreshToken],
    [STORAGE_KEYS.ACCESS_EXP,    exp],
    [STORAGE_KEYS.PERSONAL_ID,   String(personalId)],
    [STORAGE_KEYS.PERSONAL_NAME, personalName],
  ])

  console.log('[authStorage] Sesión guardada:', {
    domain, username, empresaId, accessExp: exp, personalId, personalName
  })
}

/**
 * Recupera la sesión almacenada o devuelve null si falta
 * accessToken o refreshToken (sesión inválida).
 */
export async function getCurrentSession(): Promise<{
  domain:        string
  username:      string
  empresaId:     number
  accessToken:   string
  refreshToken:  string
  accessExp:     number | null
  personalId:    number
  personalName:  string
} | null> {
  const stores = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS))
  const data   = Object.fromEntries(stores as [string, string][])
  const at     = data[STORAGE_KEYS.ACCESS]
  const rt     = data[STORAGE_KEYS.REFRESH]

  // Si falta cualquiera de los dos tokens, consideramos sesión inválida
  if (!at || !rt) {
    console.log('[authStorage] Access o refresh token faltante, sesión nula')
    return null
  }

  return {
    domain:       data[STORAGE_KEYS.DOMAIN]!,
    username:     data[STORAGE_KEYS.USERNAME]!,
    empresaId:    Number(data[STORAGE_KEYS.EMPRESA]!) || 0,
    accessToken:  at,
    refreshToken: rt,
    accessExp:    data[STORAGE_KEYS.ACCESS_EXP]!
                    ? Number(data[STORAGE_KEYS.ACCESS_EXP]!)
                    : null,
    personalId:   Number(data[STORAGE_KEYS.PERSONAL_ID]!) || 0,
    personalName: data[STORAGE_KEYS.PERSONAL_NAME]!,
  }
}

/**
 * Elimina **todos** los datos de sesión (tokens, user, domain, etc.).
 * Úsalo al hacer logout completo.
 */
export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS))
  console.log('[authStorage] Sesión y remember-me eliminados')
}

/**
 * Guarda o elimina flag de "Recuérdame"
 */
export async function setRememberMe(value: boolean): Promise<void> {
  if (value) {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
    console.log('[authStorage] RememberMe = true')
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
    console.log('[authStorage] RememberMe removed')
  }
}

/** Lee el flag de "Recuérdame" */
export async function getRememberMe(): Promise<boolean> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
  return val === 'true'
}

/**
 * Helpers para obtener individualmente los tokens o su expiración
 */
export const getAccessToken  = async (): Promise<string | null> => {
  const session = await getCurrentSession()
  return session?.accessToken ?? null
}
export const getRefreshToken = async (): Promise<string | null> => {
  const session = await getCurrentSession()
  return session?.refreshToken ?? null
}
export const getAccessExp    = async (): Promise<number | null> => {
  const session = await getCurrentSession()
  return session?.accessExp ?? null
}
