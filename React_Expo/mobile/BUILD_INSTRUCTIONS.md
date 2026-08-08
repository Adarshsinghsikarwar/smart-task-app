# APK Build & Deployment Instructions

This guide explains how to compile the **React Expo Mobile App** into an installable **APK** file for Android devices, and how it connects to the production backend.

---

## 1. How the App connects to the Backend

The API URL configuration is managed in `React_Expo/mobile/constants/Config.ts`. 

It is set up to dynamically detect the build type:
* **Development Mode (Expo Go):** Connects to your local machine IP (e.g., `http://192.168.x.x:5000/api`).
* **Production Mode (Standalone APK):** Connects directly to the live production server at `https://smart-task-app-backend.onrender.com/api`.

---

## 2. Step-by-Step APK Build Guide (EAS Build)

We use **EAS (Expo Application Services)** to compile the React Native project into a native Android APK.

### Prerequisites
1. An Expo account. If you do not have one, register at [expo.dev](https://expo.dev).
2. Install the EAS CLI globally on your machine:
   ```bash
   npm install -g eas-cli
   ```

### Execution Steps

#### Step 1: Login to Expo
Open your terminal, navigate to the mobile folder, and log in to your Expo account:
```bash
cd React_Expo/mobile
eas login
```

#### Step 2: Configure EAS
Initialize the EAS build setup in your project:
```bash
eas build:configure
```
* **Platform:** When prompted, select **Android** (or **All**).
* This command automatically creates an `eas.json` file in your root mobile directory.

#### Step 3: Configure `eas.json` for Direct APK Outputs
By default, EAS generates an `.aab` (Android App Bundle) which is required for publishing to the Google Play Store but cannot be installed directly on a test device.

To output a installable `.apk` file, open `eas.json` and add `"buildType": "apk"` under the `preview` profile:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

#### Step 4: Run the Build Command
Trigger the build using the `preview` profile:
```bash
eas build --platform android --profile preview
```

---

## 3. What happens next?

1. **Cloud Compilation:** EAS CLI will package your app assets and upload them to Expo's secure build servers.
2. **Build Monitoring:** The CLI will provide a web dashboard link where you can watch the build progress.
3. **Direct Installation:** Once the build succeeds, the terminal will print a **direct download link** and display a **QR code**.
4. **Install:** Scan the QR code with your Android phone's camera to download and install the **APK** directly!
