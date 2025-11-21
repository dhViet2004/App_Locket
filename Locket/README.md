# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Configure API environment

Expo makes any variable that starts with `EXPO_PUBLIC_` available in the app at build time, so we can safely point the frontend to different API domains without touching the source.

1. **Create a `.env` file** in the project root (same level as `package.json`) and add the backend URLs that match your current environment:

   ```
   EXPO_PUBLIC_API_URL=http://localhost:4000/api
   EXPO_PUBLIC_ANDROID_API_URL=http://10.0.2.2:4000/api
   ```

   When targeting a hosted backend, replace the values with your domain. For local development keep the defaults above—Android emulator needs the `10.0.2.2` loopback while iOS simulator/physical devices can reach `localhost`/`127.0.0.1` via Metro’s proxy.

2. **Restart Expo** (`npx expo start --clear`) whenever you change `.env`, because env variables are resolved at bundle time.

3. **Use the variables in code.** `src/config/api.ts` now auto-detects the platform and reads from `EXPO_PUBLIC_ANDROID_API_URL` on Android or `EXPO_PUBLIC_API_URL` elsewhere, so any service that imports from there will automatically pick up the correct domain.

4. **Share defaults without secrets.** Commit a `.env.example` (same content as above) so teammates know which keys to set, but keep your personal `.env` ignored (already covered in `.gitignore`).

