import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.debtpet.app',
  appName: 'DebtPayPet',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#7c3aed', // Brand primary color
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false // Set to true for debugging
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7c3aed',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#7c3aed'
    }
  }
};

export default config;
