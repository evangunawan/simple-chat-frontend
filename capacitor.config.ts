import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'simple-chat-frontend',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
