/**
 * Theme and Font Types for NEONPRO
 * 
 * TypeScript definitions for theme system
 */

export interface ThemeInstallationRequest {
  registryUrl: string;
  targetDirectory: string;
  useCli: boolean;
  manualAdjustments: boolean;
}

export interface ThemeInstallationResponse {
  success: boolean;
  message: string;
  installationPath: string;
  filesCreated: string[];
  warnings: string[];
}

export interface ThemeConfigurationRequest {
  themeName: string;
  colorScheme: ColorScheme;
  fonts: FontConfiguration;
}

export interface ColorScheme {
  light: ColorPalette;
  dark: ColorPalette;
}

export interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  neonproPrimary?: string;
  neonproDeepBlue?: string;
  neonproAccent?: string;
}

export interface FontConfiguration {
  sans: FontDefinition;
  serif: FontDefinition;
  mono: FontDefinition;
}

export interface FontDefinition {
  family: string;
  source: 'local' | 'google' | 'cdn';
  weights: number[];
}