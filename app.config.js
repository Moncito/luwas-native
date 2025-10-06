import 'dotenv/config';

export default {
  expo: {
    name: "luwas-mobile",
    slug: "luwas-mobile",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios", "android", "web"],
    sdkVersion: "54.0.0",
    scheme: "luwasmobile", // deep link scheme
    android: {
      package: "com.luwas.travelapp",
    },
    ios: {
      bundleIdentifier: "com.luwas.travelapp",
    },

    extra: {
      // ✅ Google OAuth IDs
      GOOGLE_EXPO_CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID,
      GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,

      // ✅ Facebook OAuth
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,

      // ✅ Expo EAS project link (keep for later if you go paid dev account)
      eas: {
        projectId: "56d069e9-1296-4aee-8a0f-cb743549a0dd",
      },
    },
    "plugins":[
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.1030258873457-h44abd9qhpkt229gqkqkmd0t65soq707"
        }
      ]
    ]
  },
};
