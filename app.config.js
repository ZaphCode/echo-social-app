// Extends app.json with values that must not be committed.
// GOOGLE_MAPS_ANDROID_API_KEY (in .env, git-ignored) powers expo-maps on
// Android; without it the map renders blank there. iOS uses Apple Maps and
// needs no key.
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  if (!googleMapsApiKey) {
    console.warn(
      "[app.config] GOOGLE_MAPS_ANDROID_API_KEY is not set: maps will be blank on Android."
    );
    return config;
  }

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: { apiKey: googleMapsApiKey },
      },
    },
  };
};
