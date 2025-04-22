// services/configService.ts
export enum Environment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production'
  }
  
  interface EnvironmentConfig {
    apiBaseUrl: string;
    apiTimeout: number;
    debugMode: boolean;
  }
  
  const configurations: Record<Environment, EnvironmentConfig> = {
    [Environment.DEVELOPMENT]: {
      apiBaseUrl: 'http://192.168.100.32:8080/api',
      apiTimeout: 10000,
      debugMode: true
    },
    [Environment.PRODUCTION]: {
      apiBaseUrl: 'https://{domain}.fastman.io/api',
      apiTimeout: 30000,
      debugMode: false
    }
  };
  
  // Clase singleton para manejar la configuración
  class ConfigService {
    private static instance: ConfigService;
    private currentEnvironment: Environment = Environment.PRODUCTION;
    private domain: string = '';
  
    private constructor() {}
  
    public static getInstance(): ConfigService {
      if (!ConfigService.instance) {
        ConfigService.instance = new ConfigService();
      }
      return ConfigService.instance;
    }
  
    public setEnvironment(env: Environment): void {
      this.currentEnvironment = env;
      console.log(`Entorno configurado: ${env}`);
    }
  
    public setDomain(domain: string): void {
      this.domain = domain.trim().toLowerCase();
    }
  
    public getConfig(): EnvironmentConfig {
      return configurations[this.currentEnvironment];
    }
  
    public getApiBaseUrl(): string {
      if (this.currentEnvironment === Environment.PRODUCTION && this.domain) {
        return configurations[this.currentEnvironment].apiBaseUrl.replace('{domain}', this.domain);
      }
      return configurations[this.currentEnvironment].apiBaseUrl;
    }
  
    public isDevelopment(): boolean {
      return this.currentEnvironment === Environment.DEVELOPMENT;
    }
  
    public isProduction(): boolean {
      return this.currentEnvironment === Environment.PRODUCTION;
    }
  }
  
  export const configService = ConfigService.getInstance();
  export default configService;