const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  const config = require('./config.json');
  const envConfig = config[env];

  // Use native Object prototype and .keys method
  // to grab all keys from envConfig
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
