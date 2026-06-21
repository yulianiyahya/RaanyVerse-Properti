import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.raanyverse.properti',
  appName: 'RaanyVerseProperty',
  webDir: 'www',
  plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    serverClientId: '359478724727-557h4ugugks06fb0ge6ciqebb6g5rl5n.apps.googleusercontent.com',
    forceCodeForRefreshToken: true,
   },
  },
};

export default config;