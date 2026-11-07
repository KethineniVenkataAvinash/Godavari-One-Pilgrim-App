# Godavari One Pilgrim — Android Studio project

This is an independent copy. The original `godavari-one` portal and app remain in their original folder. Changes here do not automatically change the original project.

## Open in Android Studio

Open the **android** subfolder (the one containing `settings.gradle`), not the outer React source folder. Alternatively, double-click **Open Android Studio.cmd**. Let Gradle sync finish, select the **app** run configuration, choose an emulator or connected Android phone, then click Run.

The installed app is named **Godavari One Pilgrim**, package ID `com.godavarione.pilgrim`. Minimum Android version: 7.0 (API 24). This project uses Capacitor 8, Android SDK 36, and the Java runtime bundled with Android Studio. Use Android Studio 2025.2.1 or newer.

## Update the app after editing

Double-click **Update Android App.cmd**, or run `npm run android:sync` in this folder. This builds the frontend and copies it to the Android project. Rebuild/run in Android Studio afterward. For a fresh checkout, run `npm ci` first.

## Build a test APK

Double-click **Build Debug APK.cmd**. Output: `android/app/build/outputs/apk/debug/app-debug.apk`. This is a debug build for testing, not a signed Play Store release. The first build requires internet for Gradle and Android dependencies.

## Backend and internet

The app's interface is packaged into the APK; it does not load the portal from a browser address. Local profile, welcome flow and personal tools run on the device. Weather, maps and other external content require internet. Server-based assistant, queues, shared incidents and event streams require a reachable backend.

Set `VITE_API_BASE_URL` in `.env` to your backend origin, then run `npm run android:sync`. Use HTTPS for deployment. The backend must allow requests from the Capacitor origin `https://localhost`, including API methods/headers and server-sent events. Never put Gemini keys or other secrets in any `VITE_` variable: these are compiled into the APK.

For Android Emulator testing, the laptop host is `10.0.2.2`; on a physical phone, `localhost` means the phone itself. Existing development connection settings are retained. Production deployment requires HTTPS, real authentication, and an authorized server. Local demo accounts are not SMS verification or a production identity system.

## Preserved features and limits

The copied Pilgrim UI includes the welcome/language/login flow, profile photo editor, family tools and live weather component. Device permissions, file picking, GPS, audio, external links and navigation should be tested on a real device before distributing the app. Native build results are recorded in `BUILD-STATUS.md`.

## Useful files

- `src/`: copied React application and models
- `public/`: images, logos and icons
- `capacitor.config.ts`: Android app identity and bundled asset directory
- `android/`: actual Android Studio project, Gradle wrapper, manifest and Java activity
- `android/local.properties`: laptop-specific SDK path; regenerate on another computer

Official workflow reference: https://capacitorjs.com/docs/android
