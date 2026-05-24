import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'RaanyVerseProperty',
  webDir: 'www',
  plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: '788458855289-ll2lt1poim3b89aulqvql7qf2aaheida.apps.googleusercontent.com',
    forceCodeForRefreshToken: true,
   },
  },
};

export default config;