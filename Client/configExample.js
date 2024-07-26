import Constants from 'expo-constants';

const ENV = {
  dev: {
    SERVER_URL: 'http://(ip):3000', // replace (ip) with your local ip address
    SOCKET_URL: 'http://(ip):3001', // replace (ip) with your local ip address
  },
  staging: {
    SERVER_URL: 'https://staging-server-url.com',
    SOCKET_URL: 'https://staging-socket-url.com',
  },
  prod: {
    SERVER_URL: 'https://prod-server-url.com',
    SOCKET_URL: 'https://prod-socket-url.com',
  },
};

const getEnvVars = (env = Constants.expoConfig.releaseChannel) => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'prod') {
    return ENV.prod;
  }
};

export default getEnvVars;